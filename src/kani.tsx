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
import { RAZORPAY_CONFIG, convertToPaisa } from "./razorpay";

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
  includes: string[];
  price: number;
  showPrice?: boolean; // Optional property to control price display
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Cart {
  hamper: HamperOption | null;
  photo: string | null; // Keep for backwards compatibility
  photos: string[]; // New array for multiple photos
  message: string;
  additionalRakhis: CartItem[];
  addons: CartItem[];
  total: number;
}

// Firebase implementation for customer-facing app (currently unused - using backend API instead)
/*
const firebaseCustomer = {
  // Database operations
  collection: (name: string) => ({
    add: async (data: any) => {
      try {
        const docRef = await addDoc(collection(db, name), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        console.log(`Added to ${name}:`, docRef.id);
        return { id: docRef.id };
      } catch (error) {
        console.error(`Error adding to ${name}:`, error);
        throw error;
      }
    },
    get: async () => {
      try {
        const querySnapshot = await getDocs(collection(db, name));
        return {
          docs: querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })),
        };
      } catch (error) {
        console.error(`Error getting ${name}:`, error);
        return { docs: [] };
      }
    },
    doc: (id: string) => ({
      get: async () => {
        try {
          const docRef = doc(db, name, id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            return {
              exists: true,
              data: () => ({ id: docSnap.id, ...docSnap.data() }),
            };
          } else {
            return { exists: false };
          }
        } catch (error) {
          console.error(`Error getting document:`, error);
          return { exists: false };
        }
      },
      update: async (data: any) => {
        try {
          const docRef = doc(db, name, id);
          await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
          });
          console.log(`Updated ${name}/${id}:`, data);
        } catch (error) {
          console.error(`Error updating ${name}/${id}:`, error);
          throw error;
        }
      },
    }),
  }),
  storage: {
    ref: (path: string) => ({
      put: async (file: File) => {
        try {
          console.log("Uploading file:", file.name);
          const storageRef = ref(storage, path);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          console.log("File uploaded successfully. Download URL:", downloadURL);

          return {
            ref: {
              getDownloadURL: async () => downloadURL,
            },
          };
        } catch (error) {
          console.error("Error uploading file:", error);
          // Fallback to blob URL for demo purposes
          return {
            ref: {
              getDownloadURL: async () => URL.createObjectURL(file),
            },
          };
        }
      },
    }),
  },
};
*/

// Mock data for initial seeding (will be replaced with Firebase data)
const mockData = {
  rakhis: [
    {
      id: "1",
      name: "Scarlet Spark",
      image: "/gallery/images/rakhi/scarlet_spark.jpg",
      category: "Premium",
      price: 50,
      description: "Premium handcrafted rakhi with vibrant red accents",
    },
    {
      id: "2",
      name: "Prithvi Bond",
      image: "/gallery/images/rakhi/prithvi_bond.jpg",
      category: "Premium",
      price: 50,
      description: "Earth-inspired premium rakhi symbolizing eternal bond",
    },
    {
      id: "3",
      name: "Kesar Bindu",
      image: "/gallery/images/rakhi/kesar_bindu.jpg",
      category: "Premium",
      price: 50,
      description: "Saffron-themed premium rakhi with golden touches",
    },
    {
      id: "4",
      name: "Megh Sutra",
      image: "/gallery/images/rakhi/meghsutra.jpg",
      category: "Premium",
      price: 50,
      description: "Cloud-inspired premium rakhi with silver threads",
    },
  ],
  testimonials: [
    {
      name: "Priya Sharma",
      text: "My brother loved the personalized hamper! The childhood photo made him so emotional. ❤️",
      rating: 5,
    },
    {
      name: "Raj Patel",
      text: "Amazing quality and fast delivery. Will definitely order again next year!",
      rating: 5,
    },
    {
      name: "Sneha Gupta",
      text: "The handcrafted rakhis are beautiful. Such attention to detail!",
      rating: 5,
    },
  ],
};

