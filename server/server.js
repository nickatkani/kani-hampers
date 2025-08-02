const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for memory storage with 5MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB in bytes
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/kani-hampers";
let db;

MongoClient.connect(MONGODB_URI)
  .then((client) => {
    console.log("✅ Connected to MongoDB");
    db = client.db();
  })
  .catch((error) => console.error("❌ MongoDB connection error:", error));

// Routes

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

// Get app configuration
app.get("/api/config", async (req, res) => {
  try {
    const config = await db.collection("config").findOne({ id: "main_config" });
    if (!config) {
      return res.status(404).json({ error: "Configuration not found" });
    }
    res.json(config);
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({ error: "Failed to fetch configuration" });
  }
});

// Admin login endpoint
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const admin = await db.collection("admins").findOne({ username });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Return admin info without password
    const { password: _, ...adminInfo } = admin;
    res.json({
      success: true,
      admin: adminInfo,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get all admins (for admin management)
app.get("/api/admins", async (req, res) => {
  try {
    const admins = await db
      .collection("admins")
      .find({}, { projection: { password: 0 } })
      .toArray();
    res.json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});

// Upload image to Cloudinary
app.post("/api/upload", (req, res) => {
  upload.single("image")(req, res, async (err) => {
    // Handle multer errors
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "File size too large. Maximum size allowed is 5MB.",
          success: false,
        });
      }
      if (err.message === "Only image files are allowed") {
        return res.status(400).json({
          error: "Only image files are allowed.",
          success: false,
        });
      }
      return res.status(400).json({
        error: "File upload error: " + err.message,
        success: false,
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          error: "No file provided",
          success: false,
        });
      }

      // Upload to Cloudinary using a promise
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "kani-hampers", // Optional: organize uploads in a folder
              transformation: [
                { width: 1000, height: 1000, crop: "limit" }, // Limit max size
                { quality: "auto" }, // Auto optimize quality
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      res.json({
        success: true,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      res.status(500).json({
        error: "Failed to upload image to Cloudinary",
        success: false,
      });
    }
  });
});

// Create a new order
app.post("/api/orders", async (req, res) => {
  try {
    const order = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(order);
    res.status(201).json({
      message: "Order created successfully",
      orderId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get all orders (for admin)
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

// Get order by ID
app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Update order status
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Add a new rakhi
app.post("/api/rakhis", async (req, res) => {
  try {
    const rakhi = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("rakhis").insertOne(rakhi);
    res.status(201).json({
      message: "Rakhi added successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding rakhi:", error);
    res.status(500).json({ error: "Failed to add rakhi" });
  }
});

// Update a rakhi
app.put("/api/rakhis/:id", async (req, res) => {
  try {
    const result = await db.collection("rakhis").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          ...req.body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Rakhi not found" });
    }

    res.json({ message: "Rakhi updated successfully" });
  } catch (error) {
    console.error("Error updating rakhi:", error);
    res.status(500).json({ error: "Failed to update rakhi" });
  }
});

// Delete a rakhi
app.delete("/api/rakhis/:id", async (req, res) => {
  try {
    const result = await db
      .collection("rakhis")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Rakhi not found" });
    }

    res.json({ message: "Rakhi deleted successfully" });
  } catch (error) {
    console.error("Error deleting rakhi:", error);
    res.status(500).json({ error: "Failed to delete rakhi" });
  }
});

// Add a new addon
app.post("/api/addons", async (req, res) => {
  try {
    const addon = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("addons").insertOne(addon);
    res.status(201).json({
      message: "Addon added successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding addon:", error);
    res.status(500).json({ error: "Failed to add addon" });
  }
});

// Update an addon
app.put("/api/addons/:id", async (req, res) => {
  try {
    const result = await db.collection("addons").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          ...req.body,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Addon not found" });
    }

    res.json({ message: "Addon updated successfully" });
  } catch (error) {
    console.error("Error updating addon:", error);
    res.status(500).json({ error: "Failed to update addon" });
  }
});

// Delete an addon
app.delete("/api/addons/:id", async (req, res) => {
  try {
    const result = await db
      .collection("addons")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Addon not found" });
    }

    res.json({ message: "Addon deleted successfully" });
  } catch (error) {
    console.error("Error deleting addon:", error);
    res.status(500).json({ error: "Failed to delete addon" });
  }
});

// Delete an order
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const result = await db
      .collection("orders")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Kani Hampers API is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
