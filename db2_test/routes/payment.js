const express = require("express");
const router = express.Router();
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post(
  "/process",
  catchAsyncErrors(async (req, res, next) => {
    let { amount } = req.body;
    if (amount < 5000) {
      amount = 5000;
    }
    const myPayment = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: "inr",
      metadata: { company: "marketplace" },
    });
    res.status(200).json({
      success: true,
      client_secret: myPayment.client_secret,
    });
  })
);

module.exports = router;
