// Firebase Data Seeding Script
// Run this once to populate your Firebase database with initial data

import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Initial products data
const initialProducts = [
  {
    name: "Gold Hamper",
    type: "gold",
    price: 1399,
    description:
      "Premium hamper with luxury items including sweets, dry fruits, and traditional decorative elements.",
    imageURL: "/api/placeholder/300/200",
    category: "hamper",
    inStock: true,
    popularity: 95,
  },
  {
    name: "Silver Hamper",
    type: "silver",
    price: 899,
    description:
      "Elegant hamper with a perfect blend of sweets, snacks, and festive items.",
    imageURL: "/api/placeholder/300/200",
    category: "hamper",
    inStock: true,
    popularity: 88,
  },
  {
    name: "Normal Hamper",
    type: "normal",
    price: 599,
    description:
      "Beautiful hamper with essential festive items and delicious treats.",
    imageURL: "/api/placeholder/300/200",
    category: "hamper",
    inStock: true,
    popularity: 92,
  },
  {
    name: "Traditional Thread Rakhi",
    type: "rakhi",
    price: 25,
    description:
      "Classic thread rakhi with traditional designs and vibrant colors.",
    imageURL: "/api/placeholder/200/200",
    category: "rakhi",
    inStock: true,
    popularity: 75,
  },
  {
    name: "Beaded Bracelet Rakhi",
    type: "rakhi",
    price: 80,
    description:
      "Stylish beaded rakhi with modern design and durable materials.",
    imageURL: "/api/placeholder/200/200",
    category: "rakhi",
    inStock: true,
    popularity: 68,
  },
  {
    name: "Ferrero Rocher",
    type: "addon",
    price: 150,
    description:
      "Premium chocolate gift box with assorted Ferrero Rocher chocolates.",
    imageURL: "/api/placeholder/200/200",
    category: "addon",
    inStock: true,
    popularity: 89,
  },
  {
    name: "Dry Fruit Pouch",
    type: "addon",
    price: 100,
    description:
      "Mixed dry fruits including almonds, cashews, and raisins in decorative pouch.",
    imageURL: "/api/placeholder/200/200",
    category: "addon",
    inStock: true,
    popularity: 72,
  },
];

// Initial rakhis data
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

// Function to seed products
export const seedProducts = async () => {
  try {
    console.log("Checking existing products...");
    const existingProducts = await getDocs(collection(db, "products"));

    if (existingProducts.docs.length > 0) {
      console.log("Products already exist. Skipping seed.");
      return;
    }

    console.log("Seeding products...");
    for (const product of initialProducts) {
      await addDoc(collection(db, "products"), {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log("Products seeded successfully!");
  } catch (error) {
    console.error("Error seeding products:", error);
  }
};

// Function to seed rakhis
export const seedRakhis = async () => {
  try {
    console.log("Checking existing rakhis...");
    const existingRakhis = await getDocs(collection(db, "rakhis"));

    if (existingRakhis.docs.length > 0) {
      console.log("Rakhis already exist. Skipping seed.");
      return;
    }

    console.log("Seeding rakhis...");
    for (const rakhi of initialRakhis) {
      await addDoc(collection(db, "rakhis"), {
        ...rakhi,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log("Rakhis seeded successfully!");
  } catch (error) {
    console.error("Error seeding rakhis:", error);
  }
};

// Function to seed all data
export const seedAllData = async () => {
  console.log("🌱 Starting Firebase data seeding...");
  await seedProducts();
  await seedRakhis();
  console.log("✅ Firebase seeding completed!");
};

// Auto-run if this file is executed directly
if (typeof window === "undefined") {
  seedAllData();
}
