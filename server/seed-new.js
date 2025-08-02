const { MongoClient } = require("mongodb");
require("dotenv").config();

// Sample data for seeding the database
const sampleRakhis = [
  {
    id: "kesar_bindu",
    name: "Kesar Bindu",
    category: "Traditional",
    price: 150,
    image: "/gallery/images/rakhi/kesar_bindu.jpg",
    description: "Traditional rakhi with kesar and pearls",
  },
  {
    id: "meghsutra",
    name: "Meghsutra",
    category: "Designer",
    price: 200,
    image: "/gallery/images/rakhi/meghsutra.jpg",
    description: "Designer rakhi with intricate patterns",
  },
  {
    id: "prithvi_bond",
    name: "Prithvi Bond",
    category: "Eco-friendly",
    price: 120,
    image: "/gallery/images/rakhi/prithvi_bond.jpg",
    description: "Eco-friendly rakhi made from natural materials",
  },
  {
    id: "scarlet_spark",
    name: "Scarlet Spark",
    category: "Modern",
    price: 180,
    image: "/gallery/images/rakhi/scarlet_spark.jpg",
    description: "Modern design with sparkling elements",
  },
];

const sampleAddons = [
  { id: "choco_ferrero", name: "Ferrero Rocher", price: 150 },
  { id: "dryfruit_pouch", name: "Dry Fruit Pouch", price: 100 },
  { id: "silver_bar_necklace", name: "Silver Bar Necklace", price: 149 },
  { id: "dumbell_gym_bracelet", name: "Dumbell Gym Bracelet", price: 119 },
  { id: "thin_chain_bracelet", name: "Thin Chain Bracelet", price: 129 },
  {
    id: "titan_link_chain_bracelet",
    name: "Titan Link Chain Bracelet",
    price: 169,
  },
  { id: "trident_ring", name: "Trident Ring", price: 159 },
  { id: "daisy_necklace", name: "Daisy Necklace", price: 229 },
  { id: "rosalie_necklace", name: "Rosalie Necklace", price: 249 },
  { id: "crystal_dual_necklace", name: "Crystal Dual Necklace", price: 149 },
  {
    id: "ballon_initial_necklace",
    name: "Ballon Initial Necklace",
    price: 259,
  },
  { id: "amora_heart_necklace", name: "Amora Heart Necklace", price: 249 },
];

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI not found in environment variables");
    console.log("Make sure your .env file has MONGODB_URI set");
    return;
  }

  console.log("🌱 Seeding MongoDB Atlas database...");
  console.log("URI:", uri.replace(/\/\/.*@/, "//***:***@")); // Hide credentials

  try {
    const client = new MongoClient(uri);

    await client.connect();
    console.log("✅ Connected to MongoDB Atlas for seeding...");
    const db = client.db();

    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await db.collection("rakhis").deleteMany({});
    await db.collection("addons").deleteMany({});

    // Insert sample data
    console.log("📦 Inserting rakhis...");
    await db.collection("rakhis").insertMany(sampleRakhis);

    console.log("🎁 Inserting addons...");
    await db.collection("addons").insertMany(sampleAddons);

    console.log("✅ Database seeded successfully!");
    console.log(
      `📊 Inserted ${sampleRakhis.length} rakhis and ${sampleAddons.length} addons`
    );

    await client.close();
    console.log("🔗 Connection closed");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);

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
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
