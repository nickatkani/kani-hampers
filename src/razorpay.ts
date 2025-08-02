// Razorpay Configuration
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

// Declare Razorpay global variable
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Razorpay configuration
export const RAZORPAY_CONFIG = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  currency: "INR",
  name: import.meta.env.VITE_APP_NAME,
  description: import.meta.env.VITE_APP_DESCRIPTION,
  image: import.meta.env.VITE_APP_LOGO,
  theme: {
    color: import.meta.env.VITE_THEME_COLOR,
  },
};

// Initialize Razorpay payment
export const initializeRazorpayPayment = (options: RazorpayOptions) => {
  if (!window.Razorpay) {
    console.error("Razorpay SDK not loaded");
    return null;
  }

  const rzp = new window.Razorpay(options);
  return rzp;
};

// Convert amount to paisa (Razorpay uses smallest currency unit)
export const convertToPaisa = (amount: number): number => {
  return Math.round(amount * 100);
};

// Format amount for display
export const formatAmount = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN")}`;
};
