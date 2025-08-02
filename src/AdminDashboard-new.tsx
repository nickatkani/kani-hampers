import React, { useState, useEffect } from "react";
import {
  Package,
  Eye,
  Calendar,
  Phone,
  MapPin,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Search,
  Filter,
  Download,
  ArrowLeft,
  Edit,
  Trash2,
  Bell,
  BarChart3,
  Users,
  ShoppingBag,
  TrendingUp,
  Plus,
  FileText,
  Save,
  X,
} from "lucide-react";
import jsPDF from "jspdf";

// Mock orders data
const mockOrders = [
  {
    id: "ORD001",
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
    orderDate: "2024-07-05T10:30:00Z",
    deliveryDate: "2024-08-12",
    status: "pending",
    paymentStatus: "completed",
    trackingNumber: "TRK123456789",
  },
  {
    id: "ORD002",
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
    orderDate: "2024-07-04T14:15:00Z",
    deliveryDate: "2024-08-11",
    status: "processing",
    paymentStatus: "completed",
    trackingNumber: "TRK987654321",
  },
  {
    id: "ORD003",
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
    orderDate: "2024-07-03T09:45:00Z",
    deliveryDate: "2024-08-10",
    status: "delivered",
    paymentStatus: "completed",
    trackingNumber: "TRK555666777",
  },
];

