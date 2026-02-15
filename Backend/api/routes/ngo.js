const express = require("express");
const { getContracts } = require("../contracts");

const router = express.Router();

/**
 * GET /api/ngo/config
 * Returns contract address + ABI for VerificationLedger (for frontend/shadcn to use with user wallet).
 */
router.get("/config", (req, res) => {
  try {
    const { getFrontendConfig } = require("../loadDeployments");
    const network = process.env.NETWORK || "localhost";
    const config = getFrontendConfig(network);
    if (!config) return res.status(503).json({ error: "Deployments not loaded" });
    res.json(config.contracts.VerificationLedger);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/ngo/admin
 * Ledger admin address (read-only).
 */
router.get("/admin", async (req, res) => {
  try {
    const { VerificationLedgerReadOnly } = getContracts();
    const admin = await VerificationLedgerReadOnly.admin();
    res.json({ admin });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/ngo/count
 * Total number of registered NGOs.
 */
router.get("/count", async (req, res) => {
  try {
    const { VerificationLedgerReadOnly } = getContracts();
    const ngoCounter = await VerificationLedgerReadOnly.ngoCounter();
    res.json({ count: Number(ngoCounter) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/ngo/list
 * List all NGOs (admin only on-chain; API uses backend signer if PRIVATE_KEY is admin).
 */
router.get("/list", async (req, res) => {
  try {
    const { VerificationLedger } = getContracts();
    const list = await VerificationLedger.listOfNGOs();
    const ngos = list.map((n) => ({
      ngoId: Number(n.ngoId),
      name: n.name,
      registrationNumber: n.registrationNumber,
      panCardNumber: n.panCardNumber,
      walletAddress: n.walletAddress,
      isVerified: n.isVerified,
      exists: n.exists,
    }));
    res.json({ ngos });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/ngo/id/:id
 * Get NGO by ID.
 */
router.get("/id/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { VerificationLedgerReadOnly } = getContracts();
    const [ngoId, name, registrationNumber, panCardNumber, isVerified] =
      await VerificationLedgerReadOnly.getNGOById(id);
    res.json({
      id: Number(ngoId),
      name,
      registrationNumber,
      panCardNumber,
      isVerified,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/ngo/wallet/:address
 * Get NGO by wallet address.
 */
router.get("/wallet/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const { VerificationLedgerReadOnly } = getContracts();
    const [id, name, registrationNumber, panCardNumber, isVerified] =
      await VerificationLedgerReadOnly.getNGOByWalletAddress(address);
    res.json({
      id: Number(id),
      name,
      registrationNumber,
      panCardNumber,
      isVerified,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/ngo/registration/:number
 * Get NGO by registration number.
 */
router.get("/registration/:number", async (req, res) => {
  try {
    const number = req.params.number;
    const { VerificationLedgerReadOnly } = getContracts();
    const [id, name, registrationNumber, panCardNumber, isVerified] =
      await VerificationLedgerReadOnly.getNGOByRegistrationNumber(number);
    res.json({
      id: Number(id),
      name,
      registrationNumber,
      panCardNumber,
      isVerified,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/ngo/pan/:pan
 * Get NGO by PAN card number.
 */
router.get("/pan/:pan", async (req, res) => {
  try {
    const pan = req.params.pan;
    const { VerificationLedgerReadOnly } = getContracts();
    const [id, name, registrationNumber, panCardNumber, isVerified] =
      await VerificationLedgerReadOnly.getNGOByPanCardNumber(pan);
    res.json({
      id: Number(id),
      name,
      registrationNumber,
      panCardNumber,
      isVerified,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/ngo/verify
 * Body: { ngoId: number }
 * Verify an NGO (admin only). Requires PRIVATE_KEY to be the admin.
 */
router.post("/verify", async (req, res) => {
  try {
    const { ngoId } = req.body;
    if (ngoId == null) return res.status(400).json({ error: "ngoId required" });
    const { VerificationLedger } = getContracts();
    const tx = await VerificationLedger.verifyNGO(ngoId);
    await tx.wait();
    res.json({ success: true, ngoId, txHash: tx.hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/ngo/reject
 * Body: { ngoId: number }
 * Reject/remove an NGO (admin only).
 */
router.post("/reject", async (req, res) => {
  try {
    const { ngoId } = req.body;
    if (ngoId == null) return res.status(400).json({ error: "ngoId required" });
    const { VerificationLedger } = getContracts();
    const tx = await VerificationLedger.rejectNGO(ngoId);
    await tx.wait();
    res.json({ success: true, ngoId, txHash: tx.hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/ngo/transfer-admin
 * Body: { newAdmin: string (address) }
 * Transfer admin to another address (admin only).
 */
router.post("/transfer-admin", async (req, res) => {
  try {
    const { newAdmin } = req.body;
    if (!newAdmin) return res.status(400).json({ error: "newAdmin required" });
    const { VerificationLedger } = getContracts();
    const tx = await VerificationLedger.transferAdmin(newAdmin);
    await tx.wait();
    res.json({ success: true, newAdmin, txHash: tx.hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
