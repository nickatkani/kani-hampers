// Firebase Data Seeding Script for new Firebase project
// Run this once to populate your Firebase database with initial data

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Firebase configuration for new project
const firebaseConfig = {
  apiKey: "AIzaSyDHVuE4oyR9ORWUjqwfJYWxpZzcNP7ZT0Q",
  authDomain: "kani-hampers-8f98f.firebaseapp.com",
  projectId: "kani-hampers-8f98f",
  storageBucket: "kani-hampers-8f98f.firebasestorage.app",
  messagingSenderId: "1099018831413",
  appId: "1:1099018831413:web:eb2a743b06968ae1aa137c",
  measurementId: "G-ZLY9KE5F1K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initial rakhis data with your new premium rakhis
const initialRakhis = [
  {
    name: "Scarlet Spark",
    image: "/gallery/images/rakhi/scarlet_spark.jpg",
    category: "Premium",
    price: 50,
    description: "Premium handcrafted rakhi with vibrant red accents",
  },
  {
    name: "Prithvi Bond",
    image: "/gallery/images/rakhi/prithvi_bond.jpg",
    category: "Premium",
    price: 50,
    description: "Earth-inspired premium rakhi symbolizing eternal bond",
  },
  {
    name: "Kesar Bindu",
    image: "/gallery/images/rakhi/kesar_bindu.jpg",
    category: "Premium",
    price: 50,
    description: "Saffron-themed premium rakhi with golden touches",
  },
  {
    name: "Megh Sutra",
    image: "/gallery/images/rakhi/meghsutra.jpg",
    category: "Premium",
    price: 50,
    description: "Cloud-inspired premium rakhi with silver threads",
  },
];

// Initial products data
const initialProducts = [
  {
    name: "Gold Hamper",
    type: "gold",
    price: 1399,
    description: "Premium hamper with luxury items including sweets, dry fruits, and traditional decorative elements.",
    imageURL: "/api/placeholder/300/200",
    category: "hamper",
    inStock: true,
    popularity: 95,
  },
  {
    name: "Silver Hamper", 
    type: "silver",
    price: 899,
    description: "Elegant hamper with a perfect blend of sweets, snacks, and festive items.",
    imageURL: "/api/placeholder/300/200",
    category: "hamper",
    inStock: true,
    popularity: 88,
  },
  {
    name: "Normal Hamper",
    type: "normal", 
    price: 599,
    description: "Beautiful hamper with essential festive items and delicious treats.",
    imageURL: "/api/placeholder/300/200",
    category: "hamper",
    inStock: true,
    popularity: 92,
  },
  {
    name: "Custom Hamper",
    type: "custom",
    price: 999,
    description: "Personalized hamper tailored to your preferences with premium items.",
    imageURL: "/api/placeholder/300/200", 
    category: "hamper",
    inStock: true,
    popularity: 90,
  },
];

// Initial add-ons data with new jewelry items
const initialAddons = [
  {
    name: "Ferrero Rocher",
    price: 150,
    category: "Chocolate",
    description: "Premium chocolate gift box with assorted Ferrero Rocher chocolates.",
    inStock: true,
  },
  {
    name: "Dry Fruit Pouch",
    price: 100,
    category: "Dry Fruits",
    description: "Mixed dry fruits pouch with almonds, cashews, and dates.",
    inStock: true,
  },
  {
    name: "Silver Bar Necklace",
    price: 149,
    category: "Jewelry",
    description: "Elegant silver bar necklace with minimalist design.",
    inStock: true,
  },
  {
    name: "Dumbell Gym Bracelet",
    price: 119,
    category: "Jewelry",
    description: "Sporty dumbell-themed bracelet for fitness enthusiasts.",
    inStock: true,
  },
  {
    name: "Thin Chain Bracelet",
    price: 129,
    category: "Jewelry",
    description: "Delicate thin chain bracelet with premium finish.",
    inStock: true,
  },
  {
    name: "Titan Link Chain Bracelet",
    price: 169,
    category: "Jewelry",
    description: "Bold titan link chain bracelet with strong design.",
    inStock: true,
  },
  {
    name: "Trident Ring",
    price: 159,
    category: "Jewelry",
    description: "Unique trident-shaped ring with artistic appeal.",
    inStock: true,
  },
  {
    name: "Daisy Necklace",
    price: 229,
    category: "Jewelry",
    description: "Beautiful daisy-themed necklace with floral charm.",
    inStock: true,
  },
  {
    name: "Rosalie Necklace",
    price: 249,
    category: "Jewelry",
    description: "Elegant Rosalie necklace with sophisticated design.",
    inStock: true,
  },
  {
    name: "Crystal Dual Necklace",
    price: 149,
    category: "Jewelry", 
    description: "Stunning crystal dual-layer necklace with sparkle.",
    inStock: true,
  },
  {
    name: "Ballon Initial Necklace",
    price: 259,
    category: "Jewelry",
    description: "Personalized balloon initial necklace with custom letter.",
    inStock: true,
  },
  {
    name: "Amora Heart Necklace",
    price: 249,
    category: "Jewelry",
    description: "Romantic Amora heart necklace with love-inspired design.",
    inStock: true,
  },
];

// Function to seed rakhis
const seedRakhis = async () => {
  try {
    const existingRakhis = await getDocs(collection(db, "rakhis"));
    if (existingRakhis.empty) {
      console.log("🌱 Seeding rakhis...");
      for (const rakhi of initialRakhis) {
        await addDoc(collection(db, "rakhis"), rakhi);
        console.log(`✅ Added rakhi: ${rakhi.name}`);
      }
    } else {
      console.log("📋 Rakhis collection already exists, skipping...");
    }
  } catch (error) {
    console.error("❌ Error seeding rakhis:", error);
  }
};

// Function to seed products
const seedProducts = async () => {
  try {
    const existingProducts = await getDocs(collection(db, "products"));
    if (existingProducts.empty) {
      console.log("🌱 Seeding products...");
      for (const product of initialProducts) {
        await addDoc(collection(db, "products"), product);
        console.log(`✅ Added product: ${product.name}`);
      }
    } else {
      console.log("📋 Products collection already exists, skipping...");
    }
  } catch (error) {
    console.error("❌ Error seeding products:", error);
  }
};

// Function to seed add-ons
const seedAddons = async () => {
  try {
    const existingAddons = await getDocs(collection(db, "addons"));
    if (existingAddons.empty) {
      console.log("🌱 Seeding add-ons...");
      for (const addon of initialAddons) {
        await addDoc(collection(db, "addons"), addon);
        console.log(`✅ Added addon: ${addon.name}`);
      }
    } else {
      console.log("📋 Add-ons collection already exists, skipping...");
    }
  } catch (error) {
    console.error("❌ Error seeding add-ons:", error);
  }
};

// Main seeding function
const seedFirebase = async () => {
  console.log("🚀 Starting Firebase seeding for new project...");
  
  try {
    await seedRakhis();
    await seedProducts();
    await seedAddons();
    console.log("✅ Firebase seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
  }
  
  process.exit(0);
};

// Run the seeding
seedFirebase();
