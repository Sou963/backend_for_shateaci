const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    const err = new Error("Missing required env var: MONGO_URI");
    err.code = "MISSING_MONGO_URI";
    throw err;
  }

  if (!client) {
    client = new MongoClient(mongoUri);
  }

  if (!db) {
    await client.connect();
    db = client.db(process.env.MONGO_DB_NAME || "my_shop");
    console.log("MongoDB Connected");
  }

  return db;
}

module.exports = connectDB;
