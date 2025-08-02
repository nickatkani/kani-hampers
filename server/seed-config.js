const { MongoClient } = require("mongodb");
require("dotenv").config();

// Configuration data from .env
const configData = {
  // Admin credentials
  admins: [
    {
      id: "nishant",
      username: "nishant",
      password: process.env.VITE_ADMIN_NISHANT_PASSWORD,
      role: "super_admin",
      name: "Nishant Dakua",
      email: "nishant@kanihampers.in",
      createdAt: new Date(),
    },
    {
      id: "umesh",
      username: "umesh",
      password: process.env.VITE_ADMIN_UMESH_PASSWORD,
      role: "admin",
      name: "Umesh Udyar",
      email: "umesh@kanihampers.in",
      createdAt: new Date(),
    },
  ],

  // App configuration
  appConfig: {
    id: "main_config",
    appName: process.env.VITE_APP_NAME || "KANI Gift Hampers",
    appDescription:
      process.env.VITE_APP_DESCRIPTION ||
      "Premium Gift Hampers for Raksha Bandhan",
    appLogo: process.env.VITE_APP_LOGO || "/favicon.jpg",
    themeColor: process.env.VITE_THEME_COLOR || "#ef4444",

    // Contact information
    contact: {
      phone: process.env.VITE_CONTACT_PHONE || "+91 93218 61857",
      whatsapp: process.env.VITE_CONTACT_WHATSAPP || "+91 93218 61857",
      instagram:
        process.env.VITE_CONTACT_INSTAGRAM ||
        "https://www.instagram.com/kanihampers.in/",
    },

    // Business settings
    settings: {
      maxPhotoSize: "5MB",
      allowedImageTypes: ["jpeg", "jpg", "png", "gif", "webp"],
      deliveryDays: 3,
      freeDeliveryAbove: 500,
      razorpayEnabled: true,
    },

    // Payment configuration (public keys only)
    payment: {
      razorpayKeyId: process.env.VITE_RAZORPAY_KEY_ID,
    },

    updatedAt: new Date(),
  },
};

async function seedConfigDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MongoDB URI not found in environment variables");
    return;
  }

  try {
    const client = new MongoClient(uri);

    await client.connect();
    console.log("✅ Connected to MongoDB Atlas for configuration seeding...");
    const db = client.db();

    // Clear existing configuration data
    console.log("🧹 Clearing existing configuration data...");
    await db.collection("admins").deleteMany({});
    await db.collection("config").deleteMany({});

    // Insert admin data
    console.log("👤 Inserting admin credentials...");
    await db.collection("admins").insertMany(configData.admins);

    // Insert app configuration
    console.log("⚙️ Inserting app configuration...");
    await db.collection("config").insertOne(configData.appConfig);

    console.log("✅ Configuration data seeded successfully!");
    console.log(`👥 Inserted ${configData.admins.length} admin accounts`);
    console.log("📞 Contact Info:");
    console.log(`   Phone: ${configData.appConfig.contact.phone}`);
    console.log(`   WhatsApp: ${configData.appConfig.contact.whatsapp}`);
    console.log(`   Instagram: ${configData.appConfig.contact.instagram}`);

    await client.close();
    console.log("🔗 Connection closed");
  } catch (error) {
    console.error("❌ Error seeding configuration:", error.message);

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
  seedConfigDatabase();
}

module.exports = { seedConfigDatabase, configData };
