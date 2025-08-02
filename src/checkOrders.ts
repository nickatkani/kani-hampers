import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

async function checkOrdersInDatabase() {
  try {
    console.log("🔍 Checking orders in database...");
    const querySnapshot = await getDocs(collection(db, "orders"));
    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`📊 Found ${orders.length} orders in database:`);

    orders.forEach((order: any, index) => {
      console.log(`\n📋 Order ${index + 1}:`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Customer Name: ${order.customerName || "MISSING"}`);
      console.log(`   Hamper Title: ${order.hamperTitle || "MISSING"}`);
      console.log(`   Hamper Type: ${order.hamperType || "MISSING"}`);
      console.log(`   Total: ₹${order.total || 0}`);
      console.log(`   Status: ${order.status || "MISSING"}`);
      console.log(`   Order Date: ${order.orderDate || "MISSING"}`);
    });

    console.log("\n✅ Database check complete!");
  } catch (error) {
    console.error("❌ Error checking database:", error);
  }
}

// Run the function
checkOrdersInDatabase();
