const { MongoClient } = require("mongodb");

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error("Missing required env var: MONGO_URI");
}

const client = new MongoClient(mongoUri);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("my_shop");
    console.log("MongoDB Connected");
  }
  return db;
}

module.exports = connectDB;
