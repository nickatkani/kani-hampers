import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

async function addTestOrderWithProperFormat() {
  try {
    const testOrder = {
      customerName: "Test Customer", // Proper field name
      email: "test@example.com",
      phone: "1234567890",
      address: "123 Test Street",
      pincode: "123456",
      hamperType: "gold",
      hamperTitle: "Gold Hamper", // Proper field name
      hamperPrice: 2500,
      photoURL: "",
      message: "Test message for Rakhi",
      additionalRakhis: [],
      addons: [],
      total: 2500,
      orderDate: new Date().toISOString(),
      deliveryDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(), // 7 days from now
      status: "pending",
      paymentStatus: "completed",
      trackingNumber: "",
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), testOrder);
    console.log("✅ Test order added with ID:", docRef.id);
    console.log("📋 Order data:", testOrder);
  } catch (error) {
    console.error("❌ Error adding test order:", error);
  }
}

// Run the function
addTestOrderWithProperFormat();
