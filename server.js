require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
// const paymentRoutes = require("./routes/payment");
const orderRoutes = require("./routes/orders"); 

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
// app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes); 

app.get("/", (req, res) => {
  res.send("Server running");
});

// app.listen(3000, () => {
//   console.log("Server running http://localhost:3000");
// });
module.exports=app;
