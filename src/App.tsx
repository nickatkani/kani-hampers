import { useState, useEffect } from "react";
import KaniRakhiWebsite from "./kani";
import AdminDashboard from "./AdminDashboard-mongo";
import { Shield } from "lucide-react";
import "./index.css";

// Admin user type
interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
  email: string;
}

// Admin Login Component - Moved outside to prevent re-creation and cursor loss
const AdminLoginComponent = ({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onLogin,
  onBack,
}: {
  username: string;
  password: string;
  onUsernameChange: (username: string) => void;
  onPasswordChange: (password: string) => void;
  onLogin: () => void;
  onBack: () => void;
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="max-w-md w-full">
      {/* Modal-style login form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 relative">
        {/* Close button */}
        <button
          onClick={onBack}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-gray-700" />
            <h1 className="text-xl font-bold text-gray-800">Admin Login</h1>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12"
                onKeyPress={(e) => e.key === "Enter" && onLogin()}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onLogin}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  console.log("🔧 App component is rendering...");

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Check for existing admin session on app load
  useEffect(() => {
    const savedAdmin = localStorage.getItem("adminUser");
    if (savedAdmin) {
      try {
        const admin = JSON.parse(savedAdmin);
        setAdminUser(admin);
        setIsAuthenticated(true);
        console.log("✅ Restored admin session for:", admin.name);
      } catch (error) {
        console.error("❌ Error restoring admin session:", error);
        localStorage.removeItem("adminUser");
      }
    }
  }, []);

  console.log("🔧 App state:", { isAdminMode, isAuthenticated, adminUser });

  // Admin authentication using MongoDB API
  const handleAdminLogin = async () => {
    console.log(
      "🔑 Admin login attempt with username:",
      username,
      "password:",
      password
    );

    try {
      // Validate input
      if (!username || !password) {
        alert("Please enter both username and password!");
        return;
      }

      // Authenticate with the server
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsAuthenticated(true);
        setAdminUser(result.admin);
        console.log("✅ Admin login successful for:", result.admin.name);
        // Store admin info in localStorage for persistence
        localStorage.setItem("adminUser", JSON.stringify(result.admin));
        // Clear form
        setUsername("");
        setPassword("");
      } else {
        alert(result.error || "Invalid username or password!");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      alert("Login failed! Please check your connection.");
    }
  };

  // Admin logout function
  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    setUsername("");
    setPassword("");
    localStorage.removeItem("adminUser");
    console.log("🔑 Admin logged out");
  };

  // Admin mode toggle button for the main website
  const AdminToggle = () => {
    console.log("🛡️ AdminToggle rendering...");
    return (
      <button
        onClick={() => {
          console.log("🛡️ Admin toggle clicked!");
          setIsAdminMode(true);
        }}
        className="fixed bottom-4 right-4 bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg z-50 transition-all duration-300"
        title="Admin Access"
      >
        <Shield className="w-5 h-5" />
      </button>
    );
  };

  if (isAdminMode) {
    console.log("🛡️ Admin mode active");
    if (!isAuthenticated) {
      console.log("🔑 Showing admin login");
      return (
        <AdminLoginComponent
          username={username}
          password={password}
          onUsernameChange={setUsername}
          onPasswordChange={setPassword}
          onLogin={handleAdminLogin}
          onBack={() => setIsAdminMode(false)}
        />
      );
    }
    console.log("✅ Admin authenticated, showing dashboard");
    return (
      <div>
        <div className="bg-red-600 text-white p-2 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Admin Dashboard Mode
            {adminUser && (
              <span className="ml-2 text-red-200">
                - Welcome, {adminUser.name} ({adminUser.role})
              </span>
            )}
            <button
              onClick={() => {
                handleAdminLogout();
                setIsAdminMode(false);
              }}
              className="ml-4 bg-red-700 hover:bg-red-800 px-3 py-1 rounded text-xs"
            >
              Exit Admin
            </button>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  console.log("🏠 Showing main website");
  try {
    return (
      <div>
        <KaniRakhiWebsite />
        <AdminToggle />
      </div>
    );
  } catch (error) {
    console.error("❌ Error rendering main website:", error);
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1>Error Loading Website</h1>
        <p>
          There was an error loading the main website. Check console for
          details.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }
}

export default App;
