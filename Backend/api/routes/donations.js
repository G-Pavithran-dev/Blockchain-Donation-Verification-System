const express = require("express");
const { getContracts } = require("../contracts");

const router = express.Router();

/**
 * GET /api/donations/config
 * Contract address + ABI for DonationLedger (for frontend/shadcn with user wallet).
 */
router.get("/config", (req, res) => {
  try {
    const { getFrontendConfig } = require("../loadDeployments");
    const network = process.env.NETWORK || "localhost";
    const config = getFrontendConfig(network);
    if (!config) return res.status(503).json({ error: "Deployments not loaded" });
    res.json(config.contracts.DonationLedger);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/donations/count
 */
router.get("/count", async (req, res) => {
  try {
    const { DonationLedgerReadOnly } = getContracts();
    const count = await DonationLedgerReadOnly.donationCounter();
    res.json({ count: Number(count) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/donations/campaign/:campaignId
 * Get donation IDs for a campaign (must be before /:id).
 */
router.get("/campaign/:campaignId", async (req, res) => {
  try {
    const campaignId = req.params.campaignId;
    const { DonationLedgerReadOnly } = getContracts();
    const ids = await DonationLedgerReadOnly.getDonationsByCampaign(campaignId);
    res.json({ donationIds: ids.map((i) => Number(i)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/donations/:id
 * Get donation by ID.
 */
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { DonationLedgerReadOnly } = getContracts();
    const [donationId, campaignId, donor, amount, transactionRef, timestamp] =
      await DonationLedgerReadOnly.getDonationById(id);
    res.json({
      donationId: Number(donationId),
      campaignId: Number(campaignId),
      donor,
      amount: amount.toString(),
      transactionRef,
      timestamp: Number(timestamp),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/donations/record
 * Body: { campaignId: number, amount: string (wei), transactionRef: string }
 * Record a donation (caller = donor). Requires PRIVATE_KEY to be the donor wallet.
 */
router.post("/record", async (req, res) => {
  try {
    const { campaignId, amount, transactionRef } = req.body;
    if (campaignId == null || amount == null || transactionRef == null)
      return res.status(400).json({ error: "campaignId, amount, transactionRef required" });
    const { DonationLedger } = getContracts();
    const tx = await DonationLedger.recordDonation(campaignId, amount, transactionRef);
    await tx.wait();
    res.json({ success: true, campaignId, txHash: tx.hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
