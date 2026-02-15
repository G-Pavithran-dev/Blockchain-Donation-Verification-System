const fs = require("fs");
const path = require("path");

const DEPLOYMENTS_DIR = path.join(__dirname, "..", "deployments");
const CONTRACTS_DIR = path.join(__dirname, "contracts");

/**
 * Load deployment addresses for the given network.
 * @param {string} network - e.g. "localhost", "hardhat", "sepolia"
 * @returns {{ addresses: object, abis: object } | null }
 */
function loadDeployments(network) {
  const addressesPath = path.join(DEPLOYMENTS_DIR, network, "addresses.json");
  const abisPath = path.join(CONTRACTS_DIR, "abis.json");

  if (!fs.existsSync(addressesPath)) {
    console.warn(`No addresses found for network: ${network} at ${addressesPath}`);
    return null;
  }
  if (!fs.existsSync(abisPath)) {
    console.warn(`No ABIs found at ${abisPath}. Run deploy script first.`);
    return null;
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  const abis = JSON.parse(fs.readFileSync(abisPath, "utf8"));
  return { addresses, abis };
}

/**
 * Get contract addresses and ABIs for frontend (e.g. shadcn/ui).
 * Use this so the frontend can build transactions with the user's wallet.
 */
function getFrontendConfig(network) {
  const data = loadDeployments(network);
  if (!data) return null;
  return {
    chainId: data.addresses.chainId,
    network: data.addresses.network,
    contracts: {
      VerificationLedger: {
        address: data.addresses.VerificationLedger,
        abi: data.abis.VerificationLedger,
      },
      CampaignLedger: {
        address: data.addresses.CampaignLedger,
        abi: data.abis.CampaignLedger,
      },
      DonationLedger: {
        address: data.addresses.DonationLedger,
        abi: data.abis.DonationLedger,
      },
    },
  };
}

module.exports = { loadDeployments, getFrontendConfig };
