import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const addTestOrder = async () => {
  console.log("Adding test order to Firebase...");

  const testOrder = {
    customerName: "Test Customer",
    email: "test@example.com",
    phone: "+91 9999999999",
    address: "123 Test Street, Test City, 123456",
    hamperType: "gold",
    hamperTitle: "Gold Hamper",
    hamperPrice: 1399,
    photoURL: "/api/placeholder/100/100",
    message: "Test message for Rakhi!",
    additionalRakhis: [
      { id: "1", name: "Traditional Thread Rakhi", quantity: 1, price: 50 },
    ],
    addons: [
      { id: "choco_ferrero", name: "Ferrero Rocher", quantity: 1, price: 150 },
    ],
    total: 1599,
    orderDate: new Date().toISOString(),
    deliveryDate: "2024-08-15",
    status: "pending",
    paymentStatus: "completed",
    trackingNumber: "TEST123456789",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, "orders"), testOrder);
    console.log("Test order added with ID:", docRef.id);
  } catch (error) {
    console.error("Error adding test order:", error);
  }
};

addTestOrder()
  .then(() => {
    console.log("Test order script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });
