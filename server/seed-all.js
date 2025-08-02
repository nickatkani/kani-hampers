const { MongoClient } = require("mongodb");
const { seedDatabase } = require("./seed");
const { seedConfigDatabase } = require("./seed-config");
require("dotenv").config();

async function seedAll() {
  console.log("🚀 Starting complete database seeding...\n");

  try {
    // Seed rakhis and addons
    console.log("📦 Seeding rakhis and addons...");
    await seedDatabase();
    console.log("✅ Rakhis and addons seeded successfully!\n");

    // Seed configuration and admin data
    console.log("⚙️ Seeding configuration and admin data...");
    await seedConfigDatabase();
    console.log("✅ Configuration and admin data seeded successfully!\n");

    console.log("🎉 Complete database seeding finished!");
    console.log("\n📊 Database now contains:");
    console.log("   • Rakhi products");
    console.log("   • Add-on products");
    console.log("   • Admin accounts");
    console.log("   • App configuration");
    console.log("   • Contact information");
  } catch (error) {
    console.error("❌ Error during complete seeding:", error.message);
  }
}

// Run if executed directly
if (require.main === module) {
  seedAll();
}

module.exports = { seedAll };
