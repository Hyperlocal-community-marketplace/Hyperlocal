import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authService } from "../lib/auth";
import { shopService } from "../lib/shop";
import { toast } from "sonner";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Image as ImageIcon,
  Store,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { adminService } from "../lib/admin";

export function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<"user" | "admin" | "seller">("user"); // 'user' or 'seller'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: null as File | null,
    address: "",
    phoneNumber: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.type === "file") {
      setFormData({ ...formData, avatar: e.target.files?.[0] || null });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      let result;
      if (userType === "admin") {
        result = await adminService.login(formData.email, formData.password);
      } else if (userType === "user") {
        result = await authService.login(formData.email, formData.password);
      } else {
        result = await shopService.login(formData.email, formData.password);
      }

      if (result.success) {
        toast.success(`Welcome back, ${userType}!`);
        if (userType === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (userType === "seller") {
          navigate("/seller/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (error) {
      toast.error("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Name validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    // Email validation
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password match & strength
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Zip code validation (numeric, 4-10 digits)
    if (formData.zipCode && !/^[0-9]{4,10}$/.test(formData.zipCode)) {
      toast.error("Zip code must be numeric (4-10 digits)");
      return;
    }

    // Seller-specific validation
    if (userType === "seller") {
      if (!formData.address || !formData.phoneNumber || !formData.zipCode) {
        toast.error("Please fill in all required seller fields");
        return;
      }
      if (!/^[0-9]{10,15}$/.test(formData.phoneNumber)) {
        toast.error("Phone number must be numeric (10-15 digits)");
        return;
      }
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      if (formData.avatar) {
        formDataToSend.append("file", formData.avatar);
      }

      // Add zipCode for both users and sellers (used for location services)
      if (formData.zipCode) {
        formDataToSend.append("zipCode", formData.zipCode);
      }

      // Add seller-specific fields
      if (userType === "seller") {
        formDataToSend.append("address", formData.address);
        formDataToSend.append("phoneNumber", formData.phoneNumber);
      }

      let result;
      if (userType === "user") {
        result = await authService.register(formDataToSend);
      } else {
        result = await shopService.register(formDataToSend);
      }

      if (result.success) {
        toast.success(
          `${userType === "user" ? "User" : "Seller"} registered successfully!`
        );
        setIsLogin(true);
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          avatar: null,
          address: "",
          phoneNumber: "",
          zipCode: "",
        });
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch (error) {
      toast.error("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg p-8 shadow-xl">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="p-4 bg-primary rounded-full">
              <Sparkles className="h-10 w-10 text-background-dark" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black mb-4 text-center text-gray-900 dark:text-white"
          >
            {isLogin ? "Welcome Back!" : "Join Us Today"}
          </motion.h1>

          {/* User Type Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-background-light dark:bg-gray-800/20 p-1 rounded-lg border-2 border-primary/20 flex gap-2">
              <button
                type="button"
                onClick={() => setUserType("user")}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  userType === "user"
                    ? "bg-primary text-background-dark"
                    : "text-gray-600 dark:text-gray-400 hover:text-primary"
                }`}
              >
                <User className="inline h-4 w-4 mr-2" />
                User
              </button>
              <button
                type="button"
                onClick={() => setUserType("seller")}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  userType === "seller"
                    ? "bg-primary text-background-dark"
                    : "text-gray-600 dark:text-gray-400 hover:text-primary"
                }`}
              >
                <Store className="inline h-4 w-4 mr-2" />
                Seller
              </button>
              <button
                type="button"
                onClick={() => setUserType("admin")}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  userType === "admin"
                    ? "bg-primary text-background-dark"
                    : "text-gray-600 dark:text-gray-400 hover:text-primary"
                }`}
              >
                <User className="inline h-4 w-4 mr-2" />
                Admin
              </button>
            </div>
          </motion.div>

          {isLogin ? (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleLogin}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-background-dark px-6 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-opacity-80 transition-all disabled:opacity-50"
              >
                {loading
                  ? `Logging in as ${userType}...`
                  : userType === "admin" ? "Login as Admin" : userType === "user" ? "Login as User" : "Login as Seller"}
              </motion.button>
              {userType !== "admin" && (
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="font-bold text-primary hover:underline"
                  >
                    Register
                  </button>
                </p>
              )}
            </motion.form>
          ) : userType === "admin" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6 text-center py-8"
            >
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <div className="flex justify-center mb-4">
                  <ShieldAlert className="h-16 w-16 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                  Admin Registration Disabled
                </h3>
                <p className="text-yellow-800 dark:text-yellow-200 mb-4">
                  Admin accounts are created manually by system administrators.
                  If you need admin access, please contact your system administrator.
                </p>
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-primary font-semibold hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleRegister}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Your Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                  Zip Code {userType === "seller" && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required={userType === "seller"}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder={userType === "seller" ? "12345 (Required)" : "12345 (for location services)"}
                  />
                </div>
              </div>
              {userType === "seller" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Shop Address"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-4 pr-4 py-4 bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                  Avatar (Optional)
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all"
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-background-dark px-6 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-opacity-80 transition-all disabled:opacity-50"
              >
                {loading
                  ? `Registering as ${userType}...`
                  : `Create ${userType === "user" ? "User" : "Seller"} Account`}
              </motion.button>
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="font-bold text-primary hover:underline"
                >
                  Login
                </button>
              </p>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