// Mock products data
const mockProducts = [
  {
    id: "PROD001",
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
    id: "PROD002",
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
    id: "PROD003",
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
    id: "PROD004",
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
    id: "PROD005",
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
    id: "PROD006",
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
    id: "PROD007",
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

// Mock Firebase implementation for admin
const mockAdminFirebase = {
  collection: (name: string) => ({
    get: async () => {
      if (name === "orders") {
        return {
          docs: mockOrders.map((order) => ({
            id: order.id,
            data: () => order,
          })),
        };
      } else if (name === "products") {
        return {
          docs: mockProducts.map((product) => ({
            id: product.id,
            data: () => product,
          })),
        };
      }
      return { docs: [] };
    },
    doc: (id: string) => ({
      get: async () => {
        if (name === "orders") {
          return {
            exists: true,
            data: () => mockOrders.find((order) => order.id === id),
          };
        } else if (name === "products") {
          return {
            exists: true,
            data: () => mockProducts.find((product) => product.id === id),
          };
        }
        return { exists: false };
      },
      update: async (data: any) => {
        if (name === "orders") {
          console.log(`Updating order ${id}:`, data);
          const orderIndex = mockOrders.findIndex((order) => order.id === id);
          if (orderIndex > -1) {
            Object.assign(mockOrders[orderIndex], data);
          }
        } else if (name === "products") {
          console.log(`Updating product ${id}:`, data);
          const productIndex = mockProducts.findIndex(
            (product) => product.id === id
          );
          if (productIndex > -1) {
            Object.assign(mockProducts[productIndex], data);
          }
        }
      },
      delete: async () => {
        if (name === "orders") {
          console.log(`Deleting order ${id}`);
          const orderIndex = mockOrders.findIndex((order) => order.id === id);
          if (orderIndex > -1) {
            mockOrders.splice(orderIndex, 1);
          }
        } else if (name === "products") {
          console.log(`Deleting product ${id}`);
          const productIndex = mockProducts.findIndex(
            (product) => product.id === id
          );
          if (productIndex > -1) {
            mockProducts.splice(productIndex, 1);
          }
        }
      },
    }),
    add: async (data: any) => {
      if (name === "products") {
        const newProduct = {
          id: `PROD${(mockProducts.length + 1).toString().padStart(3, "0")}`,
          ...data,
        };
        mockProducts.push(newProduct);
        return { id: newProduct.id };
      }
      return { id: "unknown" };
    },
  }),
};

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
  customerName: string;
  email: string;
  phone: string;
  address: string;
  hamperType: string;
  hamperTitle: string;
  hamperPrice: number;
  photoURL: string;
  message: string;
  additionalRakhis: any[];
  addons: any[];
  total: number;
  orderDate: string;
  deliveryDate: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "completed" | "failed";
  trackingNumber: string;
}

const AdminDashboard = () => {
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
  });

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  const loadOrders = async () => {
    try {
      const snapshot = await mockAdminFirebase.collection("orders").get();
      const ordersData = snapshot.docs.map((doc) => ({ ...doc.data() }));
      setOrders(ordersData as Order[]);
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const snapshot = await mockAdminFirebase.collection("products").get();
      const productsData = snapshot.docs.map((doc) => ({ ...doc.data() }));
      setProducts(productsData as Product[]);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await mockAdminFirebase
        .collection("orders")
        .doc(orderId)
        .update({ status: newStatus });
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
        await mockAdminFirebase.collection("orders").doc(orderId).delete();
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
    doc.text("KANI Rakhi Hampers", 20, 20);
    doc.setFontSize(16);
    doc.text("Order Receipt", 20, 35);

    // Order Details
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.id}`, 20, 55);
    doc.text(`Date: ${new Date(order.orderDate).toLocaleDateString()}`, 20, 65);
    doc.text(`Status: ${order.status.toUpperCase()}`, 20, 75);

    // Customer Details
    doc.text("Customer Details:", 20, 95);
    doc.text(`Name: ${order.customerName}`, 25, 105);
    doc.text(`Email: ${order.email}`, 25, 115);
    doc.text(`Phone: ${order.phone}`, 25, 125);
    doc.text(`Address: ${order.address}`, 25, 135);

    // Order Items
    doc.text("Order Items:", 20, 155);
    doc.text(`${order.hamperTitle}: ₹${order.hamperPrice}`, 25, 165);

    let yPos = 175;
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

    doc.save(`order-${order.id}.pdf`);
  };

  const exportOrdersToCSV = () => {
    const headers = [
      "Order ID",
      "Customer Name",
      "Email",
      "Phone",
      "Hamper",
      "Total",
      "Status",
      "Date",
    ];
    const csvContent = [
      headers.join(","),
      ...orders.map((order) =>
        [
          order.id,
          order.customerName,
          order.email,
          order.phone,
          order.hamperTitle,
          order.total,
          order.status,
          new Date(order.orderDate).toLocaleDateString(),
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

      const productData = {
        ...productForm,
        price: parseInt(productForm.price),
        popularity: 50,
        imageURL: "/api/placeholder/300/200",
      };

      if (selectedProduct) {
        await mockAdminFirebase
          .collection("products")
          .doc(selectedProduct.id)
          .update(productData);
        setProducts((prev) =>
          prev.map((product) =>
            product.id === selectedProduct.id
              ? { ...product, ...productData }
              : product
          )
        );
      } else {
        const newProductRef = await mockAdminFirebase
          .collection("products")
          .add(productData);
        const newProduct = { id: newProductRef.id, ...productData } as Product;
        setProducts((prev) => [...prev, newProduct]);
      }

      setProductForm({
        name: "",
        type: "",
        price: "",
        description: "",
        category: "hamper",
        inStock: true,
      });
      setSelectedProduct(null);
      setCurrentView("products");
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await mockAdminFirebase.collection("products").doc(productId).delete();
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

  const getStatistics = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;
    const deliveredOrders = orders.filter(
      (order) => order.status === "delivered"
    ).length;

    return { totalOrders, totalRevenue, pendingOrders, deliveredOrders };
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" &&
        new Date(order.orderDate).toDateString() ===
          new Date().toDateString()) ||
      (dateFilter === "week" &&
        new Date(order.orderDate) >
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

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
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
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
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customerName}
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
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
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
            View and manage all customer orders
          </p>
        </div>
        <button
          onClick={() => setCurrentView("dashboard")}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.hamperTitle}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value)
                      }
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-none ${getStatusColor(
                        order.status
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
                    ₹{order.total}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setCurrentView("order-detail");
                        }}
                        className="text-blue-600 hover:text-blue-900"
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Order Detail Component
  const OrderDetail = () => {
    if (!selectedOrder) return null;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Order Details
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Order #{selectedOrder.id}
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
                <span className="text-sm text-gray-600">Order ID:</span>
                <span className="text-sm font-medium text-gray-900">
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
                  {selectedOrder.status.charAt(0).toUpperCase() +
                    selectedOrder.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Status:</span>
                <span className="text-sm font-medium text-green-600">
                  {selectedOrder.paymentStatus}
                </span>
              </div>
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
                  {selectedOrder.customerName}
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

          {/* Order Items */}
          <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Order Items
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">
                  {selectedOrder.hamperTitle}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === "dashboard" && <DashboardOverview />}
        {currentView === "orders" && <OrdersList />}
        {currentView === "order-detail" && <OrderDetail />}
        {currentView === "products" && <ProductsList />}
        {currentView === "product-form" && <ProductForm />}
      </div>
    </div>
  );
};

export default AdminDashboard;
