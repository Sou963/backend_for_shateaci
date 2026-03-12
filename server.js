require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const orderRoutes = require("./routes/orders");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Server running");
});

// if (require.main === module) {
//   const port = process.env.PORT || 3000;
//   app.listen(port, () => {
//     console.log(`Server running http://localhost:${port}`);
//   });
// }

module.exports = app;
