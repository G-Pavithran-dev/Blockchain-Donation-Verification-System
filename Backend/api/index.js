require("dotenv").config();
const express = require("express");
const cors = require("cors");
const ngoRoutes = require("./routes/ngo");
const campaignRoutes = require("./routes/campaigns");
const donationRoutes = require("./routes/donations");
const { getFrontendConfig } = require("./loadDeployments");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

/**
 * Health and config for frontend (shadcn/ui).
 * GET /api/config returns all contract addresses + ABIs so the frontend
 * can use ethers/viem with the user's wallet for:
 * - registerNGO, createCampaign, recordDonation (user-signed txs).
 */
app.get("/api/config", (req, res) => {
  try {
    const network = process.env.NETWORK || "localhost";
    const config = getFrontendConfig(network);
    if (!config) return res.status(503).json({ error: "Deployments not loaded. Run deploy script first." });
    res.json(config);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use("/api/ngo", ngoRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/donations", donationRoutes);

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "civictrust-api" });
});

app.listen(PORT, () => {
  console.log(`CivicTrust API running at http://localhost:${PORT}`);
  console.log(`  GET  /api/config     - contract addresses + ABIs for frontend`);
  console.log(`  GET  /api/ngo/*      - VerificationLedger read/admin`);
  console.log(`  GET  /api/campaigns/* - CampaignLedger read`);
  console.log(`  GET  /api/donations/* - DonationLedger read`);
});
