import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Heart,
  Upload,
  ShoppingCart,
  Star,
  Instagram,
  MessageCircle,
  Phone,
  Package,
  Gift,
  Camera,
  Plus,
  Minus,
  Check,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react";
import { db, storage } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  RAZORPAY_CONFIG,
  initializeRazorpayPayment,
  convertToPaisa,
  formatAmount,
  RazorpayResponse,
} from "./razorpay";
import { validateEnvironment } from "./env-validation";

// Types
interface Rakhi {
  id: string;
  name: string;
  image: string;
  category: string;
  price: number;
  description: string;
}

interface HamperOption {
  id: string;
  title: string;
  description: string;
  image: string;
  includes: string[];
  price: number;
  showPrice?: boolean;
}

interface Cart {
  hamper: HamperOption | null;
  photo: string | null;
  photos: string[];
  message: string;
  additionalRakhis: any[];
  addons: any[];
  total: number;
}

// Firebase utility functions
const addDataToFirestore = async (name: string, data: any) => {
  try {
    console.log(`Adding data to ${name}:`, data);
    const docRef = await addDoc(collection(db, name), {
      ...data,
      timestamp: serverTimestamp(),
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

const getDataFromFirestore = async (name: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, name));
    const data: any[] = [];
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return data;
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw e;
  }
};

const getDocumentFromFirestore = async (name: string, id: string) => {
  try {
    const docRef = doc(db, name, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (e) {
    console.error("Error getting document: ", e);
    throw e;
  }
};

const updateDocumentInFirestore = async (
  name: string,
  id: string,
  data: any
) => {
  try {
    const docRef = doc(db, name, id);
    await updateDoc(docRef, {
      ...data,
      lastUpdated: serverTimestamp(),
    });
    console.log("Document updated successfully");
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
};

const uploadFileToStorage = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("File uploaded successfully, download URL: ", downloadURL);
    return downloadURL;
  } catch (e) {
    console.error("Error uploading file: ", e);
    throw e;
  }
};

// Mock data
const mockData = {
  rakhis: [
    {
      id: "1",
      name: "Traditional Thread Rakhi",
      image: "/api/placeholder/150/150",
      category: "Traditional",
      price: 50,
      description: "Classic red and gold thread rakhi",
    },
    {
      id: "2",
      name: "Silver Rakhi",
      image: "/api/placeholder/150/150",
      category: "Premium",
      price: 150,
      description: "Beautiful silver rakhi with intricate design",
    },
  ],
};

// Cart Page Component
const CartPageComponent = ({
  cart,
  setCurrentPage,
  calculateTotal,
  placeOrder,
  loading,
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  cart: any;
  setCurrentPage: (page: string) => void;
  calculateTotal: () => number;
  placeOrder: (orderData: any) => void;
  loading: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) => {
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    pincode: "",
    deliveryDate: "",
  });

  const handlePlaceOrder = () => {
    placeOrder({
      cart,
      deliveryInfo,
    });
  };

  // Mobile Navigation Component
  const MobileNavigation = () => (
    <div className="md:hidden">
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 right-4 z-50 bg-white rounded-full p-2 shadow-lg"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-50 p-6">
            <div className="mt-16 space-y-4">
              <button
                onClick={() => {
                  setCurrentPage("home");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentPage("hampers");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                Hampers
              </button>
              <button
                onClick={() => {
                  setCurrentPage("cart");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                Cart ({cart?.photos?.length || 0})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 sm:py-12 px-4 sm:px-6">
      <MobileNavigation />

      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setCurrentPage("customize")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 sm:mb-8 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to Customization
        </button>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Order Summary
            </h1>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Hamper details */}
            {cart.hamper && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold mb-4">Selected Hamper</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium">{cart.hamper.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {cart.hamper.description}
                  </p>
                  <p className="text-red-600 font-bold mt-2">
                    ₹{cart.hamper.price}
                  </p>
                </div>
              </div>
            )}

            {/* Photos */}
            {cart.photos && cart.photos.length > 0 && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold mb-4">Your Photos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {cart.photos.map((photo: string, index: number) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Message */}
            {cart.message && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold mb-4">Personal Message</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{cart.message}</p>
                </div>
              </div>
            )}

            {/* Delivery Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Delivery Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryInfo.name}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setDeliveryInfo((prev) => ({ ...prev, name: value }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={deliveryInfo.email}
                    onChange={(e) =>
                      setDeliveryInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={deliveryInfo.phone}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setDeliveryInfo((prev) => ({ ...prev, phone: value }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter 10-digit phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={deliveryInfo.pincode}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setDeliveryInfo((prev) => ({ ...prev, pincode: value }));
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter 6-digit pincode"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <textarea
                  required
                  value={deliveryInfo.address}
                  onChange={(e) =>
                    setDeliveryInfo((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter complete delivery address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryInfo.deliveryDate}
                  onChange={(e) =>
                    setDeliveryInfo((prev) => ({
                      ...prev,
                      deliveryDate: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span>
                <span className="text-red-600">₹{calculateTotal()}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={
                loading ||
                !deliveryInfo.name ||
                !deliveryInfo.email ||
                !deliveryInfo.phone ||
                !deliveryInfo.address ||
                !deliveryInfo.pincode
              }
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Personal Message Step Component
const PersonalMessageStep = React.memo(
  ({
    message,
    onMessageChange,
    onPrevious,
    onNext,
  }: {
    message: string;
    onMessageChange: (message: string) => void;
    onPrevious: () => void;
    onNext: () => void;
  }) => {
    const divRef = useRef<HTMLDivElement>(null);

    const handleContentChange = useCallback(() => {
      const div = divRef.current;
      if (div) {
        const text = div.textContent || "";
        if (text.length <= 100) {
          onMessageChange(text);
        } else {
          const truncated = text.substring(0, 100);
          div.textContent = truncated;
          onMessageChange(truncated);
        }
      }
    }, [onMessageChange]);

    useEffect(() => {
      const div = divRef.current;
      if (div) {
        div.textContent = message;
        div.focus();

        const range = document.createRange();
        const sel = window.getSelection();
        if (div.childNodes.length > 0) {
          range.setStartAfter(div.childNodes[div.childNodes.length - 1]);
        } else {
          range.setStart(div, 0);
        }
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }, []);

    useEffect(() => {
      const div = divRef.current;
      if (div && div.textContent !== message) {
        div.textContent = message;
      }
    }, [message]);

    return (
      <div className="text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Personal Message
        </h2>
        <p className="text-gray-600 mb-6">
          Add a heartfelt message for your loved one
        </p>

        <div className="mb-6">
          <div
            ref={divRef}
            contentEditable
            onInput={handleContentChange}
            className="w-full min-h-[120px] p-4 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none resize-none text-left"
            style={{
              lineHeight: "1.6",
              fontSize: "16px",
            }}
            suppressContentEditableWarning={true}
          />
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <span>Express your feelings...</span>
            <span>{message.length}/100</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={onPrevious}
            className="px-6 py-3 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Previous
          </button>
          <button
            onClick={onNext}
            className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            Review Order
            <ArrowLeft className="w-4 h-4 inline ml-2 rotate-180" />
          </button>
        </div>
      </div>
    );
  }
);

// Main Component
const KaniRakhiWebsite = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentRoseSlide, setCurrentRoseSlide] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cart, setCart] = useState<Cart>({
    hamper: null,
    photo: null,
    photos: [],
    message: "",
    additionalRakhis: [],
    addons: [],
    total: 0,
  });
  const [customizationStep, setCustomizationStep] = useState(1);
  const [rakhiData, setRakhiData] = useState<Rakhi[]>([]);
  const [loading, setLoading] = useState(false);

  // Validate environment variables on component mount
  useEffect(() => {
    validateEnvironment();
  }, []);

  // Carousel images
  const carouselImages = [
    "/carousel/csr1.jpg",
    "/carousel/csr2.jpg",
    "/carousel/csr3.jpg",
    "/carousel/csr4.jpg",
    "/carousel/csr5.jpg",
    "/carousel/csr6.jpg",
  ];

  // Rose collaborator images
  const roseImages = [
    "/rose/rosalie_necklace.jpg",
    "/rose/amora_necklace.jpg",
    "/rose/daisy_necklace.jpg",
    "/rose/crystal_dual_necklace.jpg",
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [carouselImages.length]);

  // Auto-advance rose carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRoseSlide((prev) => (prev + 1) % roseImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [roseImages.length]);

  // Hamper options
  const hamperOptions: HamperOption[] = [
    {
      id: "normal",
      title: "Normal Hamper",
      description: "A beautiful basic hamper with traditional items",
      image: "/api/placeholder/300/200",
      includes: ["Basic Rakhi", "Message Card", "Haldi Kum Kum"],
      price: 251,
    },
    {
      id: "silver",
      title: "Silver Hamper",
      description: "Premium hamper with silver coin and photos",
      image: "/api/placeholder/300/200",
      includes: [
        "1gm Silver Coin",
        "Classic Rakhi",
        "Dry Fruits + Chocolates",
        "2 Photos",
        "Haldi Kum Kum",
      ],
      price: 551,
    },
    {
      id: "gold",
      title: "Gold Hamper",
      description: "Luxury hamper with premium items and photos",
      image: "/api/placeholder/300/200",
      includes: [
        "Ferrero Rocher Chocolates",
        "Premium Rakhi",
        "3 Photos",
        "1 Silver Coin 2.5gm",
      ],
      price: 1001,
    },
    {
      id: "custom",
      title: "Custom Hamper",
      description: "Create your perfect personalized hamper",
      image: "/api/placeholder/300/200",
      includes: [
        "Choose Your Own Rakhis",
        "Select Your Add-ons",
        "Personalize Everything",
        "Complete Customization",
        "Your Perfect Hamper",
      ],
      price: 1501,
      showPrice: false,
    },
  ];

  // Photo upload utilities
  const getMaxPhotos = (hamperId?: string): number => {
    switch (hamperId) {
      case "normal":
        return 0; // Normal hamper doesn't allow photos
      case "silver":
        return 2; // Silver hamper allows 2 photos
      case "gold":
        return 3; // Gold hamper allows 3 photos
      case "custom":
        return 5; // Custom hamper allows up to 5 photos
      default:
        return 1;
    }
  };

  const canAddMorePhotos = (): boolean => {
    const maxPhotos = getMaxPhotos(cart.hamper?.id);
    return cart.photos.length < maxPhotos;
  };

  const getUploadButtonText = (): string => {
    const maxPhotos = getMaxPhotos(cart.hamper?.id);
    const currentCount = cart.photos.length;

    if (maxPhotos === 0) return "No photos needed";
    if (maxPhotos === 1) return "Upload Photo";
    return `Upload Photos (${currentCount}/${maxPhotos})`;
  };

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        console.log("❌ No file selected");
        return;
      }

      console.log("📁 File selected:", {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString(),
      });

      // Enhanced validation
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        const error = `Invalid file type: ${file.type}. Please select a JPEG, PNG, GIF, or WebP image.`;
        console.error("❌ Validation error:", error);
        alert(error);
        return;
      }

      const maxSize = 2 * 1024 * 1024; // 2MB limit
      if (file.size > maxSize) {
        const error = `File too large: ${(file.size / 1024 / 1024).toFixed(
          2
        )}MB. Maximum size is 2MB.`;
        console.error("❌ Size validation error:", error);
        alert(error);
        return;
      }

      // Check photo limits
      const maxPhotos = getMaxPhotos(cart.hamper?.id);
      if (cart.photos.length >= maxPhotos) {
        const error = `Maximum ${maxPhotos} photos allowed for ${
          cart.hamper?.title || "this hamper"
        }`;
        console.error("❌ Limit validation error:", error);
        alert(error);
        return;
      }

      try {
        console.log("🖼️ Creating preview...");
        // Create immediate preview
        const previewURL = URL.createObjectURL(file);

        // Add preview to cart immediately for better UX
        setCart((prev) => ({
          ...prev,
          photos: [...prev.photos, previewURL],
          photo: prev.photos.length === 0 ? previewURL : prev.photo,
        }));

        console.log("⬆️ Photo uploaded successfully!");
        alert(`Photo uploaded successfully! ${file.name}`);
      } catch (error) {
        console.error("❌ Upload error:", error);
        alert("Upload failed. Please try again.");
      } finally {
        // Clear input for future uploads
        event.target.value = "";
        console.log("🧹 Upload process completed, input cleared");
      }
    },
    [cart.hamper?.id, cart.photos.length]
  );

  // File input click handler
  const handleFileInputClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Remove photo
  const removePhoto = (index: number) => {
    setCart((prev) => {
      const newPhotos = prev.photos.filter((_, i) => i !== index);
      return {
        ...prev,
        photos: newPhotos,
        photo: newPhotos.length > 0 ? newPhotos[0] : null,
      };
    });
  };

  // Calculate total
  const calculateTotal = () => {
    let total = cart.hamper?.price || 0;
    cart.additionalRakhis.forEach((rakhi: any) => {
      total += rakhi.price * rakhi.quantity;
    });
    cart.addons.forEach((addon: any) => {
      total += addon.price * addon.quantity;
    });

    // Add delivery charge
    const deliveryCharge = parseInt(
      import.meta.env.VITE_DELIVERY_CHARGE || "120"
    );
    total += deliveryCharge;

    return total;
  };

  // Place order
  const placeOrder = async (orderData: any) => {
    try {
      setLoading(true);
      console.log("🛒 Placing order:", orderData);

      if (!window.Razorpay) {
        console.error("❌ Razorpay is not loaded");
        alert("Payment gateway is not available. Please try again later.");
        return;
      }

      const amount = calculateTotal();
      console.log("💰 Order amount:", amount);

      if (amount <= 0) {
        alert("Invalid order amount");
        return;
      }

      // Save order to Firestore first
      const orderId = await addDataToFirestore("orders", {
        ...orderData,
        amount: amount,
        status: "pending",
        razorpayOrderId: null,
        paymentId: null,
      });

      console.log("📝 Order saved to Firestore with ID:", orderId);

      // Create Razorpay options
      const options = {
        key: RAZORPAY_CONFIG.key,
        amount: convertToPaisa(amount),
        currency: "INR",
        name: "Kani Hampers",
        description: `Order for ${cart.hamper?.title || "Custom Hamper"}`,
        handler: async function (response: any) {
          console.log("✅ Payment successful:", response);

          try {
            // Update order with payment details
            await updateDocumentInFirestore("orders", orderId, {
              paymentId: response.razorpay_payment_id,
              status: "paid",
              paidAt: new Date().toISOString(),
            });

            alert(
              "Order placed successfully! You will receive a confirmation email shortly."
            );

            // Reset cart and go to home
            setCart({
              hamper: null,
              photo: null,
              photos: [],
              message: "",
              additionalRakhis: [],
              addons: [],
              total: 0,
            });
            setCurrentPage("home");
          } catch (error) {
            console.error("❌ Error updating order:", error);
            alert(
              "Payment received but there was an error. Please contact support."
            );
          }
        },
        prefill: {
          name: orderData.deliveryInfo.name,
          email: orderData.deliveryInfo.email,
          contact: orderData.deliveryInfo.phone,
        },
        theme: {
          color: "#ef4444",
        },
      };

      console.log("🚀 Creating Razorpay instance with options:", options);
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        console.error("❌ Payment failed:", response.error);
        alert("Payment failed: " + response.error.description);
        setLoading(false);
      });

      console.log("🚀 Opening payment modal...");
      rzp.open();
    } catch (error) {
      console.error("❌ Error in placeOrder:", error);
      setLoading(false);
      alert("There was an error processing your order. Please try again.");
    }
  };

  // Mobile Navigation Component
  const MobileNavigation = () => (
    <div className="md:hidden">
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 right-4 z-50 bg-white rounded-full p-2 shadow-lg"
      >
        {mobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg z-50 p-6">
            <div className="mt-16 space-y-4">
              <button
                onClick={() => {
                  setCurrentPage("home");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentPage("hampers");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                Hampers
              </button>
              <button
                onClick={() => {
                  setCurrentPage("cart");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                Cart ({cart?.photos?.length || 0})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Customize Page Component
  const CustomizePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 sm:py-12 px-4 sm:px-6">
      <MobileNavigation />

      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setCurrentPage("hampers")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 sm:mb-8 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to Hampers
        </button>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Customize Your {cart.hamper?.title}
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <div
                className={`flex items-center gap-2 ${
                  customizationStep >= 1 ? "text-red-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    customizationStep >= 1
                      ? "bg-red-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  1
                </div>
                <span className="hidden sm:inline">Choose Hamper</span>
              </div>
              <div className="flex-1 h-px bg-gray-200"></div>
              <div
                className={`flex items-center gap-2 ${
                  customizationStep >= 2 ? "text-red-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    customizationStep >= 2
                      ? "bg-red-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  2
                </div>
                <span className="hidden sm:inline">Add Photos</span>
              </div>
              <div className="flex-1 h-px bg-gray-200"></div>
              <div
                className={`flex items-center gap-2 ${
                  customizationStep >= 3 ? "text-red-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    customizationStep >= 3
                      ? "bg-red-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  3
                </div>
                <span className="hidden sm:inline">Message</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Step 1: Choose Hamper (Already selected) */}
            {customizationStep === 1 && cart.hamper && (
              <div className="text-center">
                <h2 className="text-xl font-bold mb-4">Selected Hamper</h2>
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold">{cart.hamper.title}</h3>
                  <p className="text-gray-600 mt-2">
                    {cart.hamper.description}
                  </p>
                  <p className="text-red-600 font-bold text-xl mt-4">
                    ₹{cart.hamper.price}
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Photo Upload */}
            {customizationStep === 2 && (
              <div>
                <h2 className="text-xl font-bold text-center mb-6">
                  Add Your Photos
                </h2>

                {getMaxPhotos(cart.hamper?.id) > 0 ? (
                  <div className="space-y-6">
                    {/* Photo upload area */}
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <Camera className="w-12 h-12 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Add Your Photos
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Upload up to {getMaxPhotos(cart.hamper?.id)} photos
                            for your hamper
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleFileInputClick}
                          disabled={!canAddMorePhotos()}
                          className={`px-6 py-3 rounded-full font-medium transition-colors ${
                            canAddMorePhotos()
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <Upload className="w-5 h-5 inline mr-2" />
                          {getUploadButtonText()}
                        </button>
                      </div>
                    </div>

                    {/* Display uploaded photos */}
                    {cart.photos.length > 0 && (
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        {cart.photos.map((photo, index) => (
                          <div key={index} className="relative">
                            <img
                              src={photo}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removePhoto(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      This hamper doesn't require photo uploads.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Personal Message */}
            {customizationStep === 3 && (
              <PersonalMessageStep
                message={cart.message}
                onMessageChange={(message) =>
                  setCart((prev) => ({ ...prev, message }))
                }
                onPrevious={() => setCustomizationStep(customizationStep - 1)}
                onNext={() => setCurrentPage("cart")}
              />
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-6 border-t">
              <button
                onClick={() => {
                  if (customizationStep > 1) {
                    setCustomizationStep(customizationStep - 1);
                  } else {
                    setCurrentPage("hampers");
                  }
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Back
              </button>

              <button
                onClick={() => {
                  if (customizationStep < 3) {
                    setCustomizationStep(customizationStep + 1);
                  } else {
                    setCurrentPage("cart");
                  }
                }}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                {customizationStep === 3 ? "Review Order" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <MobileNavigation />

      {currentPage === "home" && (
        <div>
          {/* Hero Section with Carousel */}
          <div className="relative bg-gradient-to-br from-orange-50 to-red-50">
            <MobileNavigation />

            {/* Hero Background Carousel */}
            <div className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 text-center overflow-hidden min-h-[500px] sm:min-h-[600px]">
              {/* Background carousel */}
              <div className="absolute inset-0">
                {carouselImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div
                      className="w-full h-full bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
                  </div>
                ))}
              </div>

              {/* Hero content */}
              <div className="relative z-10 max-w-4xl mx-auto">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                  Kani Hampers
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                  Celebrate Raksha Bandhan with Love, Tradition & Beautiful
                  Memories
                </p>
                <button
                  onClick={() => setCurrentPage("hampers")}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
                >
                  <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
                  Shop Hampers
                </button>
              </div>

              {/* Carousel indicators */}
              <div className="flex justify-center mt-8 space-x-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Featured Hampers */}
            <div className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-8">
                  Our Special Hampers
                </h2>
                <p className="text-lg text-gray-600 text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
                  Choose from our carefully curated hamper collections, each
                  designed to make your Raksha Bandhan celebration unforgettable
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
                  {hamperOptions.map((hamper) => (
                    <div
                      key={hamper.id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer transform hover:scale-105"
                      onClick={() => {
                        setCart((prev) => ({ ...prev, hamper }));
                        setCurrentPage("customize");
                      }}
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-400 to-orange-400 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                        <Gift className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>

                      <div className="p-6">
                        <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6">
                          {hamper.showPrice !== false
                            ? `₹${hamper.price}`
                            : "Custom"}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                          {hamper.title}
                        </h3>
                        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                          {hamper.description}
                        </p>
                        <ul className="space-y-2 mb-6 sm:mb-8">
                          {hamper.includes.slice(0, 3).map((item, index) => (
                            <li
                              key={index}
                              className="flex items-center text-sm sm:text-base text-gray-700"
                            >
                              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                          {hamper.includes.length > 3 && (
                            <li className="text-sm text-gray-500">
                              +{hamper.includes.length - 3} more items
                            </li>
                          )}
                        </ul>
                        <button className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 transform group-hover:scale-105">
                          Customize Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-br from-amber-50 to-orange-100">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 sm:mb-12">
                  Why Choose Kani Hampers?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  <div className="p-4 sm:p-6">
                    <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Made with Love
                    </h3>
                    <p className="text-gray-600">
                      Every hamper is carefully curated and packed with love to
                      make your celebration special.
                    </p>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="w-16 h-16 bg-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Personal Photos
                    </h3>
                    <p className="text-gray-600">
                      Add your precious memories with custom photo uploads for a
                      truly personal touch.
                    </p>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Fast Delivery
                    </h3>
                    <p className="text-gray-600">
                      Quick and secure delivery to ensure your hamper reaches on
                      time for the celebration.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rose Collaboration Section */}
            <div className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 text-center overflow-hidden min-h-[500px] sm:min-h-[600px]">
              {/* Background carousel for Rose images */}
              <div className="absolute inset-0">
                {roseImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentRoseSlide ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <div
                      className="w-full h-full bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                  </div>
                ))}
              </div>

              {/* Rose content */}
              <div className="relative z-10 max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
                  Special Collaboration
                </h2>
                <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                  Discover our exclusive jewelry collection in partnership with
                  Rose
                </p>
                <div className="flex justify-center space-x-3 sm:space-x-4">
                  <button className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-6 sm:px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
                    <Instagram className="w-5 h-5 inline mr-2" />
                    Follow Us
                  </button>
                  <button className="bg-white/20 hover:bg-white/30 text-white px-6 sm:px-8 py-3 rounded-full font-semibold transition-all duration-300 backdrop-blur-sm">
                    Learn More
                  </button>
                </div>
              </div>

              {/* Rose carousel indicators */}
              <div className="flex justify-center mt-8 space-x-2">
                {roseImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentRoseSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentRoseSlide
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div className="py-12 sm:py-16 px-4 sm:px-6 bg-gray-900 text-white">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">
                  Get in Touch
                </h2>
                <p className="text-lg text-gray-300 mb-8 sm:mb-12">
                  Have questions about our hampers? We're here to help make your
                  Raksha Bandhan perfect!
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
                  <a
                    href="tel:+91xxxxxxxxxx"
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full transition-all duration-300"
                  >
                    <Phone className="w-5 h-5" />
                    Call Us
                  </a>
                  <a
                    href="https://wa.me/91xxxxxxxxxx"
                    className="flex items-center gap-3 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full transition-all duration-300"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </a>
                  <a
                    href="https://instagram.com/kanihampers"
                    className="flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 px-6 py-3 rounded-full transition-all duration-300"
                  >
                    <Instagram className="w-5 h-5" />
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPage === "hampers" && (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
          <MobileNavigation />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Choose Your Perfect Hamper
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Each hamper is carefully designed to create beautiful memories
                and celebrate the bond of love
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
              {hamperOptions.map((hamper) => (
                <div
                  key={hamper.id}
                  className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 cursor-pointer transform hover:scale-105"
                  onClick={() => {
                    setCart((prev) => ({ ...prev, hamper }));
                    setCurrentPage("customize");
                  }}
                >
                  <div className="relative">
                    <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center">
                      <Gift className="w-20 h-20 sm:w-24 sm:h-24 text-white" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-red-600">
                        {hamper.showPrice !== false
                          ? `₹${hamper.price}`
                          : "Custom"}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                      {hamper.title}
                    </h3>
                    <p className="text-gray-600 mb-6 text-base sm:text-lg leading-relaxed">
                      {hamper.description}
                    </p>

                    <div className="space-y-3 mb-8">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        What's Included:
                      </h4>
                      <ul className="space-y-2">
                        {hamper.includes.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-center text-gray-700"
                          >
                            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-base">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-3xl font-bold text-red-600">
                        {hamper.showPrice !== false
                          ? `₹${hamper.price}`
                          : "Custom Price"}
                      </div>
                      <button className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform group-hover:scale-105 shadow-lg">
                        Customize Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to action */}
            <div className="text-center mt-12 sm:mt-16">
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Need Help Choosing?
                </h3>
                <p className="text-gray-600 mb-6">
                  Our team is here to help you create the perfect hamper for
                  your loved ones
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp Us
                  </button>
                  <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 inline-flex items-center justify-center gap-2">
                    <Phone className="w-5 h-5" />
                    Call Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPage === "customize" && <CustomizePage />}

      {currentPage === "cart" && (
        <CartPageComponent
          cart={cart}
          setCurrentPage={setCurrentPage}
          calculateTotal={calculateTotal}
          placeOrder={placeOrder}
          loading={loading}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}
    </div>
  );
};

export default KaniRakhiWebsite;
