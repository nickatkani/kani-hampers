import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

async function addCustomHamperTestOrder() {
  try {
    const testOrder = {
      customerName: "Alex Johnson",
      email: "alex@example.com",
      phone: "5555551234",
      address: "789 Custom Street",
      pincode: "987654",
      hamperType: "custom",
      hamperTitle: "Custom Hamper",
      hamperPrice: 299,
      photoURL: "",
      message: "I want to create something special!",
      additionalRakhis: [
        { id: "rakhi1", name: "Designer Rakhi", price: 120, quantity: 2 },
        { id: "rakhi2", name: "Premium Thread Rakhi", price: 85, quantity: 1 },
      ],
      addons: [
        { id: "ferrero", name: "Ferrero Rocher", price: 150, quantity: 1 },
        {
          id: "dryfruits",
          name: "Premium Dry Fruits",
          price: 200,
          quantity: 1,
        },
        { id: "sweets", name: "Traditional Sweets", price: 180, quantity: 1 },
      ],
      total: 1234, // 299 base + 325 rakhis + 530 addons = 1154, but let's say 1234 with other customizations
      orderDate: new Date().toISOString(),
      deliveryDate: new Date(
        Date.now() + 10 * 24 * 60 * 60 * 1000
      ).toISOString(), // 10 days from now
      status: "pending",
      paymentStatus: "completed",
      trackingNumber: "",
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), testOrder);
    console.log("✅ Custom Hamper test order added with ID:", docRef.id);
    console.log("📋 Order data:", testOrder);
  } catch (error) {
    console.error("❌ Error adding Custom Hamper test order:", error);
  }
}

// Run the function
addCustomHamperTestOrder();
