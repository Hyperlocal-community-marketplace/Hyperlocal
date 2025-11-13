import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Loader2, Sparkles, CheckCircle2, Clock, Truck, XCircle, MessageCircle, Star } from 'lucide-react';
import { orderService } from '../lib/orders';
import { authService } from '../lib/auth';
import { shopService } from '../lib/shop';
import { chatService } from '../lib/chat';
import type { Order } from '../types';
import { toast } from 'sonner';

export function OrdersPage() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const seller = shopService.getCurrentSeller();
  const currentUser = user || seller;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (user) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await orderService.getUserOrders(user.id);
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      setOrders([]);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
        </motion.div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-6"
          >
            <div className="p-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
              <Package className="h-24 w-24 text-purple-400" />
            </div>
          </motion.div>
          <h2 className="text-4xl font-bold mb-4 gradient-text">No orders yet</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Start shopping to see your orders here!</p>
        </motion.div>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) {
      return { color: 'bg-yellow-400', icon: Clock, text: 'Pending' };
    } else if (statusLower.includes('confirmed')) {
      return { color: 'bg-blue-500', icon: CheckCircle2, text: 'Confirmed' };
    } else if (statusLower.includes('shipped') || statusLower.includes('transferred')) {
      return { color: 'bg-purple-500', icon: Truck, text: 'Shipped' };
    } else if (statusLower.includes('delivered')) {
      return { color: 'bg-green-500', icon: CheckCircle2, text: 'Delivered' };
    } else if (statusLower.includes('cancelled') || statusLower.includes('refund')) {
      return { color: 'bg-red-500', icon: XCircle, text: status };
    }
    return { color: 'bg-gray-500', icon: Package, text: status };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-2 gradient-text">Order History</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">View all your past and current orders</p>
        </motion.div>

        <div className="space-y-6">
          {orders.map((order, index) => {
            const cartItems = typeof order.cart === 'string' ? JSON.parse(order.cart) : order.cart;
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-lg border-2 border-purple-200 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`${statusInfo.color} text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg`}
                  >
                    <StatusIcon className="h-4 w-4" />
                    {statusInfo.text}
                  </motion.div>
                </div>

                <div className="space-y-3 mb-6">
                  {cartItems.map((item: any, idx: number) => {
                    const isDelivered = order.status.toLowerCase().includes('delivered');
                    const productId = item.productId || item.id;
                    return (
                      <div key={idx} className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-semibold text-lg">
                                {item.productName || item.name}
                              </span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Quantity: {item.quantity || item.qty || 1}
                              </p>
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              ${((Number(item.price) || 0) * (item.quantity || item.qty || 1)).toFixed(2)}
                            </span>
                          </div>
                          {isDelivered && productId && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => navigate(`/product/${productId}?orderId=${order.id}&review=true`)}
                              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary text-background-dark rounded-lg font-semibold hover:bg-opacity-90 transition-all text-sm"
                            >
                              <Star className="h-4 w-4" />
                              Review Product
                            </motion.button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t-2 border-purple-200 pt-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">Total Amount</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      ${(Number(order.totalPrice) || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        const user = authService.getCurrentUser();
                        if (!user) {
                          toast.error('Please log in to message the seller');
                          navigate('/login');
                          return;
                        }
                        if (!order.shopId) {
                          toast.error('Shop information not available');
                          return;
                        }
                        try {
                          const groupTitle = `User${user.id}-Shop${order.shopId}-Order${order.id}`;
                          const conversation = await chatService.createConversation(groupTitle, user.id, order.shopId);
                          navigate(`/chat?conversationId=${conversation.id}`);
                        } catch (error: any) {
                          const errorMessage = error.response?.data?.message || error.message || 'Failed to start conversation';
                          toast.error(errorMessage);
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-background-dark rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message Seller
                    </motion.button>
                    <Sparkles className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

