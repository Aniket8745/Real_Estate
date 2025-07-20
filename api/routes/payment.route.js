// routes/payment.route.js
import express from 'express';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

router.post('/order', async (req, res) => {
  const { amount } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: 'receipt_' + Math.random(),
    });
    res.json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
});

router.post('/verifyOrder', async (req, res) => {
  // You can add signature verification here using Razorpay SDK
  const { paymentId, orderId, listingId } = req.body;

  // Assume verified for demo
  res.json({ message: 'Payment verified and listing ID ' + listingId + ' will be updated.' });
});

export default router;
