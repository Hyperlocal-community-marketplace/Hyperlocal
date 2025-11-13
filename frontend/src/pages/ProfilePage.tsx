import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Edit2, Save, X, Sparkles } from "lucide-react";
import { authService } from "../lib/auth";
import { toast } from "sonner";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phoneNumber: currentUser.phoneNumber || "",
        address: currentUser.address || "",
        city: currentUser.city || "",
        country: currentUser.country || "",
        zipCode: currentUser.zipCode || "",
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    const res = await authService.updateUser(formData);
    if (res.success) {
      setUser(res.user);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
      // Update localStorage with new user data
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
        window.dispatchEvent(new Event('authStateChanged'));
      }
    } else {
      toast.error(res.error || "Update failed");
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">No user logged in.</p>
        </div>
      </div>
    );
  }

  const fields = [
    { label: "Name", name: "name", type: "text", icon: User },
    { label: "Email", name: "email", type: "email", icon: Mail },
    { label: "Phone Number", name: "phoneNumber", type: "tel", icon: Phone },
    { label: "Address", name: "address", type: "text", icon: MapPin },
    { label: "City", name: "city", type: "text", icon: MapPin },
    { label: "Country", name: "country", type: "text", icon: MapPin },
    { label: "Zip Code", name: "zipCode", type: "text", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-2 gradient-text flex items-center gap-3">
            <User className="h-10 w-10 text-primary" />
            My Profile
          </h1>
          <p className="text-lg text-muted-foreground">Manage your account information</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary rounded-full">
                    <Sparkles className="h-6 w-6 text-background-dark" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.name || "User Profile"}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
                {!isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </motion.button>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.name} className={field.name === "address" ? "md:col-span-2" : ""}>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        {field.label}
                      </label>
                      <div className="relative">
                        <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type={field.type}
                          name={field.name}
                          value={(formData as any)[field.name]}
                          disabled={!isEditing}
                          onChange={handleChange}
                          className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-primary/20 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all ${
                            !isEditing ? "cursor-not-allowed opacity-70" : ""
                          }`}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-end gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data
                      setFormData({
                        name: user.name || "",
                        email: user.email || "",
                        phoneNumber: user.phoneNumber || "",
                        address: user.address || "",
                        city: user.city || "",
                        country: user.country || "",
                        zipCode: user.zipCode || "",
                      });
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-background-dark rounded-lg font-semibold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? "Saving..." : "Save Changes"}
                  </motion.button>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
