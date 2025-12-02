import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Store, Mail, MapPin } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import type { Shop } from '../../types';
import { getImageUrl } from '../../lib/image';

export function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/sellers');
      setShops(response.data.sellers || []);
    } catch (error) {
      console.error('Error loading shops:', error);
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shopId: number) => {
    if (!confirm('Are you sure you want to delete this shop?')) return;

    try {
      await api.delete(`/admin/sellers/${shopId}`);
      toast.success('Shop deleted successfully');
      loadShops();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete shop');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Shop Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage all registered shops</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map((shop, index) => (
          <motion.div
            key={shop.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {shop.avatar ? (
                  <img
                    src={getImageUrl(shop.avatar)}
                    alt={shop.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <Store className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{shop.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <Mail className="h-3 w-3" />
                    {shop.email}
                  </div>
                </div>
              </div>
            </div>

            {shop.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <MapPin className="h-4 w-4" />
                {shop.address}
              </div>
            )}

            {shop.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{shop.description}</p>
            )}

            <button
              onClick={() => handleDelete(shop.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Shop
            </button>
          </motion.div>
        ))}
      </div>

      {shops.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No shops found</p>
        </div>
      )}
    </div>
  );
}

