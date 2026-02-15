const express = require("express");
const { getContracts } = require("../contracts");

const router = express.Router();

/**
 * GET /api/campaigns/config
 * Contract address + ABI for CampaignLedger (for frontend/shadcn with user wallet).
 */
router.get("/config", (req, res) => {
  try {
    const { getFrontendConfig } = require("../loadDeployments");
    const network = process.env.NETWORK || "localhost";
    const config = getFrontendConfig(network);
    if (!config) return res.status(503).json({ error: "Deployments not loaded" });
    res.json(config.contracts.CampaignLedger);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/campaigns/count
 */
router.get("/count", async (req, res) => {
  try {
    const { CampaignLedgerReadOnly } = getContracts();
    const count = await CampaignLedgerReadOnly.campaignCounter();
    res.json({ count: Number(count) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/campaigns/ngo/:ngoId
 * Get campaign IDs for an NGO (must be before /:id).
 */
router.get("/ngo/:ngoId", async (req, res) => {
  try {
    const ngoId = req.params.ngoId;
    const { CampaignLedgerReadOnly } = getContracts();
    const ids = await CampaignLedgerReadOnly.getCampaignIdsByNGO(ngoId);
    res.json({ campaignIds: ids.map((i) => Number(i)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/campaigns/:id/active
 * Check if campaign is active.
 */
router.get("/:id/active", async (req, res) => {
  try {
    const id = req.params.id;
    const { CampaignLedgerReadOnly } = getContracts();
    const isActive = await CampaignLedgerReadOnly.isCampaignActive(id);
    res.json({ campaignId: Number(id), isActive });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/campaigns/:id
 * Get campaign by ID.
 */
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { CampaignLedgerReadOnly } = getContracts();
    const [campaignId, ngoId, title, description, startDate, endDate, isActive] =
      await CampaignLedgerReadOnly.getCampaignById(id);
    res.json({
      campaignId: Number(campaignId),
      ngoId: Number(ngoId),
      title,
      description,
      startDate: Number(startDate),
      endDate: Number(endDate),
      isActive,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/campaigns/deactivate
 * Body: { campaignId: number }
 * Deactivate campaign (verified NGO only). Requires PRIVATE_KEY to be the NGO wallet.
 */
router.post("/deactivate", async (req, res) => {
  try {
    const { campaignId } = req.body;
    if (campaignId == null) return res.status(400).json({ error: "campaignId required" });
    const { CampaignLedger } = getContracts();
    const tx = await CampaignLedger.deactivateCampaign(campaignId);
    await tx.wait();
    res.json({ success: true, campaignId, txHash: tx.hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
