const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const multer = require("multer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const client = new MongoClient(process.env.MONGODB_URI);

async function connectToMongo() {
  try {
    await client.connect();
    db = client.db("kani-hampers");
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "KANI Hampers API is running!",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Get all rakhis
app.get("/api/rakhis", async (req, res) => {
  try {
    const rakhis = await db.collection("rakhis").find({}).toArray();
    res.json(rakhis);
  } catch (error) {
    console.error("Error fetching rakhis:", error);
    res.status(500).json({ error: "Failed to fetch rakhis" });
  }
});

// Get all addons
app.get("/api/addons", async (req, res) => {
  try {
    const addons = await db.collection("addons").find({}).toArray();
    res.json(addons);
  } catch (error) {
    console.error("Error fetching addons:", error);
    res.status(500).json({ error: "Failed to fetch addons" });
  }
});

// Create order
app.post("/api/orders", async (req, res) => {
  try {
    const order = {
      ...req.body,
      createdAt: new Date(),
      status: "pending",
    };

    const result = await db.collection("orders").insertOne(order);
    res.status(201).json({
      success: true,
      orderId: result.insertedId,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get all orders (admin only)
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update order status
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { ObjectId } = require("mongodb");
    const result = await db
      .collection("orders")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Admin login
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await db.collection("admins").findOne({ username });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      success: true,
      admin: {
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Start server
connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

module.exports = app;