// Cart Page Component - Moved outside to prevent re-creation
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
    // Validate all required fields are filled
    if (
      !deliveryInfo.name ||
      !deliveryInfo.email ||
      !deliveryInfo.address ||
      !deliveryInfo.phone ||
      !deliveryInfo.pincode
    ) {
      alert("Please fill all delivery details");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(deliveryInfo.email)) {
      alert("Please enter a valid email address (e.g., name@domain.com)");
      return;
    }

    // Validate phone number (must be exactly 10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(deliveryInfo.phone)) {
      alert(
        "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"
      );
      return;
    }

    // Validate pincode (must be exactly 6 digits)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(deliveryInfo.pincode)) {
      alert("Please enter a valid 6-digit Indian pincode (e.g., 110001)");
      return;
    }

    // Validate address length (minimum 10 characters for a complete address)
    if (deliveryInfo.address.length < 10) {
      alert(
        "Please enter a complete address with at least 10 characters including house/flat number, street, area, and city"
      );
      return;
    }

    // Validate name (minimum 2 characters, no numbers or special characters)
    const nameRegex = /^[a-zA-Z\s]{2,}$/;
    if (!nameRegex.test(deliveryInfo.name)) {
      alert(
        "Please enter a valid full name (only letters and spaces, minimum 2 characters)"
      );
      return;
    }

    placeOrder(deliveryInfo);
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
                  setCurrentPage("choose");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                Choose Hamper
              </button>
              <button
                onClick={() => {
                  setCurrentPage("cart");
                  setMobileMenuOpen(false);
                }}
                className="flex w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100 items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart ({cart.additionalRakhis.length + cart.addons.length})
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
          onClick={() => {
            // Normal Hamper should go back to hamper selection, others to customization
            if (cart.hamper?.id === "normal") {
              setCurrentPage("choose");
            } else {
              setCurrentPage("customize");
            }
          }}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 sm:mb-8 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          {cart.hamper?.id === "normal"
            ? "Back to Hampers"
            : "Back to Customize"}
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
          Review Your Order
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              Order Summary
            </h2>

            {/* Hamper Details */}
            {cart.hamper && (
              <div className="border-b border-gray-200 pb-3 sm:pb-4 mb-3 sm:mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-semibold">
                    {cart.hamper.title}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-red-600">
                    ₹{cart.hamper.price}
                  </span>
                </div>
              </div>
            )}

            {/* Photos */}
            {cart.photos && cart.photos.length > 0 && (
              <div className="border-b border-gray-200 pb-3 sm:pb-4 mb-3 sm:mb-4">
                <span className="text-sm sm:text-base font-semibold mb-2 block">
                  Photos ({cart.photos.length})
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {cart.photos.map((photo: string, index: number) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-16 sm:h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Legacy single photo support */}
            {cart.photo && (!cart.photos || cart.photos.length === 0) && (
              <div className="border-b border-gray-200 pb-3 sm:pb-4 mb-3 sm:mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base">Childhood Photo</span>
                  <img
                    src={cart.photo}
                    alt="Uploaded"
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Message */}
            {cart.message && (
              <div className="border-b border-gray-200 pb-3 sm:pb-4 mb-3 sm:mb-4">
                <span className="text-sm sm:text-base font-semibold">
                  Personal Message:
                </span>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  "{cart.message}"
                </p>
              </div>
            )}

            {/* Additional Rakhis */}
            {cart.additionalRakhis.length > 0 && (
              <div className="border-b border-gray-200 pb-3 sm:pb-4 mb-3 sm:mb-4">
                <span className="text-sm sm:text-base font-semibold">
                  Additional Rakhis:
                </span>
                {cart.additionalRakhis.map((rakhi: any) => (
                  <div
                    key={rakhi.id}
                    className="flex justify-between items-center mt-2"
                  >
                    <span className="text-sm sm:text-base">
                      {rakhi.name} (x{rakhi.quantity})
                    </span>
                    <span className="text-sm sm:text-base font-bold text-red-600">
                      ₹{rakhi.price * rakhi.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Add-ons */}
            {cart.addons.length > 0 && (
              <div className="border-b border-gray-200 pb-3 sm:pb-4 mb-3 sm:mb-4">
                <span className="text-sm sm:text-base font-semibold">
                  Add-ons:
                </span>
                {cart.addons.map((addon: any) => (
                  <div
                    key={addon.id}
                    className="flex justify-between items-center mt-2"
                  >
                    <span className="text-sm sm:text-base">
                      {addon.name} (x{addon.quantity})
                    </span>
                    <span className="text-sm sm:text-base font-bold text-red-600">
                      ₹{addon.price * addon.quantity}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
              <span>Total:</span>
              <span className="text-red-600">₹{calculateTotal()}</span>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              Delivery Information
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <input
                type="text"
                placeholder="Full Name (e.g., Priya Sharma)"
                value={deliveryInfo.name}
                onChange={(e) => {
                  // Only allow letters and spaces
                  const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                  setDeliveryInfo((prev) => ({ ...prev, name: value }));
                }}
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:border-red-400 outline-none text-sm sm:text-base force-ltr"
                dir="ltr"
                maxLength={50}
              />
              <input
                type="email"
                placeholder="Email Address (e.g., priya@gmail.com)"
                value={deliveryInfo.email}
                onChange={(e) =>
                  setDeliveryInfo((prev) => ({
                    ...prev,
                    email: e.target.value.toLowerCase(),
                  }))
                }
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:border-red-400 outline-none text-sm sm:text-base force-ltr"
                dir="ltr"
              />
              <textarea
                placeholder="Complete Address (e.g., Flat 101, ABC Apartments, XYZ Road, Delhi - 110001)"
                value={deliveryInfo.address}
                onChange={(e) =>
                  setDeliveryInfo((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg resize-none h-20 sm:h-24 focus:border-red-400 outline-none text-sm sm:text-base force-ltr"
                dir="ltr"
                maxLength={200}
              />
              <input
                type="tel"
                placeholder="Phone Number (10 digits: 9876543210)"
                value={deliveryInfo.phone}
                onChange={(e) => {
                  // Only allow numbers and limit to 10 digits
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setDeliveryInfo((prev) => ({
                    ...prev,
                    phone: value,
                  }));
                }}
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:border-red-400 outline-none text-sm sm:text-base force-ltr"
                dir="ltr"
                maxLength={10}
              />
              <input
                type="text"
                placeholder="Pincode (6 digits: 110001)"
                value={deliveryInfo.pincode}
                onChange={(e) => {
                  // Only allow numbers and limit to 6 digits
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setDeliveryInfo((prev) => ({
                    ...prev,
                    pincode: value,
                  }));
                }}
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:border-red-400 outline-none text-sm sm:text-base force-ltr"
                dir="ltr"
                maxLength={6}
              />
              <input
                type="date"
                placeholder="Preferred Delivery Date"
                value={deliveryInfo.deliveryDate}
                onChange={(e) =>
                  setDeliveryInfo((prev) => ({
                    ...prev,
                    deliveryDate: e.target.value,
                  }))
                }
                className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:border-red-400 outline-none text-sm sm:text-base"
              />
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-6 sm:mt-8 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base"
            >
              {loading
                ? "Processing Payment..."
                : `Pay Now - ₹${calculateTotal()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Personal Message Step Component - Moved outside to prevent re-creation and focus loss
// CONTENTEDITABLE APPROACH - Manual text control
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

    // Handle content change in contentEditable div
    const handleContentChange = useCallback(() => {
      const div = divRef.current;
      if (div) {
        const text = div.textContent || "";
        if (text.length <= 100) {
          onMessageChange(text);
        } else {
          // If too long, truncate and update
          const truncated = text.substring(0, 100);
          div.textContent = truncated;
          onMessageChange(truncated);
        }
      }
    }, [onMessageChange]);

    // Setup contentEditable div
    useEffect(() => {
      const div = divRef.current;
      if (div) {
        div.textContent = message;
        div.focus();

        // Force cursor to end
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

    // Update content when message prop changes
    useEffect(() => {
      const div = divRef.current;
      if (div && div.textContent !== message) {
        div.textContent = message;
      }
    }, [message]);

    return (
      <div className="text-center max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Add Personal Message
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
          Write a heartfelt message (max 100 characters)
        </p>

        <div className="mb-6">
          <div
            ref={divRef}
            contentEditable
            onInput={handleContentChange}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:outline-none text-base min-h-[4rem] bg-white"
            style={{
              direction: "ltr",
              textAlign: "left",
              fontFamily: "inherit",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
            dir="ltr"
            data-placeholder="Write a short sweet message..."
          />

          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <span>Character count:</span>
            <span className={message.length > 90 ? "text-orange-500" : ""}>
              {message.length}/100
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            type="button"
            onClick={onPrevious}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-full font-semibold transition-colors"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold transition-colors"
          >
            Next Step
          </button>
        </div>
      </div>
    );
  }
);

const KaniRakhiWebsite = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentRoseSlide, setCurrentRoseSlide] = useState(0);
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
  const [addonsData, setAddonsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    "/rose/silver_bar_necklace.jpg",
  ];

  // Auto-advance carousel every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Auto-advance Rose carousel every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRoseSlide((prev) => (prev + 1) % roseImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [roseImages.length]);

  // Memoized callback functions to prevent unnecessary re-renders
  const handleMessageChange = useCallback((message: string) => {
    setCart((prev) => ({ ...prev, message }));
  }, []);

  const handlePreviousStep = useCallback(() => {
    setCustomizationStep(1);
  }, []);

  const handleNextStep = useCallback(() => {
    setCustomizationStep(3);
  }, []);

  // Load rakhi data on component mount
  useEffect(() => {
    loadRakhiData();
  }, []);

  const loadRakhiData = async () => {
    try {
      // Replace Firebase with API call
      const response = await fetch("/api/rakhis");
      const rakhisData = await response.json();

      if (rakhisData.length > 0) {
        setRakhiData(rakhisData);
      } else {
        // Fallback to mock data if no data from API
        setRakhiData(mockData.rakhis);
      }
    } catch (error) {
      console.error("Error loading rakhis:", error);
      // Fallback to mock data on error
      setRakhiData(mockData.rakhis);
    }
  };
  useEffect(() => {
    loadAddonsData();
  }, []);
  const loadAddonsData = async () => {
    try {
      // Replace Firebase with API call
      const response = await fetch("/api/addons");
      const addonsDataFromAPI = await response.json();

      if (addonsDataFromAPI.length > 0) {
        setAddonsData(addonsDataFromAPI);
      } else {
        // Fallback to hardcoded addons if no data from API
        setAddonsData(addons);
      }
    } catch (error) {
      console.error("Error loading add-ons:", error);
      // Fallback to hardcoded addons on error
      setAddonsData(addons);
    }
  };

  const hamperOptions = [
    {
      id: "normal",
      title: "Normal Hamper",
      includes: [
        "Basic Rakhi",
        "Message Card",
        "Haldi Kum Kum",
        "No Photo Customization",
      ],
      price: 251,
    },
    {
      id: "silver",
      title: "Silver Hamper",
      includes: [
        "1gm Silver Coin",
        "Classic Rakhi",
        "Dry Fruits + Chocolates",
        "Haldi Kum Kum",
        "2 Photo Customization",
      ],
      price: 551,
    },
    {
      id: "gold",
      title: "Gold Hamper",
      includes: [
        "Ferrero Rocher Chocolates",
        "Premium Rakhi",
        "1 Silver Coin 2.5gm",
        "3 Photo Customization",
      ],
      price: 1001,
    },
    {
      id: "custom",
      title: "Custom Hamper",
      includes: [
        "Choose Your Own Rakhis",
        "Select Your Add-ons",
        "Personalize Everything",
        "Complete Customization",
        "Your Perfect Hamper",
      ],
      price: 255,
      showPrice: false, // Don't show price as it varies
    },
  ];

  const addons = [
    { id: "choco_ferrero", name: "Ferrero Rocher", price: 150 },
    { id: "dryfruit_pouch", name: "Dry Fruit Pouch", price: 100 },
    { id: "silver_bar_necklace", name: "Silver Bar Necklace", price: 149 },
    { id: "dumbell_gym_bracelet", name: "Dumbell Gym Bracelet", price: 119 },
    { id: "thin_chain_bracelet", name: "Thin Chain Bracelet", price: 129 },
    {
      id: "titan_link_chain_bracelet",
      name: "Titan Link Chain Bracelet",
      price: 169,
    },
    { id: "trident_ring", name: "Trident Ring", price: 159 },
    { id: "daisy_necklace", name: "Daisy Necklace", price: 229 },
    { id: "rosalie_necklace", name: "Rosalie Necklace", price: 249 },
    { id: "crystal_dual_necklace", name: "Crystal Dual Necklace", price: 149 },
    {
      id: "ballon_initial_necklace",
      name: "Ballon Initial Necklace",
      price: 259,
    },
    { id: "amora_heart_necklace", name: "Amora Heart Necklace", price: 249 },
  ];

  // Helper functions for photo management
  const getMaxPhotos = (hamperType: string | undefined): number => {
    switch (hamperType) {
      case "normal":
        return 0; // Normal hamper doesn't need photos
      case "silver":
        return 2; // Silver hamper allows 2 photos
      case "gold":
        return 3; // Gold hamper allows 3 photos
      case "custom":
        return 1; // Custom hamper allows 1 photo
      default:
        return 1;
    }
  };

  const canAddMorePhotos = (): boolean => {
    const maxPhotos = getMaxPhotos(cart.hamper?.id);
    return cart.photos.length < maxPhotos;
  };

  const getPhotoUploadText = (): string => {
    const maxPhotos = getMaxPhotos(cart.hamper?.id);
    const currentCount = cart.photos.length;

    if (maxPhotos === 0) return "No photos needed";
    if (maxPhotos === 1) return "Upload Photo";
    return `Upload Photos (${currentCount}/${maxPhotos})`;
  };

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || !files.length) {
        alert("No file was selected. Please try again.");
        return;
      }

      // Check file sizes (5MB = 5 * 1024 * 1024 bytes)
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = Array.from(files).filter(
        (file) => file.size > maxSizeInBytes
      );

      if (oversizedFiles.length > 0) {
        alert(
          `Some files are too large. Maximum file size allowed is 5MB. Please compress your images and try again.\n\nOversized files:\n${oversizedFiles
            .map(
              (f) => `• ${f.name} (${(f.size / (1024 * 1024)).toFixed(2)}MB)`
            )
            .join("\n")}`
        );
        event.target.value = ""; // Clear the input
        return;
      }

      // Check file types
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const invalidFiles = Array.from(files).filter(
        (file) => !validTypes.includes(file.type)
      );

      if (invalidFiles.length > 0) {
        alert(
          `Some files are not valid image formats. Only JPEG, PNG, GIF, and WebP files are allowed.\n\nInvalid files:\n${invalidFiles
            .map((f) => `• ${f.name}`)
            .join("\n")}`
        );
        event.target.value = ""; // Clear the input
        return;
      }

      const maxPhotos = getMaxPhotos(cart.hamper?.id);
      const remainingSlots = maxPhotos - cart.photos.length;
      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      let localURLs: string[] = [];

      // Add placeholders for local preview immediately
      setCart((prev) => {
        localURLs = filesToUpload.map((file) => URL.createObjectURL(file));
        return {
          ...prev,
          photos: [...prev.photos, ...localURLs], // add local previews immediately
          photo:
            prev.photos.length === 0 && localURLs.length
              ? localURLs[0]
              : prev.photo,
        };
      });

      // Upload to Cloudinary via backend in parallel and patch cart as URLs arrive
      await Promise.all(
        filesToUpload.map(async (file: File, idx: number) => {
          try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            const data = await response.json();

            if (!data.success) {
              throw new Error(data.error || "Upload failed");
            }

            const downloadURL = data.url;

            // Patch just this photo in cart
            setCart((prev) => {
              const indexToUpdate = prev.photos.indexOf(localURLs[idx]);
              if (indexToUpdate === -1) return prev; // Defensive
              const newPhotos = [...prev.photos];
              newPhotos[indexToUpdate] = downloadURL;
              return {
                ...prev,
                photos: newPhotos,
                photo: indexToUpdate === 0 ? downloadURL : prev.photo,
              };
            });
          } catch (error) {
            console.error("Upload failed:", error);
            // Ignore failure here: local preview remains, user can remove/retry
          }
        })
      );

      event.target.value = ""; // Allow re-selecting same file again next time
    },
    [cart.hamper, cart.photos]
  );

  const addToCart = useCallback((item: any, type: string) => {
    if (type === "rakhi") {
      setCart((prev) => {
        const existing = prev.additionalRakhis.find(
          (r: any) => r.id === item.id
        );

        if (existing) {
          return {
            ...prev,
            additionalRakhis: prev.additionalRakhis.map((r: any) =>
              r.id === item.id ? { ...r, quantity: r.quantity + 1 } : r
            ),
          };
        } else {
          return {
            ...prev,
            additionalRakhis: [
              ...prev.additionalRakhis,
              { ...item, quantity: 1 },
            ],
          };
        }
      });
    } else if (type === "addon") {
      setCart((prev) => {
        const existing = prev.addons.find((a: any) => a.id === item.id);

        if (existing) {
          return {
            ...prev,
            addons: prev.addons.map((a: any) =>
              a.id === item.id ? { ...a, quantity: a.quantity + 1 } : a
            ),
          };
        } else {
          return {
            ...prev,
            addons: [...prev.addons, { ...item, quantity: 1 }],
          };
        }
      });
    }
  }, []);

  const removePhoto = (index: number) => {
    setCart((prev) => {
      const newPhotos = prev.photos.filter((_, i) => i !== index);
      return {
        ...prev,
        photos: newPhotos,
        photo: newPhotos.length > 0 ? newPhotos[0] : null, // Update main photo
      };
    });
  };

  const removeFromCart = useCallback((itemId: string, type: string) => {
    if (type === "rakhi") {
      setCart((prev) => {
        const itemIndex = prev.additionalRakhis.findIndex(
          (r: any) => r.id === itemId
        );

        if (itemIndex > -1) {
          const item = prev.additionalRakhis[itemIndex];

          if (item.quantity > 1) {
            return {
              ...prev,
              additionalRakhis: prev.additionalRakhis.map((r: any, index) =>
                index === itemIndex ? { ...r, quantity: r.quantity - 1 } : r
              ),
            };
          } else {
            return {
              ...prev,
              additionalRakhis: prev.additionalRakhis.filter(
                (r: any) => r.id !== itemId
              ),
            };
          }
        }

        return prev;
      });
    } else if (type === "addon") {
      setCart((prev) => {
        const itemIndex = prev.addons.findIndex((a: any) => a.id === itemId);

        if (itemIndex > -1) {
          const item = prev.addons[itemIndex];

          if (item.quantity > 1) {
            return {
              ...prev,
              addons: prev.addons.map((a: any, index) =>
                index === itemIndex ? { ...a, quantity: a.quantity - 1 } : a
              ),
            };
          } else {
            return {
              ...prev,
              addons: prev.addons.filter((a: any) => a.id !== itemId),
            };
          }
        }

        return prev;
      });
    }
  }, []);

  const calculateTotal = () => {
    let total = cart.hamper?.price || 0;
    total += cart.additionalRakhis.reduce(
      (sum: number, rakhi: any) => sum + rakhi.price * rakhi.quantity,
      0
    );
    total += cart.addons.reduce(
      (sum: number, addon: any) => sum + addon.price * addon.quantity,
      0
    );
    return total;
  };

  const placeOrder = async (orderData: any) => {
    try {
      setLoading(true);

      const orderAmount = calculateTotal();
      console.log("💰 Order amount:", orderAmount);

      // Simple test: try a basic Razorpay payment first
      if (!window.Razorpay) {
        console.error("❌ Razorpay SDK not loaded");
        alert(
          "Payment system not available. Please refresh the page and try again."
        );
        setLoading(false);
        return;
      }

      console.log("✅ Razorpay SDK loaded");
      console.log("🔑 Using API key:", RAZORPAY_CONFIG.key);

      // Create a simple payment first
      const simpleOptions = {
        key: RAZORPAY_CONFIG.key,
        amount: convertToPaisa(orderAmount),
        currency: "INR",
        name: "KANI Gift Hampers",
        description: `Order for ${cart.hamper?.title}`,
        handler: function (response: any) {
          console.log("✅ Payment successful!", response);
          alert(
            "Payment successful! Payment ID: " + response.razorpay_payment_id
          );

          // Save order after successful payment
          const finalOrder = {
            ...orderData,
            customerName: orderData.name,
            email: orderData.email || "",
            phone: orderData.phone || "",
            address: orderData.address || "",
            hamperType: cart.hamper?.id,
            hamperTitle: cart.hamper?.title,
            hamperPrice: cart.hamper?.price || 0,
            photoURL: cart.photo,
            photos: cart.photos,
            message: cart.message,
            additionalRakhis: cart.additionalRakhis,
            addons: cart.addons,
            totalAmount: orderAmount, // Changed from 'total' to 'totalAmount'
            timestamp: new Date().toISOString(),
            orderDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deliveryDate: orderData.deliveryDate || "",
            status: "pending",
            trackingNumber: "",
            paymentStatus: "completed",
            paymentId: response.razorpay_payment_id,
          };

          // Save to MongoDB via API
          fetch("/api/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(finalOrder),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("✅ Order saved successfully", data);
              setCart({
                hamper: null,
                photo: null,
                photos: [],
                message: "",
                additionalRakhis: [],
                addons: [],
                total: 0,
              });
              setCustomizationStep(1);
              setCurrentPage("thankyou");
              setLoading(false);
            })
            .catch((error) => {
              console.error("❌ Error saving order:", error);
              alert(
                "Payment successful but error saving order. Contact support with Payment ID: " +
                  response.razorpay_payment_id
              );
              setLoading(false);
            });
        },
        modal: {
          ondismiss: function () {
            console.log("❌ Payment modal dismissed");
            setLoading(false);
          },
        },
        theme: {
          color: "#ef4444",
        },
      };

      console.log("🚀 Creating Razorpay instance with options:", simpleOptions);
      const rzp = new window.Razorpay(simpleOptions);

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
                  setCurrentPage("choose");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100"
              >
                Choose Hamper
              </button>
              <button
                onClick={() => {
                  setCurrentPage("cart");
                  setMobileMenuOpen(false);
                }}
                className="flex w-full text-left py-2 px-4 rounded-lg hover:bg-gray-100 items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart ({cart.additionalRakhis.length + cart.addons.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Component Renders
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <MobileNavigation />

      {/* Hero Section with Carousel Background */}
      <div className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 text-center overflow-hidden min-h-[500px] sm:min-h-[600px]">
        {/* Carousel Background Images */}
        <div className="absolute inset-0">
          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${image})` }}
              />
              {/* Blur overlay for better text readability */}
              <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            </div>
          ))}
        </div>

        {/* Content overlay */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 font-serif leading-tight drop-shadow-2xl">
            Not just a Rakhi.
            <br />
            <span className="text-red-400">A memory you can hold.</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4 drop-shadow-lg">
            Handcrafted with love, personalized with your memories. Create the
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={() => setCurrentPage("choose")}
              className="bg-red-500 hover:bg-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm bg-red-500/90 hover:bg-red-600/90"
            >
              <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
              Create Your Hamper
            </button>

            <button
              onClick={() => setCurrentPage("rakhis")}
              className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 hover:border-white/80 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              Our Rakhis
            </button>
          </div>

          {/* Carousel indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white shadow-lg"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hamper Preview */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
            Choose Your Perfect Hamper
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
            {hamperOptions.map((hamper) => (
              <div
                key={hamper.id}
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-400 to-orange-400 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                  <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                  {hamper.title}
                </h3>
                <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6">
                  {hamper.showPrice === false
                    ? "Price Varies"
                    : `₹${hamper.price}`}
                </div>
                <ul className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 space-y-2 flex-grow">
                  {hamper.includes.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-center gap-2"
                    >
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span className="text-center">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    setCart((prev) => ({ ...prev, hamper }));
                    setCurrentPage("choose");
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-colors duration-300 text-sm sm:text-base w-full sm:w-auto mt-auto"
                >
                  Select This Hamper
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 sm:mb-12">
            Why Choose KANI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-4 sm:p-6">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                Personalized
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Every hamper is customized with your photos and heartfelt
                messages
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-orange-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                Handcrafted
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Each rakhi is lovingly handmade by skilled artisans
              </p>
            </div>
            <div className="p-4 sm:p-6">
              <Package className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                Emotional Packaging
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Beautiful presentation that makes unboxing a memorable
                experience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Style it by Rose - Collaborator Section */}
      <div className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6 text-center overflow-hidden min-h-[500px] sm:min-h-[600px]">
        {/* Rose Carousel Background Images */}
        <div className="absolute inset-0">
          {roseImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentRoseSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${image})` }}
              />
              {/* Enhanced overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-900/70 via-purple-900/60 to-pink-800/70 backdrop-blur-md"></div>
            </div>
          ))}
        </div>

        {/* Floating Flower Animations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating flowers with different animations */}
          <div
            className="absolute top-20 left-10 animate-bounce"
            style={{ animationDelay: "0s", animationDuration: "3s" }}
          >
            <div className="w-8 h-8 text-pink-200/40 transform rotate-12">
              🌸
            </div>
          </div>
          <div
            className="absolute top-32 right-16 animate-pulse"
            style={{ animationDelay: "1s", animationDuration: "4s" }}
          >
            <div className="w-6 h-6 text-rose-200/50 transform -rotate-45">
              🌺
            </div>
          </div>
          <div
            className="absolute bottom-40 left-20 animate-bounce"
            style={{ animationDelay: "2s", animationDuration: "5s" }}
          >
            <div className="w-10 h-10 text-pink-300/30 transform rotate-90">
              🌹
            </div>
          </div>
          <div
            className="absolute bottom-20 right-12 animate-pulse"
            style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}
          >
            <div className="w-7 h-7 text-rose-300/40 transform rotate-180">
              🌼
            </div>
          </div>
          <div
            className="absolute top-1/2 left-8 animate-bounce"
            style={{ animationDelay: "1.5s", animationDuration: "4.5s" }}
          >
            <div className="w-5 h-5 text-pink-200/50 transform -rotate-30">
              🌸
            </div>
          </div>
          <div
            className="absolute top-1/3 right-8 animate-pulse"
            style={{ animationDelay: "2.5s", animationDuration: "3.8s" }}
          >
            <div className="w-9 h-9 text-rose-200/35 transform rotate-60">
              🌺
            </div>
          </div>

          {/* Subtle floating petals */}
          <div
            className="absolute top-16 left-1/4 animate-ping"
            style={{ animationDelay: "3s", animationDuration: "6s" }}
          >
            <div className="w-3 h-3 bg-pink-300/20 rounded-full"></div>
          </div>
          <div
            className="absolute bottom-32 right-1/4 animate-ping"
            style={{ animationDelay: "4s", animationDuration: "5s" }}
          >
            <div className="w-4 h-4 bg-rose-300/25 rounded-full"></div>
          </div>
        </div>

        {/* Content overlay */}
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Section Heading */}
          <div className="mb-8 sm:mb-12">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-2 drop-shadow-2xl tracking-wide">
              Our Collaborators
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-300 to-rose-300 mx-auto rounded-full shadow-lg"></div>
          </div>

          {/* Main Collaborator Card */}
          <div className="bg-white/25 backdrop-blur-xl rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/40 relative overflow-hidden">
            {/* Decorative corner flowers */}
            <div className="absolute top-4 left-4 text-pink-200/30 text-2xl transform rotate-12">
              🌸
            </div>
            <div className="absolute top-4 right-4 text-rose-200/30 text-2xl transform -rotate-12">
              🌺
            </div>
            <div className="absolute bottom-4 left-4 text-pink-300/30 text-2xl transform -rotate-45">
              🌼
            </div>
            <div className="absolute bottom-4 right-4 text-rose-300/30 text-2xl transform rotate-45">
              🌹
            </div>

            <h3 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 sm:mb-8 font-serif leading-tight drop-shadow-2xl">
              Style it by
              <br />
              <span
                className="text-pink-100 italic bg-gradient-to-r from-pink-200 to-rose-200 bg-clip-text text-transparent"
                style={{ fontFamily: "cursive, serif" }}
              >
                Rose
              </span>
            </h3>

            <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-xl font-medium">
              Our exclusive collaboration brings you elegant jewelry pieces that
              perfectly complement your rakhi hampers. Handcrafted accessories
              that add a touch of sophistication to your special moments.
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-white text-sm sm:text-base font-semibold">
              <span className="bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 hover:bg-white/40 transition-all duration-300">
                Premium Jewelry
              </span>
              <span className="bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 hover:bg-white/40 transition-all duration-300">
                Handcrafted
              </span>
              <span className="bg-white/30 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20 hover:bg-white/40 transition-all duration-300">
                Elegant Designs
              </span>
            </div>
          </div>

          {/* Rose Carousel indicators */}
          <div className="flex justify-center mt-8 space-x-3">
            {roseImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentRoseSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-500 shadow-lg ${
                  index === currentRoseSlide
                    ? "bg-pink-200 shadow-pink-200/50 scale-125"
                    : "bg-white/60 hover:bg-white/80 hover:scale-110"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-12 sm:py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {mockData.testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 italic">
                  "{testimonial.text}"
                </p>
                <p className="text-sm sm:text-base font-semibold text-gray-800">
                  - {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
            KANI Gift Hampers
          </h3>
          <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8">
            Turning traditions into personalized memories through handmade
            gifting.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <a
              href={import.meta.env.VITE_CONTACT_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-pink-400 hover:text-pink-300 text-sm sm:text-base transition-colors duration-300 bg-gray-700/50 px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              Instagram
            </a>
            <a
              href={`https://wa.me/${import.meta.env.VITE_CONTACT_WHATSAPP?.replace(
                /[^0-9]/g,
                ""
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-green-400 hover:text-green-300 text-sm sm:text-base transition-colors duration-300 bg-gray-700/50 px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              WhatsApp
            </a>
            <a
              href={`tel:${import.meta.env.VITE_CONTACT_WHATSAPP}`}
              className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 text-sm sm:text-base transition-colors duration-300 bg-gray-700/50 px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );

  const ChooseHamperPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 sm:py-12 px-4 sm:px-6">
      <MobileNavigation />

      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setCurrentPage("home")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 sm:mb-8 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to Home
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
          Choose Your Hamper
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
          {hamperOptions.map((hamper) => (
            <div
              key={hamper.id}
              className={`bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center shadow-lg transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full ${
                cart.hamper?.id === hamper.id ? "ring-4 ring-red-400" : ""
              }`}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-400 to-orange-400 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                <Package className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
                {hamper.title}
              </h3>
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-4 sm:mb-6">
                {hamper.showPrice === false
                  ? "Price Varies"
                  : `₹${hamper.price}`}
              </div>
              <ul className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 space-y-2 text-left flex-grow">
                {hamper.includes.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {
                  setCart((prev) => ({ ...prev, hamper }));
                  // Normal Hamper goes directly to cart, others go to customization
                  if (hamper.id === "normal") {
                    setCurrentPage("cart");
                  } else {
                    setCurrentPage("customize");
                  }
                }}
                className={`w-full py-2 sm:py-3 rounded-full font-semibold transition-colors duration-300 text-sm sm:text-base mt-auto ${
                  cart.hamper?.id === hamper.id
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {cart.hamper?.id === hamper.id ? "Selected" : "Select"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CustomizePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 sm:py-12 px-4 sm:px-6">
      <MobileNavigation />

      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setCurrentPage("choose")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 sm:mb-8 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Back to Hampers
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6 sm:mb-8">
          Personalize Your Hamper
        </h1>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8 sm:mb-12 overflow-x-auto">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                    step <= customizationStep
                      ? "bg-red-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-8 sm:w-12 h-1 ${
                      step < customizationStep ? "bg-red-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
          {/* Step 1: Upload Photo */}
          {customizationStep === 1 && (
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                {getPhotoUploadText()}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                {cart.hamper?.id === "normal"
                  ? "No photos needed for Normal Hamper"
                  : cart.hamper?.id === "silver"
                  ? "Upload 2 childhood photos (3x3 inch each, max 10MB)"
                  : cart.hamper?.id === "gold"
                  ? "Upload 3 childhood photos (3x3 inch each, max 10MB)"
                  : "Add a special childhood memory (3x3 inch, max 10MB)"}
              </p>

              {/* Display uploaded photos */}
              {cart.photos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {cart.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Uploaded photo ${index + 1}`}
                        className="w-32 h-32 sm:w-40 sm:h-40 object-cover mx-auto rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 hover:bg-red-600 flex items-center justify-center"
                      >
                        ×
                      </button>
                      <p className="text-xs sm:text-sm text-gray-500 mt-2">
                        Photo {index + 1}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload new photo button - only show if we can add more */}
              {(() => {
                const maxPhotos = getMaxPhotos(cart.hamper?.id);
                const canAdd = canAddMorePhotos();
                console.log("📷 Upload button visibility check:", {
                  hamperType: cart.hamper?.id,
                  maxPhotos,
                  currentPhotos: cart.photos.length,
                  canAdd,
                  showUpload: maxPhotos > 0 && canAdd,
                  calculation: `${cart.photos.length} < ${maxPhotos} = ${
                    cart.photos.length < maxPhotos
                  }`,
                });
                return maxPhotos > 0 && canAdd;
              })() && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 mb-4 sm:mb-6 hover:border-red-400 transition-colors">
                  <div>
                    <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-600 mb-2">
                      Click to upload{" "}
                      {cart.photos.length === 0
                        ? "your first photo"
                        : "another photo"}
                    </p>
                    <p className="text-xs text-gray-500 mb-3 sm:mb-4">
                      Max file size: 5MB • Formats: JPEG, PNG, GIF, WebP
                    </p>

                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleFileUpload}
                      multiple // <-- allows user to select multiple photos at once
                      disabled={!canAddMorePhotos()} // Only disables if all slots are filled
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className={`${
                        loading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600 cursor-pointer"
                      } text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full inline-flex items-center gap-2 text-sm sm:text-base transition-all duration-200 hover:scale-105`}
                    >
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                      {loading ? "Uploading..." : "Choose Photo"}
                    </label>
                  </div>
                </div>
              )}

              {/* Debug info when upload is not available */}
              {(() => {
                const maxPhotos = getMaxPhotos(cart.hamper?.id);
                const canAdd = canAddMorePhotos();
                if (maxPhotos === 0) {
                  return (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-700 text-sm">
                        ℹ️ {cart.hamper?.title || "This hamper type"} doesn't
                        require photo uploads.
                      </p>
                    </div>
                  );
                }
                if (!canAdd && maxPhotos > 0) {
                  return (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-green-700 text-sm">
                        ✓ All photos uploaded! You've added {cart.photos.length}{" "}
                        of {maxPhotos} photos.
                      </p>
                    </div>
                  );
                }
                if (!cart.hamper) {
                  return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-yellow-700 text-sm">
                        ⚠️ Please select a hamper first to upload photos.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Show message for Normal hamper */}
              {getMaxPhotos(cart.hamper?.id) === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-700 text-sm">
                    ℹ️ Normal hamper doesn't require any photos. Proceed to the
                    next step!
                  </p>
                </div>
              )}

              <button
                onClick={() => setCustomizationStep(2)}
                disabled={
                  getMaxPhotos(cart.hamper?.id) > 0 &&
                  cart.photos.length < getMaxPhotos(cart.hamper?.id)
                }
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base"
              >
                Next Step
              </button>
            </div>
          )}

          {/* Step 2: Personal Message */}
          {customizationStep === 2 && (
            <PersonalMessageStep
              message={cart.message}
              onMessageChange={handleMessageChange}
              onPrevious={handlePreviousStep}
              onNext={handleNextStep}
            />
          )}

          {/* Step 3: Additional Rakhis */}
          {customizationStep === 3 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                Select Additional Rakhis
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {rakhiData.map((rakhi: any) => (
                  <div
                    key={rakhi.id}
                    className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center"
                  >
                    <img
                      src={rakhi.image}
                      alt={rakhi.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover mx-auto rounded-lg mb-3 sm:mb-4"
                    />
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2">
                      {rakhi.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                      {rakhi.category}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-red-600 mb-3 sm:mb-4">
                      ₹{rakhi.price}
                    </p>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFromCart(rakhi.id, "rakhi");
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="w-6 sm:w-8 text-center font-semibold text-sm sm:text-base">
                        {cart.additionalRakhis.find(
                          (r: any) => r.id === rakhi.id
                        )?.quantity || 0}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addToCart(rakhi, "rakhi");
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => setCustomizationStep(2)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCustomizationStep(4)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Add-ons */}
          {customizationStep === 4 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
                Choose Add-ons
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {addonsData.map((addon) => (
                  <div
                    key={addon.id}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden"
                  >
                    {/* Addon Image */}
                    <div className="aspect-square">
                      <img
                        src={addon.image || "/addons/placeholder.jpg"}
                        alt={addon.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/addons/placeholder.jpg";
                        }}
                      />
                    </div>

                    {/* Addon Content */}
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1">
                            {addon.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {addon.description || addon.category}
                          </p>
                          <p className="text-sm sm:text-base font-bold text-red-600">
                            ₹{addon.price}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeFromCart(addon.id, "addon");
                            }}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <span className="w-6 sm:w-8 text-center font-semibold text-sm sm:text-base">
                            {cart.addons.find((a: any) => a.id === addon.id)
                              ?.quantity || 0}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(addon, "addon");
                            }}
                            className="bg-red-500 hover:bg-red-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => setCustomizationStep(3)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage("cart")}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold flex items-center gap-2 justify-center text-sm sm:text-base"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  Review Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Rakhis Showcase Component
  const RakhisShowcase = ({
    setCurrentPage,
  }: {
    setCurrentPage: (page: string) => void;
  }) => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setCurrentPage("home")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8 sm:mb-10 text-sm sm:text-base transform hover:scale-110 transition-all duration-300 hover:shadow-lg px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>

          {/* Header Section */}
          <div className="text-center mb-16 sm:mb-20">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-6 font-serif bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
              Our Exquisite Rakhi Collection
            </h1>

            <div className="w-60 h-2 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 mx-auto rounded-full mb-8"></div>

            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
              Handcrafted treasures that celebrate the eternal bond of love and
              protection
            </p>
          </div>

          {/* Rakhi Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[
              "kesar_bindu.jpg",
              "meghsutra.jpg",
              "prithvi_bond.jpg",
              "scarlet_spark.jpg",
              "rakhi 1.jpg",
              "rakhi 2.jpg",
              "rakhi 3.jpg",
              "rakhi4.jpg",
              "rakhi 5.jpg",
              "rakhi 6.jpg",
              "rakhi 7.jpg",
              "rakhi 8.jpg",
              "rakhi 9.jpg",
              "rakhi 10.jpg",
              "rakhi 12.jpg",
              "rakhi 13.jpg",
              "rakhi 14.jpg",
              "rkhi 15.jpg",
              "rakhi 16.jpg",
            ].map((imageName, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={`/rakhi/${imageName}`}
                    alt={`Handcrafted Rakhi Design ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16 p-8 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Create Your Perfect Hamper?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Choose from our beautiful rakhi collection and create a
              personalized hamper that your brother will treasure forever.
            </p>
            <button
              onClick={() => setCurrentPage("choose")}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Start Creating Your Hamper
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ThankYouPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8 sm:py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
          <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
          Thank You!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
          Your order has been placed successfully. We'll start crafting your
          personalized hamper right away!
        </p>
        <button
          onClick={() => {
            setCurrentPage("home");
            setCart({
              hamper: null,
              photo: null,
              photos: [],
              message: "",
              additionalRakhis: [],
              addons: [],
              total: 0,
            });
            setCustomizationStep(1);
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base"
        >
          Create Another Hamper
        </button>
      </div>
    </div>
  );

  // Main component render
  return (
    <div className="font-sans">
      {currentPage === "home" && <HomePage />}
      {currentPage === "choose" && <ChooseHamperPage />}
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
      {currentPage === "rakhis" && (
        <RakhisShowcase setCurrentPage={setCurrentPage} />
      )}
      {currentPage === "thankyou" && <ThankYouPage />}
    </div>
  );
};

export default KaniRakhiWebsite;
