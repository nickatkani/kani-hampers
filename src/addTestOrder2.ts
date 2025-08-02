import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

async function addAnotherTestOrder() {
  try {
    const testOrder = {
      customerName: "Jane Smith", // Different customer name
      email: "jane@example.com",
      phone: "9876543210",
      address: "456 Demo Avenue",
      pincode: "654321",
      hamperType: "silver",
      hamperTitle: "Silver Hamper", // Different hamper
      hamperPrice: 1800,
      photoURL: "",
      message: "Happy Raksha Bandhan!",
      additionalRakhis: [],
      addons: [
        { id: "sweets", name: "Premium Sweets", price: 200, quantity: 1 },
      ],
      total: 2000,
      orderDate: new Date().toISOString(),
      deliveryDate: new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000
      ).toISOString(), // 5 days from now
      status: "processing",
      paymentStatus: "completed",
      trackingNumber: "",
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), testOrder);
    console.log("✅ Second test order added with ID:", docRef.id);
    console.log("📋 Order data:", testOrder);
  } catch (error) {
    console.error("❌ Error adding test order:", error);
  }
}

// Run the function
addAnotherTestOrder();
