import React, { useState, useEffect } from "react";
import {
  Package,
  Eye,
  Phone,
  MapPin,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Search,
  Download,
  ArrowLeft,
  Edit,
  Trash2,
  ShoppingBag,
  Plus,
  Save,
  X,
  Upload,
} from "lucide-react";
import jsPDF from "jspdf";
import { db, storage } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Initial data for seeding (removed after setup)

// Firebase functions for admin operations
const firebaseAdmin = {
  // Get all documents from a collection
  async getCollection(collectionName: string) {
    try {
      console.log(`🔍 Fetching collection: ${collectionName}`);
      const querySnapshot = await getDocs(collection(db, collectionName));
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(
        `✅ Successfully fetched ${docs.length} documents from ${collectionName}`
      );
      return docs;
    } catch (error) {
      console.error(`❌ Error getting ${collectionName}:`, error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
      throw error; // Re-throw to handle in calling function
    }
  },

  // Get a single document
  async getDocument(collectionName: string, docId: string) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error(`Error getting document:`, error);
      return null;
    }
  },

  // Add a new document
  async addDocument(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id };
    } catch (error) {
      console.error(`Error adding document:`, error);
      throw error;
    }
  },

  // Update a document
  async updateDocument(collectionName: string, docId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error(`Error updating document:`, error);
      throw error;
    }
  },

  // Delete a document
  async deleteDocument(collectionName: string, docId: string) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document:`, error);
      throw error;
    }
  },
};

// Mock data for initial seeding (can be removed after initial setup)
const initialOrders = [
  {
    customerName: "Priya Sharma",
    email: "priya.sharma@email.com",
    phone: "+91 9876543210",
    address: "123 Gandhi Nagar, Delhi, 110001",
    hamperType: "gold",
    hamperTitle: "Gold Hamper",
    hamperPrice: 1399,
    photoURL: "/api/placeholder/100/100",
    message: "Happy Raksha Bandhan bhai! Love you lots ❤️",
    additionalRakhis: [
      { id: "1", name: "Traditional Thread Rakhi", quantity: 2, price: 50 },
      { id: "2", name: "Beaded Bracelet Rakhi", quantity: 1, price: 80 },
    ],
    addons: [
      { id: "choco_ferrero", name: "Ferrero Rocher", quantity: 1, price: 150 },
    ],
    total: 1729,
    orderDate: new Date("2024-07-05T10:30:00Z").toISOString(),
    deliveryDate: "2024-08-12",
    status: "pending",
    paymentStatus: "completed",
    trackingNumber: "TRK123456789",
  },
  {
    customerName: "Raj Patel",
    email: "raj.patel@email.com",
    phone: "+91 8765432109",
    address: "456 Nehru Street, Mumbai, 400001",
    hamperType: "silver",
    hamperTitle: "Silver Hamper",
    hamperPrice: 899,
    photoURL: "/api/placeholder/100/100",
    message: "Miss our childhood days! Happy Rakhi!",
    additionalRakhis: [],
    addons: [
      {
        id: "dryfruit_pouch",
        name: "Dry Fruit Pouch",
        quantity: 1,
        price: 100,
      },
    ],
    total: 999,
    orderDate: new Date("2024-07-04T14:15:00Z").toISOString(),
    deliveryDate: "2024-08-11",
    status: "processing",
    paymentStatus: "completed",
    trackingNumber: "TRK987654321",
  },
  {
    customerName: "Sneha Gupta",
    email: "sneha.gupta@email.com",
    phone: "+91 7654321098",
    address: "789 Park Avenue, Bangalore, 560001",
    hamperType: "normal",
    hamperTitle: "Normal Hamper",
    hamperPrice: 599,
    photoURL: "/api/placeholder/100/100",
    message: "Happy Rakhi didi! Thanks for everything!",
    additionalRakhis: [
      { id: "3", name: "Cartoon Character Rakhi", quantity: 1, price: 60 },
    ],
    addons: [],
    total: 659,
    orderDate: new Date("2024-07-03T09:45:00Z").toISOString(),
    deliveryDate: "2024-08-10",
    status: "delivered",
    paymentStatus: "completed",
    trackingNumber: "TRK555666777",
  },
];

const initialProducts = [
  {
    name: "Gold Hamper",
    type: "gold",
    price: 1001,
    description:
      "Premium hamper with Ferrero Rocher chocolates, premium rakhi, photo strip with 3 photos, and 2.5gm silver coin.",
    imageURL: "/api/placeholder/300/200",
    category: "hamper",
    inStock: true,
    popularity: 95,
  },
  {
    name: "Silver Hamper",
    type: "silver",
    price: 551,
    description:
      "Elegant hamper with 1gm silver coin, classic rakhi, dry fruits + chocolates, photostrip with 2 photos, and haldi kum kum.",
    imageURL: "/api/placeholder/300/200",
    category: "hamper",
    inStock: true,
    popularity: 88,
  },
  {
    name: "Normal Hamper",
    type: "normal",
    price: 251,
    description:
      "Beautiful hamper with basic rakhi, message card, and haldi kum kum.",
    imageURL: "/api/placeholder/300/200",
    category: "hamper",
    inStock: true,
    popularity: 92,
  },
  {
    name: "Custom Hamper",
    type: "custom",
    price: 255,
    description:
      "Create your own perfect hamper with complete customization freedom. Choose your rakhis, add-ons, and personalize everything.",
    imageURL: "/api/placeholder/300/200",
    category: "hamper",
    inStock: true,
    popularity: 85,
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

interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  imageURL: string;
  category: "hamper" | "rakhi" | "addon";
  inStock: boolean;
  popularity: number;
}

interface Order {
  id: string;
  orderNumber?: string; // Optional readable order number
  customerName: string;
  email: string;
  phone: string;
  address: string;
  hamperType: string;
  hamperTitle: string;
  hamperPrice: number;
  photoURL: string;
  photos?: string[]; // New array for multiple photos
  message: string;
  additionalRakhis: any[];
  addons: any[];
  total: number;
  orderDate: string;
  deliveryDate: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed" | "cash_on_delivery";
  paymentId?: string; // Razorpay payment ID
  razorpayOrderId?: string; // Razorpay order ID
  razorpaySignature?: string; // Razorpay signature for verification
  trackingNumber: string;
}

const AdminDashboard = React.memo(() => {
  console.log("🔧 AdminDashboard component rendering...");

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "orders" | "order-detail" | "products" | "product-form"
  >("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [productForm, setProductForm] = useState({
    name: "",
    type: "",
    price: "",
    description: "",
    category: "hamper" as "hamper" | "rakhi" | "addon",
    inStock: true,
    imageFile: null as File | null,
    imageURL: "",
  });

  const [loading, setLoading] = useState(true); // Start with loading true
  const [initialSetupDone, setInitialSetupDone] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🔧 AdminDashboard useEffect triggered");
    initializeData();
  }, []);

  // Initialize data - load from Firebase or seed with initial data
  const initializeData = async () => {
    console.log("🚀 Starting admin dashboard initialization...");
    setLoading(true);

    try {
      // First test Firebase connectivity
      console.log("🔗 Testing Firebase connectivity...");
      await firebaseAdmin.getCollection("test"); // This will fail gracefully if there's no connection
      setConnectionError(null); // Clear any previous connection errors

      console.log("📡 Loading existing data from Firebase...");

      // Load orders and products directly and get the actual data
      const [ordersData, productsData] = await Promise.all([
        firebaseAdmin.getCollection("orders").catch((err) => {
          console.error("Failed to load orders:", err);
          return [];
        }),
        firebaseAdmin.getCollection("products").catch((err) => {
          console.error("Failed to load products:", err);
          return [];
        }),
      ]);

      console.log(
        `📊 Found ${ordersData.length} orders and ${productsData.length} products`
      );

      // If no data exists, seed with initial data
      if (ordersData.length === 0) {
        console.log("🌱 No orders found, seeding initial orders...");
        for (const order of initialOrders) {
          try {
            await firebaseAdmin.addDocument("orders", order);
            console.log("✅ Added order for:", order.customerName);
          } catch (error) {
            console.error("❌ Error adding order:", error);
          }
        }
        // Reload orders after seeding
        const newOrdersData = await firebaseAdmin.getCollection("orders");
        setOrders(newOrdersData as Order[]);
        console.log(`🌱 Seeded ${newOrdersData.length} orders`);
      } else {
        setOrders(ordersData as Order[]);
        console.log(`✅ Loaded ${ordersData.length} existing orders`);
      }

      if (productsData.length === 0) {
        console.log("🌱 No products found, seeding initial products...");
        for (const product of initialProducts) {
          try {
            await firebaseAdmin.addDocument("products", product);
            console.log("✅ Added product:", product.name);
          } catch (error) {
            console.error("❌ Error adding product:", error);
          }
        }
        // Reload products after seeding
        const newProductsData = await firebaseAdmin.getCollection("products");
        setProducts(newProductsData as Product[]);
        console.log(`🌱 Seeded ${newProductsData.length} products`);
      } else {
        setProducts(productsData as Product[]);
        console.log(`✅ Loaded ${productsData.length} existing products`);
      }

      setInitialSetupDone(true);
      console.log("🎉 Admin dashboard initialization completed successfully");
    } catch (error) {
      console.error("💥 Error initializing admin dashboard:", error);
      setConnectionError(
        error instanceof Error ? error.message : "Unknown connection error"
      );
      // Set some fallback data so the dashboard doesn't crash
      setOrders([]);
      setProducts([]);
      setInitialSetupDone(true); // Set to true to show the dashboard even with empty data
    } finally {
      setLoading(false);
      console.log("🏁 Loading state set to false");
    }
  };

  const loadOrders = async () => {
    try {
      console.log("📡 Loading orders from Firebase...");
      const ordersData = await firebaseAdmin.getCollection("orders");
      console.log("📊 Orders loaded:", ordersData.length, "items");
      setOrders(ordersData as Order[]);
      return ordersData;
    } catch (error) {
      console.error("❌ Error loading orders:", error);
      return [];
    }
  };

  const loadProducts = async () => {
    try {
      console.log("📡 Loading products from Firebase...");
      const productsData = await firebaseAdmin.getCollection("products");
      console.log("📊 Products loaded:", productsData.length, "items");
      setProducts(productsData as Product[]);
      return productsData;
    } catch (error) {
      console.error("❌ Error loading products:", error);
      return [];
    }
  };

  const refreshData = async () => {
    console.log("🔄 Manual data refresh triggered");
    setLoading(true);
    try {
      await Promise.all([loadOrders(), loadProducts()]);
      console.log("✅ Data refresh completed");
    } catch (error) {
      console.error("❌ Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await firebaseAdmin.updateDocument("orders", orderId, {
        status: newStatus,
      });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus as any } : order
        )
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus as any } : null
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await firebaseAdmin.deleteDocument("orders", orderId);
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
          setCurrentView("orders");
        }
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  // PDF Export Functions
  const exportOrderToPDF = (order: Order) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text("KANI Gift Hampers", 20, 20);
    doc.setFontSize(16);
    doc.text("Order Receipt", 20, 35);

    // Order Details
    doc.setFontSize(12);
    doc.text(`Order Number: ${getOrderNumber(order)}`, 20, 55);
    doc.text(`Internal ID: ${order.id}`, 20, 65);
    doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 20, 75);
    doc.text(`Status: ${order.status.toUpperCase()}`, 20, 85);

    // Customer Details
    doc.text("Customer Details:", 20, 105);
    doc.text(`Name: ${getCustomerDisplayName(order.customerName)}`, 25, 115);
    doc.text(`Email: ${order.email}`, 25, 125);
    doc.text(`Phone: ${order.phone}`, 25, 135);
    doc.text(`Address: ${order.address}`, 25, 145);

    // Order Items
    doc.text("Order Items:", 20, 165);
    doc.text(`${getHamperDisplayTitle(order)}: ₹${order.hamperPrice}`, 25, 175);

    let yPos = 185;
    if (order.additionalRakhis.length > 0) {
      doc.text("Additional Rakhis:", 25, yPos);
      yPos += 10;
      order.additionalRakhis.forEach((rakhi: any) => {
        doc.text(
          `${rakhi.name} (x${rakhi.quantity}): ₹${
            rakhi.price * rakhi.quantity
          }`,
          30,
          yPos
        );
        yPos += 10;
      });
    }

    if (order.addons.length > 0) {
      doc.text("Add-ons:", 25, yPos);
      yPos += 10;
      order.addons.forEach((addon: any) => {
        doc.text(
          `${addon.name} (x${addon.quantity}): ₹${
            addon.price * addon.quantity
          }`,
          30,
          yPos
        );
        yPos += 10;
      });
    }

    // Total
    doc.setFontSize(14);
    doc.text(`Total Amount: ₹${order.total}`, 20, yPos + 20);

    // Personal Message
    if (order.message) {
      doc.setFontSize(12);
      doc.text("Personal Message:", 20, yPos + 40);
      doc.text(`"${order.message}"`, 25, yPos + 50);
    }

    doc.save(`order-${getOrderNumber(order)}.pdf`);
  };

  const exportOrdersToCSV = () => {
    const headers = [
      "Order Number",
      "Customer Name",
      "Email",
      "Phone",
      "Hamper",
      "Total",
      "Status",
      "Date",
      "Internal ID",
    ];
    const csvContent = [
      headers.join(","),
      ...orders.map((order) =>
        [
          getOrderNumber(order),
          getCustomerDisplayName(order.customerName),
          order.email || "N/A",
          order.phone || "N/A",
          getHamperDisplayTitle(order),
          order.total || 0,
          order.status || "pending",
          order.orderDate
            ? new Date(order.orderDate).toLocaleDateString()
            : "N/A",
          order.id,
        ].join(",")
      ),
    ].join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Product Management Functions
  const saveProduct = async () => {
    try {
      if (!productForm.name || !productForm.price || !productForm.description) {
        alert("Please fill in all required fields");
        return;
      }

      let imageURL = productForm.imageURL || "/api/placeholder/300/200";

      // Upload image if a new file is selected
      if (productForm.imageFile) {
        try {
          const timestamp = Date.now();
          const fileName = `products/${timestamp}_${productForm.imageFile.name}`;
          const storageRef = ref(storage, fileName);

          console.log("📤 Uploading image:", fileName);
          const snapshot = await uploadBytes(storageRef, productForm.imageFile);
          imageURL = await getDownloadURL(snapshot.ref);
          console.log("✅ Image uploaded successfully:", imageURL);
        } catch (uploadError) {
          console.error("❌ Error uploading image:", uploadError);
          alert(
            "Error uploading image. Product will be saved with placeholder image."
          );
        }
      }

      const productData = {
        name: productForm.name,
        type: productForm.type,
        price: parseInt(productForm.price),
        description: productForm.description,
        category: productForm.category,
        inStock: productForm.inStock,
        popularity: selectedProduct?.popularity || 50,
        imageURL: imageURL,
      };

      if (selectedProduct) {
        await firebaseAdmin.updateDocument(
          "products",
          selectedProduct.id,
          productData
        );
        setProducts((prev) =>
          prev.map((product) =>
            product.id === selectedProduct.id
              ? { ...product, ...productData }
              : product
          )
        );
        console.log("✅ Product updated successfully");
      } else {
        const newProductRef = await firebaseAdmin.addDocument(
          "products",
          productData
        );
        const newProduct = { id: newProductRef.id, ...productData } as Product;
        setProducts((prev) => [...prev, newProduct]);
        console.log("✅ New product created successfully");
      }

      setProductForm({
        name: "",
        type: "",
        price: "",
        description: "",
        category: "hamper",
        inStock: true,
        imageFile: null,
        imageURL: "",
      });
      setSelectedProduct(null);
      setCurrentView("products");
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product. Please try again.");
    }
  };

  const deleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await firebaseAdmin.deleteDocument("products", productId);
        setProducts((prev) =>
          prev.filter((product) => product.id !== productId)
        );
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const editProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      type: product.type,
      price: product.price.toString(),
      description: product.description,
      category: product.category,
      inStock: product.inStock,
      imageFile: null,
      imageURL: product.imageURL || "",
    });
    setCurrentView("product-form");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3 h-3" />;
      case "processing":
        return <Package className="w-3 h-3" />;
      case "shipped":
        return <Truck className="w-3 h-3" />;
      case "delivered":
        return <CheckCircle className="w-3 h-3" />;
      case "cancelled":
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // Helper function to generate readable order numbers
  const getOrderNumber = (order: Order) => {
    if (order.orderNumber) {
      return order.orderNumber;
    }
    // Generate a readable order number based on date and index
    const date = new Date(order.orderDate);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // Use a simple counter based on the Firebase ID
    const idHash = order.id.slice(-4).toUpperCase();
    return `KH${year}${month}${day}-${idHash}`;
  };

  // Helper function to get short customer display name
  const getCustomerDisplayName = (customerName: string) => {
    if (
      !customerName ||
      customerName === "undefined" ||
      customerName === "null"
    ) {
      return "Anonymous Customer";
    }
    return customerName;
  };

  // Helper function to get hamper title with fallback
  const getHamperDisplayTitle = (order: Order) => {
    // First try to get the hamperTitle field
    if (
      order.hamperTitle &&
      order.hamperTitle !== "undefined" &&
      order.hamperTitle !== "null"
    ) {
      return order.hamperTitle;
    }

    // Fallback: try to map hamperType ID to title
    if (order.hamperType) {
      const hamperTypeMap: { [key: string]: string } = {
        normal: "Normal Hamper",
        silver: "Silver Hamper",
        gold: "Gold Hamper",
        custom: "Custom Hamper",
      };
      return hamperTypeMap[order.hamperType] || `Hamper (${order.hamperType})`;
    }

    return "Unknown Hamper";
  };

  const getStatistics = () => {
    const totalOrders = orders?.length || 0;
    const totalRevenue =
      orders?.reduce((sum, order) => sum + (order?.total || 0), 0) || 0;
    const pendingOrders =
      orders?.filter((order) => order?.status === "pending")?.length || 0;
    const deliveredOrders =
      orders?.filter((order) => order?.status === "delivered")?.length || 0;

    return { totalOrders, totalRevenue, pendingOrders, deliveredOrders };
  };

  const filteredOrders = (orders || []).filter((order) => {
    if (!order) return false;

    const matchesSearch =
      (order.customerName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.id || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== "all" && order.orderDate) {
      const orderDate = new Date(order.orderDate);
      const today = new Date();

      // Reset time to start of day for accurate comparison
      today.setHours(0, 0, 0, 0);
      orderDate.setHours(0, 0, 0, 0);

      if (dateFilter === "today") {
        matchesDate = orderDate.getTime() === today.getTime();
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = orderDate >= weekAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Dashboard Overview Component
  const DashboardOverview = () => {
    const stats = getStatistics();

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Welcome back! Here's what's happening.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Orders: {orders?.length || 0} | Products: {products?.length || 0}{" "}
              | Setup: {initialSetupDone ? "✅" : "⏳"} | Loading:{" "}
              {loading ? "⏳" : "✅"}
            </p>
            {connectionError && (
              <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">
                Connection Issue: {connectionError}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
            <button
              onClick={() => setCurrentView("products")}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Package className="w-4 h-4" />
              Manage Products
            </button>
            <button
              onClick={exportOrdersToCSV}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export Orders
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.totalOrders}
                </p>
              </div>
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ₹{stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Orders
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.pendingOrders}
                </p>
              </div>
              <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stats.deliveredOrders}
                </p>
              </div>
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-4">
            🔧 Debug Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-yellow-700 mb-2">
                Database Status
              </h4>
              <ul className="text-sm space-y-1">
                <li>
                  Orders in DB:{" "}
                  <span className="font-mono">{orders.length}</span>
                </li>
                <li>
                  Products in DB:{" "}
                  <span className="font-mono">{products.length}</span>
                </li>
                <li>
                  Connection:{" "}
                  <span className="font-mono">
                    {connectionError ? "❌ Error" : "✅ OK"}
                  </span>
                </li>
                <li>
                  Last loaded:{" "}
                  <span className="font-mono">
                    {new Date().toLocaleTimeString()}
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-700 mb-2">
                Recent Orders (Last 3)
              </h4>
              <div className="space-y-1">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="text-sm bg-white p-2 rounded border"
                  >
                    <span className="font-medium">{order.customerName}</span> -
                    <span className="text-gray-600 ml-1">
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString()
                        : "No date"}
                    </span>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-sm text-yellow-600 italic">
                    No orders found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Recent Orders
              </h2>
              <button
                onClick={() => setCurrentView("orders")}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                View All Orders
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getOrderNumber(order)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getCustomerDisplayName(order.customerName)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{order.total}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status
                            ? order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)
                            : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 sm:px-6 py-8 text-center text-gray-500"
                    >
                      No orders found. Orders will appear here once customers
                      place them.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Orders List Component
  const OrdersList = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            View and manage all customer orders ({filteredOrders.length} orders)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            {loading ? "Refreshing..." : "Refresh Orders"}
          </button>
          <button
            onClick={() => setCurrentView("dashboard")}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent force-ltr"
              dir="ltr"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders && filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getOrderNumber(order)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getHamperDisplayTitle(order)}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getCustomerDisplayName(order.customerName)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.email || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status || "pending"}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-none ${getStatusColor(
                          order.status || "pending"
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{order.total || 0}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            console.log("👁️ View order clicked:", order);
                            setSelectedOrder(order);
                            setCurrentView("order-detail");
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => exportOrderToPDF(order)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 sm:px-6 py-8 text-center text-gray-500"
                  >
                    {loading
                      ? "Loading orders..."
                      : "No orders found. Orders will appear here once customers place them."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Order Detail Component
  const OrderDetail = () => {
    console.log("🔍 OrderDetail rendering. selectedOrder:", selectedOrder);

    if (!selectedOrder) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
              <p className="text-yellow-800 font-medium">No order selected</p>
              <p className="text-yellow-600 text-sm mt-1">
                Please select an order from the orders list to view details.
              </p>
              <button
                onClick={() => setCurrentView("orders")}
                className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Order Details
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Order #{getOrderNumber(selectedOrder)}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => exportOrderToPDF(selectedOrder)}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={() => setCurrentView("orders")}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Information */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Order Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order Number:</span>
                <span className="text-sm font-medium text-gray-900">
                  {getOrderNumber(selectedOrder)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Internal ID:</span>
                <span className="text-xs font-mono text-gray-500">
                  {selectedOrder.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order Date:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(selectedOrder.orderDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Delivery Date:</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedOrder.deliveryDate}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status
                    ? selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1)
                    : "Pending"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Status:</span>
                <span
                  className={`text-sm font-medium ${
                    selectedOrder.paymentStatus === "completed"
                      ? "text-green-600"
                      : selectedOrder.paymentStatus === "pending"
                      ? "text-yellow-600"
                      : selectedOrder.paymentStatus === "failed"
                      ? "text-red-600"
                      : "text-blue-600"
                  }`}
                >
                  {selectedOrder.paymentStatus === "cash_on_delivery"
                    ? "Cash on Delivery"
                    : selectedOrder.paymentStatus.charAt(0).toUpperCase() +
                      selectedOrder.paymentStatus.slice(1)}
                </span>
              </div>
              {selectedOrder.paymentId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment ID:</span>
                  <span className="text-sm font-medium text-gray-900 font-mono">
                    {selectedOrder.paymentId}
                  </span>
                </div>
              )}
              {selectedOrder.razorpayOrderId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Razorpay Order ID:
                  </span>
                  <span className="text-sm font-medium text-gray-900 font-mono">
                    {selectedOrder.razorpayOrderId}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tracking Number:</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedOrder.trackingNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Customer Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {getCustomerDisplayName(selectedOrder.customerName)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {selectedOrder.phone}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {selectedOrder.address}
                </span>
              </div>
            </div>

            {selectedOrder.message && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Personal Message:
                </p>
                <p className="text-sm text-gray-600 italic">
                  "{selectedOrder.message}"
                </p>
              </div>
            )}
          </div>

          {/* Customer Photos */}
          {((selectedOrder.photos && selectedOrder.photos.length > 0) ||
            selectedOrder.photoURL) && (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Customer Photos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {selectedOrder.photos && selectedOrder.photos.length > 0 ? (
                  selectedOrder.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Customer photo ${index + 1}`}
                        className="w-full h-32 sm:h-40 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        Photo {index + 1}
                      </div>
                    </div>
                  ))
                ) : selectedOrder.photoURL ? (
                  <div className="relative">
                    <img
                      src={selectedOrder.photoURL}
                      alt="Customer photo"
                      className="w-full h-32 sm:h-40 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      Photo 1
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Order Items
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">
                  {getHamperDisplayTitle(selectedOrder)}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  ₹{selectedOrder.hamperPrice}
                </span>
              </div>

              {selectedOrder.additionalRakhis.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Additional Rakhis:
                  </p>
                  {selectedOrder.additionalRakhis.map(
                    (rakhi: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm">
                          {rakhi.name} (x{rakhi.quantity})
                        </span>
                        <span className="text-sm font-medium">
                          ₹{rakhi.price * rakhi.quantity}
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}

              {selectedOrder.addons.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Add-ons:
                  </p>
                  {selectedOrder.addons.map((addon: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <span className="text-sm">
                        {addon.name} (x{addon.quantity})
                      </span>
                      <span className="text-sm font-medium">
                        ₹{addon.price * addon.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Amount:</span>
                  <span className="text-red-600">₹{selectedOrder.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Products List Component
  const ProductsList = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Products Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage your hampers, rakhis, and add-ons
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setSelectedProduct(null);
              setProductForm({
                name: "",
                type: "",
                price: "",
                description: "",
                category: "hamper",
                inStock: true,
                imageFile: null,
                imageURL: "",
              });
              setCurrentView("product-form");
            }}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
          <button
            onClick={() => setCurrentView("dashboard")}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <img
              src={product.imageURL}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {product.name}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.category === "hamper"
                      ? "bg-purple-100 text-purple-800"
                      : product.category === "rakhi"
                      ? "bg-pink-100 text-pink-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {product.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {product.description}
              </p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-red-600">
                  ₹{product.price}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    product.inStock
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Popularity:</span>
                  <span className="text-xs font-medium text-gray-700">
                    {product.popularity}%
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editProduct(product)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Product Form Component
  const ProductForm = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {selectedProduct ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {selectedProduct
              ? "Update product information"
              : "Create a new product for your store"}
          </p>
        </div>
        <button
          onClick={() => setCurrentView("products")}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter product name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent force-ltr"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Type
              </label>
              <input
                type="text"
                value={productForm.type}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, type: e.target.value }))
                }
                placeholder="e.g., gold, silver, traditional"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent force-ltr"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="Enter price"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={productForm.category}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    category: e.target.value as any,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="hamper">Hamper</option>
                <option value="rakhi">Rakhi</option>
                <option value="addon">Add-on</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setProductForm((prev) => ({
                            ...prev,
                            imageFile: file,
                            imageURL: URL.createObjectURL(file),
                          }));
                        }
                      }}
                    />
                  </label>
                </div>

                {productForm.imageURL && (
                  <div className="relative">
                    <img
                      src={productForm.imageURL}
                      alt="Product preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setProductForm((prev) => ({
                          ...prev,
                          imageFile: null,
                          imageURL: "",
                        }))
                      }
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="inStock"
                checked={productForm.inStock}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    inStock: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <label
                htmlFor="inStock"
                className="text-sm font-medium text-gray-700"
              >
                In Stock
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={productForm.description}
              onChange={(e) =>
                setProductForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter product description"
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent force-ltr"
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => setCurrentView("products")}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={saveProduct}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            {selectedProduct ? "Update Product" : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );

  console.log(
    "🎨 Rendering AdminDashboard. Loading:",
    loading,
    "Setup done:",
    initialSetupDone,
    "Orders:",
    orders.length,
    "Products:",
    products.length
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading admin dashboard...</p>
              <p className="text-xs text-gray-500 mt-2">
                Initializing Firebase connection and loading data...
              </p>
            </div>
          </div>
        ) : !initialSetupDone ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
                <p className="text-yellow-800 font-medium">
                  Setup in progress...
                </p>
                <p className="text-yellow-600 text-sm mt-1">
                  Please wait while we initialize your admin dashboard.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {currentView === "dashboard" && <DashboardOverview />}
            {currentView === "orders" && <OrdersList />}
            {currentView === "order-detail" && <OrderDetail />}
            {currentView === "products" && <ProductsList />}
            {currentView === "product-form" && <ProductForm />}
          </>
        )}
      </div>
    </div>
  );
});

export default AdminDashboard;
