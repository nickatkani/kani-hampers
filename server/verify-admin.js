const { MongoClient } = require("mongodb");
require("dotenv").config();

async function verifyAdmins() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("kani-hampers");
    const admins = await db.collection("admins").find({}).toArray();

    console.log("👥 Admin accounts in database:");
    admins.forEach((admin) => {
      console.log(`- Username: ${admin.username}`);
      console.log(`  Password: ${admin.password}`);
      console.log(`  Role: ${admin.role}`);
      console.log(`  Name: ${admin.name}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

verifyAdmins();
