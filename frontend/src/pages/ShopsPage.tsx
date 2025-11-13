import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, MapPin, Phone, Mail, Search, Loader2, Sparkles } from 'lucide-react';
import { shopService } from '../lib/shop';
import type { Shop } from '../types';

export function ShopsPage() {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadNearbyShops();
  }, [userId]);

  const loadNearbyShops = async () => {
    try {
      setLoading(true);
      const data = await shopService.getNearbyShops(userId, 20);
      setShops(data || []);
    } catch (error: any) {
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter((shop) => {
    const query = searchQuery.toLowerCase();
    return (
      shop.name.toLowerCase().includes(query) ||
      shop.address?.toLowerCase().includes(query) ||
      shop.description?.toLowerCase().includes(query)
    );
  });


  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading shops...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container py-12 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-2 gradient-text flex items-center gap-3">
            <Store className="h-10 w-10 text-primary" />
            Browse Shops
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover local shops and sellers in your community
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search shops by name, location, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-primary/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg"
            />
          </div>
          <div className="mt-4 flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
            <p>
              Showing <span className="font-bold text-primary">{filteredShops.length}</span>{' '}
              {filteredShops.length === 1 ? 'shop' : 'shops'}
            </p>
          </div>
        </motion.div>

        {/* Shops Grid */}
        {filteredShops.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="inline-block p-6 bg-primary/10 rounded-full mb-4">
              <Store className="h-16 w-16 text-primary" />
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              {searchQuery ? 'No shops found matching your search' : 'No shops available yet'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredShops.map((shop, index) => {
              const avatarUrl = shop.avatar
                ? `http://localhost:3000/uploads/${shop.avatar}`
                : undefined;

              return (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => navigate(`/shop/${shop.id}`)}
                >
                  {/* Shop Image/Avatar */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-primary/20 rounded-full">
                          <Store className="h-12 w-12 text-primary" />
                        </div>
                        <Sparkles className="h-6 w-6 text-primary/60" />
                      </div>
                    )}
                  </div>

                  {/* Shop Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {shop.name}
                    </h3>
                    {shop.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {shop.description}
                      </p>
                    )}

                    {/* Shop Details */}
                    <div className="space-y-2">
                      {shop.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="truncate">{shop.address}</span>
                        </div>
                      )}
                      {shop.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{shop.phoneNumber}</span>
                        </div>
                      )}
                      {shop.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="truncate">{shop.email}</span>
                        </div>
                      )}
                    </div>

                    {/* View Shop Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/shop/${shop.id}`);
                      }}
                      className="mt-4 w-full bg-primary text-background-dark px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                    >
                      View Shop
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

