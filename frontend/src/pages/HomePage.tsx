import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ProductCard } from "../components/ProductCard";
import { productService } from "../lib/products";
import { userService } from "../lib/user";
import api from "../lib/api";
import type { Product, User } from "../types";
import { Loader2, Search, ShoppingBag, Store, MapPin } from "lucide-react";
import { HeroBanner } from "@/components/HeroBanner";

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [noShopsNearby, setNoShopsNearby] = useState(false);

  const { ref: heroRef, inView: heroInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.latitude = Number(parsedUser.latitude);
          parsedUser.longitude = Number(parsedUser.longitude);
          setUser(parsedUser);
        }

        const data = await productService.getAllProducts();
        setProducts(data || []);
      } catch (err) {
        console.error("Error loading homepage data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (user?.id && user.latitude && user.longitude) {
      loadNearbyShops(user.id);
    } else if (user?.id && (!user.latitude || !user.longitude)) {
      setShops([]);
      setNoShopsNearby(true);
    }
  }, [user?.id, user?.latitude, user?.longitude]);

  const loadNearbyShops = async (userId: number) => {
    try {
      const response = await api.get(`/user/nearby-shops/${userId}`);

      if (response.data.success && Array.isArray(response.data.shops)) {
        if (response.data.shops.length > 0) {
          setShops(response.data.shops);
          setNoShopsNearby(false);
        } else {
          setShops([]);
          setNoShopsNearby(true);
        }
      } else {
        setShops([]);
        setNoShopsNearby(true);
      }
    } catch (error: any) {
      setShops([]);
      setNoShopsNearby(true);
    }
  };

  const nearbyShopIds = new Set(
    Array.isArray(shops) ? shops.map((shop) => String(shop.id)) : []
  );

  const visibleProducts = (() => {
    if (!user) return products;
    if (!user.latitude || !user.longitude) return [];
    if (!Array.isArray(shops)) return [];
    if (shops.length === 0) return [];

    const filtered = products.filter((p) => {
      const shopIdStr = String(p.shopId);
      return nearbyShopIds.has(shopIdStr);
    });
    return filtered;
  })();

  const filteredProducts = visibleProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === "All" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  if (loading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading local products & shops...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20 py-4"
      >
        <HeroBanner />
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <ShoppingBag className="h-7 w-7 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Local <span className="text-primary">Marketplace</span>
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Shop local • Support small businesses
                </p>
              </div>
            </div>
            <motion.a
              href="/login"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-background-dark rounded-md font-semibold hover:bg-opacity-90 transition-all shadow-sm text-sm"
            >
              <Store className="h-4 w-4" />
              Start Selling
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <div className="container py-4 px-4">
        {/* Search bar + filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-primary/20 rounded-md focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-5 py-3 border border-primary/20 rounded-md focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location Status Messages */}
        {user && (!user.latitude || !user.longitude) && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
            <MapPin className="h-4 w-4" />
            <p>Set your location in profile settings to see nearby shops.</p>
          </div>
        )}

        {user && user.latitude && user.longitude && noShopsNearby && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-4">
            <MapPin className="h-4 w-4 text-primary" />
            <p>No nearby shops found within 20 km.</p>
          </div>
        )}

        {/* Nearby Shops Section */}
        {user && shops.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <MapPin className="h-5 w-5 text-primary" />
              Nearby Shops (within 20 km)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.map((shop) => (
                <div
                  key={shop.id}
                  className="p-4 rounded-md border border-primary/10 shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Shop Name: {shop.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Address: {shop.address}
                  </p>
                  {/*<p className="text-xs text-primary mt-1">
                    {shop.distance.toFixed(2)} km away
                  </p>*/}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-10">
            <div className="inline-block p-5 bg-primary/10 rounded-full mb-3">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <p className="text-base text-gray-600 dark:text-gray-400">
              {user && (!user.latitude || !user.longitude)
                ? "Set your location to see nearby products."
                : user && shops.length === 0
                ? "No nearby products found."
                : "No products found. Try adjusting search."}
            </p>
          </div>
        ) : (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
