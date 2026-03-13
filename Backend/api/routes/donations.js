const express = require("express");
const Razorpay = require("razorpay");
const { getContracts } = require("../contracts");

const router = express.Router();

// Optional Razorpay client (configured when env vars are set)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

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
    res.json({
      ledger: config.contracts.DonationLedger,
      razorpay: razorpay
        ? { keyId: process.env.RAZORPAY_KEY_ID }
        : null,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/donations/razorpay/order
 * Body: { amountInr: number, campaignId: number }
 * Creates a Razorpay order in INR (amount in rupees).
 */
router.post("/razorpay/order", async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: "Razorpay is not configured on the server" });
    }

    const { amountInr, campaignId } = req.body;
    const value = Number(amountInr);
    if (!value || !isFinite(value) || value <= 0) {
      return res.status(400).json({ error: "Valid amountInr is required" });
    }

    const amountPaise = Math.round(value * 100);

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      notes: {
        campaignId: String(campaignId ?? ""),
      },
    });

    res.json(order);
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
