const { ethers } = require("ethers");
const { loadDeployments } = require("./loadDeployments");

const NETWORK = process.env.NETWORK || "localhost";
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const NGO_PRIVATE_KEY = process.env.NGO_PRIVATE_KEY || "";
const DONOR_PRIVATE_KEY = process.env.DONOR_PRIVATE_KEY || "";

let provider;
let adminSigner;
let ngoSigner;
let donorSigner;
let contracts = null;

function getProvider() {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  return provider;
}

/** Signer for admin actions (verify/reject NGO, transfer admin). Use Account #0 key after deploy. */
function getAdminSigner() {
  if (!adminSigner) {
    if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY is required for admin write operations");
    adminSigner = new ethers.Wallet(PRIVATE_KEY, getProvider());
  }
  return adminSigner;
}

/** Signer for NGO actions (create campaign, deactivate campaign). Set NGO_PRIVATE_KEY in .env to update. */
function getNGOSigner() {
  if (!ngoSigner) {
    if (!NGO_PRIVATE_KEY) throw new Error("NGO_PRIVATE_KEY is required for campaign write operations");
    ngoSigner = new ethers.Wallet(NGO_PRIVATE_KEY, getProvider());
  }
  return ngoSigner;
}

/** Signer for donor actions (record donation). Set DONOR_PRIVATE_KEY in .env to update. */
function getDonorSigner() {
  if (!donorSigner) {
    if (!DONOR_PRIVATE_KEY) throw new Error("DONOR_PRIVATE_KEY is required for record donation");
    donorSigner = new ethers.Wallet(DONOR_PRIVATE_KEY, getProvider());
  }
  return donorSigner;
}

function getContracts() {
  if (contracts) return contracts;
  const data = loadDeployments(NETWORK);
  if (!data) {
    throw new Error(
      `Deployments not found for network: ${NETWORK}. Run: npx hardhat run scripts/deploy.js --network ${NETWORK}`
    );
  }
  const { addresses, abis } = data;
  const prov = getProvider();
  const admin = PRIVATE_KEY ? getAdminSigner() : prov;
  const ngo = NGO_PRIVATE_KEY ? getNGOSigner() : prov;
  const donor = DONOR_PRIVATE_KEY ? getDonorSigner() : prov;

  contracts = {
    VerificationLedger: new ethers.Contract(
      addresses.VerificationLedger,
      abis.VerificationLedger,
      admin
    ),
    VerificationLedgerReadOnly: new ethers.Contract(
      addresses.VerificationLedger,
      abis.VerificationLedger,
      prov
    ),
    CampaignLedger: new ethers.Contract(
      addresses.CampaignLedger,
      abis.CampaignLedger,
      ngo
    ),
    CampaignLedgerReadOnly: new ethers.Contract(
      addresses.CampaignLedger,
      abis.CampaignLedger,
      prov
    ),
    DonationLedger: new ethers.Contract(
      addresses.DonationLedger,
      abis.DonationLedger,
      donor
    ),
    DonationLedgerReadOnly: new ethers.Contract(
      addresses.DonationLedger,
      abis.DonationLedger,
      prov
    ),
    addresses,
  };
  return contracts;
}

module.exports = {
  getContracts,
  getProvider,
  getAdminSigner,
  getNGOSigner,
  getDonorSigner,
};
