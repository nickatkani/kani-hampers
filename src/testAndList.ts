import { db } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

const createTestOrderAndList = async () => {
  console.log("Creating test order and listing all orders...");

  // Add a test order
  const testOrder = {
    customerName: "Admin Test Customer",
    email: "admin@test.com",
    phone: "+91 9999999999",
    address: "123 Admin Test Street, Test City, 123456",
    hamperType: "gold",
    hamperTitle: "Gold Hamper",
    hamperPrice: 1399,
    photoURL: "/api/placeholder/100/100",
    message: "Test order from admin!",
    additionalRakhis: [],
    addons: [],
    total: 1399,
    orderDate: new Date().toISOString(),
    deliveryDate: "2024-08-15",
    status: "pending",
    paymentStatus: "completed",
    trackingNumber:
      "ADMIN" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    // Add the order
    const docRef = await addDoc(collection(db, "orders"), testOrder);
    console.log("✅ Test order added with ID:", docRef.id);

    // List all orders
    console.log("📋 Listing all orders in Firebase:");
    const querySnapshot = await getDocs(collection(db, "orders"));
    console.log(`Found ${querySnapshot.docs.length} orders:`);

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(
        `- ${doc.id}: ${data.customerName} - ₹${data.total} (${data.status})`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

createTestOrderAndList()
  .then(() => {
    console.log("✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
