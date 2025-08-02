const { MongoClient } = require("mongodb");
require("dotenv").config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI not found in environment variables");
    return;
  }

  console.log("🔄 Testing MongoDB Atlas connection...");
  console.log("URI:", uri.replace(/\/\/.*@/, "//***:***@")); // Hide credentials

  try {
    const client = new MongoClient(uri);

    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas!");

    // Test database operations
    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log(
      `📊 Found ${collections.length} collections:`,
      collections.map((c) => c.name)
    );

    // Test a simple operation
    const testResult = await db.collection("connection-test").insertOne({
      timestamp: new Date(),
      message: "Atlas connection successful!",
    });
    console.log("✅ Test write successful:", testResult.insertedId);

    // Clean up test document
    await db
      .collection("connection-test")
      .deleteOne({ _id: testResult.insertedId });
    console.log("🧹 Cleaned up test document");

    await client.close();
    console.log("🔗 Connection closed");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);

    if (error.message.includes("authentication failed")) {
      console.log(
        "💡 Check your username and password in the connection string"
      );
    }
    if (error.message.includes("network")) {
      console.log(
        "💡 Check your network access settings in Atlas (allow your IP)"
      );
    }
    if (error.message.includes("bad auth")) {
      console.log("💡 Verify your database user credentials");
    }
  }
}

testConnection();
