const express = require('express');
const SSLCommerzPayment = require('sslcommerz-lts');
const connectDB = require('../db');
const router = express.Router();

const store_id = "abc6912282a8d00c";
const store_passwd = "abc6912282a8d00c@ssl";
const is_live = false;

// ===================== Initialize Payment =====================
router.post('/', async (req, res) => {
  try {
    const order = req.body;

    // Save order to MongoDB
    const db = await connectDB();
    await db.collection('o_payment').insertOne({
      ...order,
      status: 'pending',
      createdAt: new Date(),
    });

    const tran_id = 'TEST' + Date.now();
    const data = {
      total_amount: order.quantity * 100 || 100,
      currency: 'BDT',
      tran_id,
      success_url: 'https://backend-for-shateaci.vercel.app/api/payment/payment-success',
      fail_url: 'https://backend-for-shateaci.vercel.app/api/payment/payment-fail',
      cancel_url: 'https://backend-for-shateaci.vercel.app/api/payment/payment-cancel',
      ipn_url: 'https://backend-for-shateaci.vercel.app/api/payment/ipn',
      shipping_method: 'Courier',
      product_name: 'Test Product',
      product_category: 'General',
      product_profile: 'general',
      cus_name: order.name || 'Test Customer',
      cus_email: order.email || 'test@example.com',
      cus_add1: order.address || 'Dhaka',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: order.phone || '01711111111',

      // Required shipping fields
      ship_name: order.name || 'Test Customer',
      ship_add1: order.address || 'Dhaka',
      ship_city: 'Dhaka',
      ship_country: 'Bangladesh',
      ship_postcode: '1000',
      ship_phone: order.phone || '01711111111',
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    console.log("SSLCommerz Response:", apiResponse);
    res.json({ success: true, GatewayPageURL: apiResponse.GatewayPageURL });
  } catch (err) {
    console.error("Payment Error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===================== Payment Success =====================
router.post('/payment-success', (req, res) => {
  console.log('Payment Success Data:', req.body);
  res.redirect('https://sateachi-com.vercel.app/success');
});

// ===================== Payment Fail =====================
router.post('/payment-fail', (req, res) => {
  console.log('Payment Failed:', req.body);
  res.send(`<h1 class="text-danger text-center mt-5">Payment Failed! Try again.</h1>`);
});

// ===================== Payment Cancel =====================
router.post('/payment-cancel', (req, res) => {
  console.log('Payment Cancelled:', req.body);
  res.send(`<h1 class="text-warning text-center mt-5">Payment Cancelled!</h1>`);
});

/* ================= GET ALL ORDERS ================= */
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();

    // Optional: fetch o_payment collection too
    const payments = await db.collection("o_payment").find().toArray();

    // Merge both arrays
    const allOrders = [...payments];

    res.json(allOrders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching orders" });
  }
});


module.exports = router;