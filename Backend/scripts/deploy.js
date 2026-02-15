const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deployment script for CivicTrust contracts.
 * Deploys: VerificationLedger → CampaignLedger → DonationLedger
 * Writes addresses and ABIs to deployments/ for the Node API and shadcn/ui frontend.
 */

const DEPLOYMENTS_DIR = path.join(__dirname, "..", "deployments");
const FRONTEND_ARTIFACTS_DIR = path.join(__dirname, "..", "api", "contracts");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getArtifact(name) {
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    `${name}.sol`,
    `${name}.json`
  );
  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}

async function main() {
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0]; // Account #0 (e.g. first Hardhat node account)
  const network = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId.toString();

  console.log("Deploying with Account #0:", deployer.address);
  console.log("Network:", network, "ChainId:", chainId);

  ensureDir(DEPLOYMENTS_DIR);
  ensureDir(FRONTEND_ARTIFACTS_DIR);

  // 1. Deploy VerificationLedger
  console.log("\nDeploying VerificationLedger...");
  const VerificationLedger = await hre.ethers.getContractFactory("VerificationLedger");
  const verificationLedger = await VerificationLedger.deploy();
  await verificationLedger.waitForDeployment();
  const verificationLedgerAddress = await verificationLedger.getAddress();
  console.log("VerificationLedger deployed to:", verificationLedgerAddress);

  // 2. Deploy CampaignLedger
  console.log("\nDeploying CampaignLedger...");
  const CampaignLedger = await hre.ethers.getContractFactory("CampaignLedger");
  const campaignLedger = await CampaignLedger.deploy(verificationLedgerAddress);
  await campaignLedger.waitForDeployment();
  const campaignLedgerAddress = await campaignLedger.getAddress();
  console.log("CampaignLedger deployed to:", campaignLedgerAddress);

  // 3. Deploy DonationLedger
  console.log("\nDeploying DonationLedger...");
  const DonationLedger = await hre.ethers.getContractFactory("DonationLedger");
  const donationLedger = await DonationLedger.deploy(campaignLedgerAddress);
  await donationLedger.waitForDeployment();
  const donationLedgerAddress = await donationLedger.getAddress();
  console.log("DonationLedger deployed to:", donationLedgerAddress);

  const addresses = {
    chainId,
    network,
    deployer: deployer.address,
    VerificationLedger: verificationLedgerAddress,
    CampaignLedger: campaignLedgerAddress,
    DonationLedger: donationLedgerAddress,
  };

  const networkDir = path.join(DEPLOYMENTS_DIR, network);
  ensureDir(networkDir);
  const addressesPath = path.join(networkDir, "addresses.json");
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("\nAddresses written to:", addressesPath);

  // Copy ABIs for API and frontend (shadcn/ui)
  const contracts = ["VerificationLedger", "CampaignLedger", "DonationLedger"];
  const abis = {};
  for (const name of contracts) {
    const artifact = getArtifact(name);
    abis[name] = artifact.abi;
  }
  const abiPath = path.join(FRONTEND_ARTIFACTS_DIR, "abis.json");
  fs.writeFileSync(abiPath, JSON.stringify(abis, null, 2));
  console.log("ABIs written to:", abiPath);

  const all = { addresses, abis };
  const allPath = path.join(networkDir, "deployments.json");
  fs.writeFileSync(allPath, JSON.stringify(all, null, 2));
  console.log("Full deployments (addresses + ABIs) written to:", allPath);

  console.log("\nDeployment complete.");
  return addresses;
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
