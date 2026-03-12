const express = require("express");
const connectDB = require("../db");

const router = express.Router();

/* ================= PLACE ORDER ================= */
router.post("/", async (req, res) => {
  try {
    const db = await connectDB();

    const order = {
      name: req.body.name,
      email: req.body.email,
      address: req.body.address,
      quantity: req.body.quantity,
      paymentMethod: req.body.paymentMethod || "Online",
      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);

    res.status(201).json({
      success: true,
      orderId: result.insertedId,
    });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ success: false });
  }
});

/* ================= GET ALL ORDERS ================= */
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();

    // Fetch orders from orders collection
    const orders = await db.collection("orders").find().toArray();

   
    // Merge both arrays
    const allOrders = [...orders];

    res.json(allOrders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching orders" });
  }
});

module.exports = router;
