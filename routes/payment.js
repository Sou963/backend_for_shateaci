const express = require("express");
const SSLCommerzPayment = require("sslcommerz-lts");
const connectDB = require("../db");
const router = express.Router();

const store_id = process.env.SSLCOMMERZ_STORE_ID || "abc6912282a8d00c";
const store_passwd = process.env.SSLCOMMERZ_STORE_PASS || "abc6912282a8d00c@ssl";
const is_live = process.env.SSLCOMMERZ_IS_LIVE === "true";

function getBaseUrl(req) {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = (
    Array.isArray(forwardedProto)
      ? forwardedProto[0]
      : forwardedProto || req.protocol || "https"
  )
    .split(",")[0]
    .trim();
  const forwardedHost = req.headers["x-forwarded-host"];
  const host =
    (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ||
    req.headers.host;
  return process.env.BASE_URL || `${proto}://${host}`;
}

// ===================== Initialize Payment =====================
router.post("/", async (req, res) => {
  try {
    const order = req.body;

    // Save order to MongoDB
    const db = await connectDB();
    await db.collection("o_payment").insertOne({
      ...order,
      status: "pending",
      createdAt: new Date(),
    });

    const tran_id = "TEST" + Date.now();
    const baseUrl = getBaseUrl(req);
    const data = {
      total_amount: order.quantity * 100 || 100,
      currency: "BDT",
      tran_id,
      success_url: `${baseUrl}/api/payment/payment-success`,
      fail_url: `${baseUrl}/api/payment/payment-fail`,
      cancel_url: `${baseUrl}/api/payment/payment-cancel`,
      ipn_url: `${baseUrl}/api/payment/ipn`,
      shipping_method: "Courier",
      product_name: "Test Product",
      product_category: "General",
      product_profile: "general",
      cus_name: order.name || "Test Customer",
      cus_email: order.email || "test@example.com",
      cus_add1: order.address || "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: order.phone || "01711111111",

      // Required shipping fields
      ship_name: order.name || "Test Customer",
      ship_add1: order.address || "Dhaka",
      ship_city: "Dhaka",
      ship_country: "Bangladesh",
      ship_postcode: "1000",
      ship_phone: order.phone || "01711111111",
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    console.log("SSLCommerz Response:", apiResponse);
    res.json({ success: true, GatewayPageURL: apiResponse.GatewayPageURL });
  } catch (err) {
    console.error("Payment Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===================== Payment Success =====================
router.post("/payment-success", (req, res) => {
  console.log("Payment Success Data:", req.body);
  res.redirect(
    process.env.PAYMENT_SUCCESS_REDIRECT ||
      "https://sateachi-com.vercel.app/success",
  );
});

// ===================== Payment Fail =====================
router.post("/payment-fail", (req, res) => {
  console.log("Payment Failed:", req.body);
  res.send(
    `<h1 class="text-danger text-center mt-5">Payment Failed! Try again.</h1>`,
  );
});

// ===================== Payment Cancel =====================
router.post("/payment-cancel", (req, res) => {
  console.log("Payment Cancelled:", req.body);
  res.send(
    `<h1 class="text-warning text-center mt-5">Payment Cancelled!</h1>`,
  );
});

// ===================== IPN =====================
router.post("/ipn", (req, res) => {
  console.log("Payment IPN:", req.body);
  res.json({ received: true });
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
    res
      .status(500)
      .json({ success: false, message: "Server error fetching orders" });
  }
});

module.exports = router;
