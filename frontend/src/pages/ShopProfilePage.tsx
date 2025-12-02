import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Store, MapPin, Phone, Mail, Sparkles, MessageCircle } from 'lucide-react';
import { shopService } from '../lib/shop';
import { productService } from '../lib/products';
import { chatService } from '../lib/chat';
import { authService } from '../lib/auth';
import { ProductCard } from '../components/ProductCard';
import type { Shop, Product } from '../types';
import { toast } from 'sonner';
import { getImageUrl } from '../lib/image';

export function ShopProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingConversation, setStartingConversation] = useState(false);

  useEffect(() => {
    if (id) {
      loadShopData();
    } else {
      setError('Shop ID is missing');
      setLoading(false);
    }
  }, [id]);

  const loadShopData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!id || isNaN(Number(id))) {
        setError('Invalid shop ID');
        setLoading(false);
        return;
      }
      
      const shopData = await shopService.getShopInfo(Number(id));
      
      if (!shopData) {
        setError('Shop not found');
        setLoading(false);
        return;
      }
      
      setShop(shopData);
      
      const productsData = await productService.getProductsByShop(Number(id));
      setProducts(productsData || []);
    } catch (error: any) {
      console.error('Error loading shop:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load shop';
      setError(errorMessage);
      setShop(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading shop profile...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="inline-block p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
            <Store className="h-12 w-12 text-purple-400" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            {error || 'Shop not found'}
          </p>
          <a 
            href="/" 
            className="inline-block mt-4 px-6 py-2 bg-primary text-background-dark rounded-lg font-semibold hover:bg-opacity-90 transition-colors"
          >
            Go to Home
          </a>
        </motion.div>
      </div>
    );
  }

  const handleMessageSeller = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      toast.error('Please log in to message the seller');
      navigate('/login');
      return;
    }

    if (!shop) {
      toast.error('Shop information not available');
      return;
    }

    try {
      setStartingConversation(true);
      const groupTitle = `${user.name}-${shop.name}`;
      const conversation = await chatService.createConversation(groupTitle, user.id, shop.id);
      
      // Navigate to chat page with sellerId as query param
      navigate(`/chat?sellerId=${shop.id}&conversationId=${conversation.id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to start conversation';
      toast.error(errorMessage);
    } finally {
      setStartingConversation(false);
    }
  };

  const avatarUrl = getImageUrl(shop.avatar);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg border-2 border-purple-200 rounded-3xl p-8 mb-12 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row gap-8">
            {avatarUrl && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-50"></div>
                <img
                  src={avatarUrl}
                  alt={shop.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl relative z-10"
                />
              </motion.div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Store className="h-8 w-8 text-purple-600" />
                <h1 className="text-4xl font-bold text-purple-900 dark:text-purple-100">{shop.name}</h1>
              </div>
              {shop.description && (
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{shop.description}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shop.address && (
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <p className="text-sm font-medium text-purple-700">{shop.address}</p>
                  </div>
                )}
                {shop.phoneNumber && (
                  <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl">
                    <Phone className="h-5 w-5 text-pink-600" />
                    <p className="text-sm font-medium text-pink-700">{shop.phoneNumber}</p>
                  </div>
                )}
                {shop.email && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-medium text-blue-700">{shop.email}</p>
                  </div>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMessageSeller}
                disabled={startingConversation}
                className="mt-6 w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-background-dark px-8 py-3 rounded-lg font-semibold hover:bg-opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="h-5 w-5" />
                {startingConversation ? 'Starting conversation...' : 'Message Seller'}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold mb-6 text-purple-900 dark:text-purple-100 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-600" />
            Products from {shop.name}
          </h2>
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
                <Store className="h-12 w-12 text-purple-400" />
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400">No products available yet</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

