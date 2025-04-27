const express = require('express');
const router = express.Router();

router.post('/generate-esewa-signature', (req, res) => {
  try {
    const { total_amount, transaction_uuid, product_code } = req.body;

    if (!total_amount || !transaction_uuid || !product_code) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🟢 No signature logic needed — just return a dummy value for demo purposes
    res.json({ signature: "demo-signature-not-used" });
  } catch (err) {
    console.error("Fake signature endpoint failed:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

module.exports = router;
