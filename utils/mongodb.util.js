// utils/mongodb.util.js
const { MongoClient } = require("mongodb");

// Vì bạn không dùng .env nên để giá trị mặc định ở đây
const uri = "mongodb://127.0.0.1:27017";
const dbName = "librarydb";

let client;
let db;

async function getClient() {
  // chỉ connect 1 lần duy nhất (singleton)
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

function getDb() {
  if (!db) {
    db = client.db(dbName);
  }
  return db;
}

module.exports = { getClient, getDb };
