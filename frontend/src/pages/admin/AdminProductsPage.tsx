import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Package, Image as ImageIcon, Store } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'sonner';
import type { Product } from '../../types';
import { getImageUrl } from '../../lib/image';

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/product/admin-all-products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/product/admin-delete-product/${productId}`);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Product Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Overview of all platform products</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {product.images && product.images.length > 0 ? (
              <img
                src={getImageUrl(product.images[0])}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between mb-3">
                <div>
                  {product.discountPrice ? (
                    <div>
                      <span className="text-lg font-bold text-primary">${product.discountPrice}</span>
                      <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-gray-900 dark:text-white">${product.originalPrice}</span>
                  )}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Stock: {product.stock}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <Store className="h-3 w-3" />
                Shop ID: {product.shopId}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Category: {product.category}
              </div>
              <button
                onClick={() => handleDelete(product.id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Product
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No products found</p>
        </div>
      )}
    </div>
  );
}

