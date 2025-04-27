// esewaRoute.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const ESEWA_SECRET_KEY = "8gBm/:&EnhH.1/q"; // UAT (test) secret key

router.post('/generate-esewa-signature', (req, res) => {
  try {
    const { total_amount, transaction_uuid, product_code } = req.body;

    if (!total_amount || !transaction_uuid || !product_code) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const raw = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hmac = crypto.createHmac('sha256', ESEWA_SECRET_KEY);
    hmac.update(raw);
    const signature = hmac.digest('base64');

    res.json({ signature });
  } catch (err) {
    console.error("Signature generation failed:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

module.exports = router;
