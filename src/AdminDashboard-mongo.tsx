import React, { useState, useEffect } from "react";
import {
  Package,
  Eye,
  XCircle,
  Search,
  Download,
  Edit,
  Trash2,
  ShoppingBag,
  Plus,
  Save,
  X,
  Image,
} from "lucide-react";
import jsPDF from "jspdf";
import { getApiUrl } from "./api-config";

// Types
interface Order {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  hamperType: string;
  hamperTitle: string;
  hamperPrice: number;
  photoURL?: string;
  photos?: string[];
  message: string;
  additionalRakhis: any[];
  addons: any[];
  totalAmount?: number;
  total?: number; // For backward compatibility
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Rakhi {
  _id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  description: string;
}

interface Addon {
  _id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  description: string;
}

// MongoDB API functions
const mongoAdmin = {
  // Get all documents from a collection
  async getCollection(collectionName: string) {
    try {
      console.log(`🔍 Fetching collection: ${collectionName}`);
      const response = await fetch(getApiUrl(`/api/${collectionName}`));
      if (!response.ok) {
        throw new Error(`Failed to fetch ${collectionName}`);
      }
      const data = await response.json();
      console.log(`✅ Fetched ${data.length} items from ${collectionName}`);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching ${collectionName}:`, error);
      throw error;
    }
  },

  // Add a new document to a collection
  async addDocument(collectionName: string, data: any) {
    try {
      console.log(`➕ Adding document to ${collectionName}:`, data);
      const response = await fetch(getApiUrl(`/api/${collectionName}`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to add document to ${collectionName}`);
      }
      const result = await response.json();
      console.log(`✅ Added document to ${collectionName}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error adding document to ${collectionName}:`, error);
      throw error;
    }
  },

  // Update a document in a collection
  async updateDocument(collectionName: string, id: string, data: any) {
    try {
      console.log(`🔄 Updating document in ${collectionName}:`, id, data);
      const response = await fetch(getApiUrl(`/api/${collectionName}/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update document in ${collectionName}`);
      }
      const result = await response.json();
      console.log(`✅ Updated document in ${collectionName}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error updating document in ${collectionName}:`, error);
      throw error;
    }
  },

  // Delete a document from a collection
  async deleteDocument(collectionName: string, id: string) {
    try {
      console.log(`🗑️ Deleting document from ${collectionName}:`, id);
      const response = await fetch(getApiUrl(`/api/${collectionName}/${id}`), {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete document from ${collectionName}`);
      }
      const result = await response.json();
      console.log(`✅ Deleted document from ${collectionName}:`, result);
      return result;
    } catch (error) {
      console.error(
        `❌ Error deleting document from ${collectionName}:`,
        error
      );
      throw error;
    }
  },

  // Upload image to Cloudinary
  async uploadImage(file: File) {
    try {
      console.log("📤 Uploading image to Cloudinary:", file.name);
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(getApiUrl("/api/upload"), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      console.log("✅ Image uploaded to Cloudinary:", data.url);
      return data.url;
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      throw error;
    }
  },
};

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [rakhis, setRakhis] = useState<Rakhi[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [uploading, setUploading] = useState<boolean>(false);

  // Load data when component mounts or tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      if (activeTab === "orders") {
        const ordersData = await mongoAdmin.getCollection("orders");
        setOrders(ordersData);
      } else if (activeTab === "rakhis") {
        const rakhisData = await mongoAdmin.getCollection("rakhis");
        setRakhis(rakhisData);
      } else if (activeTab === "addons") {
        const addonsData = await mongoAdmin.getCollection("addons");
        setAddons(addonsData);
      }
    } catch (err: any) {
      setError(`Failed to load ${activeTab}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      alert(
        `File size too large. Maximum size allowed is 5MB.\nYour file: ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB\n\nPlease compress your image and try again.`
      );
      event.target.value = ""; // Clear the input
      return;
    }

    // Check file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      alert(
        "Invalid file format. Only JPEG, PNG, GIF, and WebP files are allowed."
      );
      event.target.value = ""; // Clear the input
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await mongoAdmin.uploadImage(file);
      setFormData((prev: any) => ({ ...prev, image: imageUrl }));
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload image";
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission for adding/editing items
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const collection = activeTab === "rakhis" ? "rakhis" : "addons";

      if (editingItem) {
        await mongoAdmin.updateDocument(collection, editingItem._id, formData);
      } else {
        await mongoAdmin.addDocument(collection, formData);
      }

      setShowForm(false);
      setEditingItem(null);
      setFormData({});
      loadData();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item");
    }
  };

  // Handle order status update
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log(`🔄 Updating order status for ${orderId} to ${newStatus}`);
      const response = await fetch(getApiUrl(`/api/orders/${orderId}/status`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update order status`);
      }

      const result = await response.json();
      console.log(`✅ Updated order status:`, result);

      loadData(); // Reload the data to show updated status
    } catch (error) {
      console.error("Error updating order status:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to update order status: ${errorMessage}`);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const collection =
        activeTab === "rakhis"
          ? "rakhis"
          : activeTab === "addons"
          ? "addons"
          : "orders";
      await mongoAdmin.deleteDocument(collection, id);
      loadData();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item");
    }
  };

  // Filter data based on search term
  const getFilteredData = () => {
    const searchLower = searchTerm.toLowerCase();
    if (activeTab === "orders") {
      return orders.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchLower) ||
          order.email.toLowerCase().includes(searchLower) ||
          order.phone.includes(searchTerm) ||
          order._id.toLowerCase().includes(searchLower)
      );
    } else if (activeTab === "rakhis") {
      return rakhis.filter((rakhi) =>
        rakhi.name.toLowerCase().includes(searchLower)
      );
    } else if (activeTab === "addons") {
      return addons.filter((addon) =>
        addon.name.toLowerCase().includes(searchLower)
      );
    }
    return [];
  };

  // Generate PDF receipt
  const generatePDF = (order: Order) => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text("KANI Gift Hampers", 20, 30);
    doc.setFontSize(16);
    doc.text("Order Receipt", 20, 50);

    // Add order details
    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id}`, 20, 70);
    doc.text(`Customer: ${order.customerName}`, 20, 85);
    doc.text(`Email: ${order.email}`, 20, 100);
    doc.text(`Phone: ${order.phone}`, 20, 115);
    doc.text(`Address: ${order.address}`, 20, 130);
    doc.text(`Hamper: ${order.hamperTitle}`, 20, 145);
    doc.text(
      `Total Amount: ₹${order.totalAmount || order.total || 0}`,
      20,
      160
    );
    doc.text(`Status: ${order.status}`, 20, 175);
    doc.text(
      `Order Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      20,
      190
    );

    // Save the PDF
    doc.save(`order-${order._id}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                KANI Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage your Rakhi hamper business</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Connected to MongoDB Atlas
              </p>
              <p className="text-sm text-green-600">
                ✅ Cloudinary Integration Active
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b">
            {[
              { id: "orders", label: "Orders", icon: Package },
              { id: "rakhis", label: "Rakhis", icon: ShoppingBag },
              { id: "addons", label: "Add-ons", icon: Plus },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-red-600 border-b-2 border-red-500 bg-red-50"
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            {(activeTab === "rakhis" || activeTab === "addons") && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingItem(null);
                  setFormData({});
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add {activeTab === "rakhis" ? "Rakhi" : "Add-on"}
              </button>
            )}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "orders" && (
          <OrdersTab
            orders={getFilteredData() as Order[]}
            onUpdateStatus={updateOrderStatus}
            onGeneratePDF={generatePDF}
            onViewDetails={setSelectedOrder}
          />
        )}

        {activeTab === "rakhis" && (
          <ItemsTab
            items={getFilteredData() as Rakhi[]}
            type="rakhi"
            onEdit={(item) => {
              setEditingItem(item);
              setFormData(item);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
        )}

        {activeTab === "addons" && (
          <ItemsTab
            items={getFilteredData() as Addon[]}
            type="addon"
            onEdit={(item) => {
              setEditingItem(item);
              setFormData(item);
              setShowForm(true);
            }}
            onDelete={handleDelete}
          />
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <OrderDetailsModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onUpdateStatus={updateOrderStatus}
            onGeneratePDF={generatePDF}
          />
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <FormModal
            item={editingItem}
            formData={formData}
            type={activeTab === "rakhis" ? "rakhi" : "addon"}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowForm(false);
              setEditingItem(null);
              setFormData({});
            }}
            onChange={setFormData}
            onImageUpload={handleImageUpload}
            uploading={uploading}
          />
        )}
      </div>
    </div>
  );
};

// Orders Tab Component
const OrdersTab: React.FC<{
  orders: Order[];
  onUpdateStatus: (id: string, status: string) => void;
  onGeneratePDF: (order: Order) => void;
  onViewDetails: (order: Order) => void;
}> = ({ orders, onUpdateStatus, onGeneratePDF, onViewDetails }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hamper
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order._id.slice(-8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {order.customerName}
                    </div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.hamperTitle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{order.totalAmount || order.total || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewDetails(order)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onGeneratePDF(order)}
                      className="text-green-600 hover:text-green-900"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        onUpdateStatus(order._id, e.target.value)
                      }
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Items Tab Component (for Rakhis and Add-ons)
const ItemsTab: React.FC<{
  items: (Rakhi | Addon)[];
  type: string;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}> = ({ items, type, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {items.map((item) => (
          <div
            key={item._id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <div className="aspect-square bg-gray-100">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <p className="text-lg font-bold text-red-600 mb-3">
                ₹{item.price}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(item)}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 flex items-center justify-center gap-1"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="flex-1 bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <div className="text-center py-8">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No {type}s found</p>
        </div>
      )}
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal: React.FC<{
  order: Order;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onGeneratePDF: (order: Order) => void;
}> = ({ order, onClose, onUpdateStatus, onGeneratePDF }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Customer Information
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {order.customerName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {order.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {order.phone}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {order.address}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Order Information
              </h3>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Order ID:</span> {order._id}
                </p>
                <p>
                  <span className="font-medium">Hamper:</span>{" "}
                  {order.hamperTitle}
                </p>
                <p>
                  <span className="font-medium">Total Amount:</span> ₹
                  {order.totalAmount || order.total || 0}
                </p>
                <p>
                  <span className="font-medium">Status:</span> {order.status}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {order.message && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Message</h3>
              <p className="bg-gray-50 p-3 rounded-lg">{order.message}</p>
            </div>
          )}

          {((order.photos && order.photos.length > 0) || order.photoURL) && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Uploaded Photo
                {order.photos && order.photos.length > 1 ? "s" : ""}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.photos && order.photos.length > 0 ? (
                  order.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Customer uploaded photo ${index + 1}`}
                        className="w-full max-w-xs rounded-lg border object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        Photo {index + 1}
                      </span>
                    </div>
                  ))
                ) : order.photoURL ? (
                  <img
                    src={order.photoURL}
                    alt="Customer uploaded"
                    className="max-w-xs rounded-lg border"
                  />
                ) : null}
              </div>
            </div>
          )}

          {order.additionalRakhis.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                Additional Rakhis
              </h3>
              <div className="space-y-2">
                {order.additionalRakhis.map((rakhi, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-3 rounded-lg flex justify-between"
                  >
                    <span>
                      {rakhi.name} x {rakhi.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{rakhi.price * rakhi.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.addons.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Add-ons</h3>
              <div className="space-y-2">
                {order.addons.map((addon, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-3 rounded-lg flex justify-between"
                  >
                    <span>
                      {addon.name} x {addon.quantity}
                    </span>
                    <span className="font-medium">
                      ₹{addon.price * addon.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(order._id, e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => onGeneratePDF(order)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Form Modal Component
const FormModal: React.FC<{
  item: any;
  formData: any;
  type: string;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onChange: (data: any) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}> = ({
  item,
  formData,
  type,
  onSubmit,
  onClose,
  onChange,
  onImageUpload,
  uploading,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {item ? `Edit ${type}` : `Add New ${type}`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  onChange({ ...formData, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  onChange({ ...formData, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) =>
                  onChange({ ...formData, price: Number(e.target.value) })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category || ""}
                onChange={(e) =>
                  onChange({ ...formData, category: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={onImageUpload}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500">
                  Maximum file size: 5MB. Supported formats: JPEG, PNG, GIF,
                  WebP
                </p>
                {uploading && (
                  <p className="text-sm text-blue-600">Uploading image...</p>
                )}
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {item ? "Update" : "Add"} {type}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
