import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

async function addUpdatedPricingTestOrder() {
  try {
    // Test Normal Hamper with new pricing
    const normalHamperOrder = {
      customerName: "Priya Verma",
      email: "priya.verma@email.com",
      phone: "9876543210",
      address: "123 New Street, Delhi",
      pincode: "110001",
      hamperType: "normal",
      hamperTitle: "Normal Hamper",
      hamperPrice: 251,
      photoURL: "",
      message: "Simple and sweet!",
      additionalRakhis: [],
      addons: [],
      total: 251,
      orderDate: new Date().toISOString(),
      deliveryDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: "pending",
      paymentStatus: "completed",
      trackingNumber: "",
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef1 = await addDoc(collection(db, "orders"), normalHamperOrder);
    console.log("✅ Normal Hamper order added with ID:", docRef1.id);

    // Test Silver Hamper with new pricing
    const silverHamperOrder = {
      customerName: "Rahul Sharma",
      email: "rahul.sharma@email.com",
      phone: "8765432109",
      address: "456 Silver Lane, Mumbai",
      pincode: "400001",
      hamperType: "silver",
      hamperTitle: "Silver Hamper",
      hamperPrice: 551,
      photoURL: "",
      message: "Classic choice with silver coin!",
      additionalRakhis: [],
      addons: [],
      total: 551,
      orderDate: new Date().toISOString(),
      deliveryDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: "pending",
      paymentStatus: "completed",
      trackingNumber: "",
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef2 = await addDoc(collection(db, "orders"), silverHamperOrder);
    console.log("✅ Silver Hamper order added with ID:", docRef2.id);

    // Test Gold Hamper with new pricing
    const goldHamperOrder = {
      customerName: "Anjali Gupta",
      email: "anjali.gupta@email.com",
      phone: "7654321098",
      address: "789 Gold Avenue, Bangalore",
      pincode: "560001",
      hamperType: "gold",
      hamperTitle: "Gold Hamper",
      hamperPrice: 1001,
      photoURL: "",
      message: "Premium choice with Ferrero Rocher!",
      additionalRakhis: [],
      addons: [],
      total: 1001,
      orderDate: new Date().toISOString(),
      deliveryDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      status: "pending",
      paymentStatus: "completed",
      trackingNumber: "",
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef3 = await addDoc(collection(db, "orders"), goldHamperOrder);
    console.log("✅ Gold Hamper order added with ID:", docRef3.id);
  } catch (error) {
    console.error("❌ Error adding test orders:", error);
  }
}

// Run the function
addUpdatedPricingTestOrder();
