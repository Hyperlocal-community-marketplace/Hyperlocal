import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, CheckCircle2, Clock, Truck, XCircle, DollarSign, MessageCircle } from 'lucide-react';
import { orderService } from '../../lib/orders';
import { shopService } from '../../lib/shop';
import { chatService } from '../../lib/chat';
import { toast } from 'sonner';
import type { Order } from '../../types';

export function SellerOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const seller = shopService.getCurrentSeller();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (!seller) return;
    try {
      setLoading(true);
      const data = await orderService.getShopOrders(seller.id);
      setOrders(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      loadOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusInfo = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('pending')) {
      return { color: 'bg-yellow-500', icon: Clock, text: 'Pending' };
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

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => {
        const orderStatus = order.status.toLowerCase();
        const filterStatus = filter.toLowerCase();
        // Handle specific status matching
        if (filterStatus === 'pending') {
          return orderStatus === 'pending';
        } else if (filterStatus === 'confirmed') {
          return orderStatus === 'confirmed';
        } else if (filterStatus === 'shipped') {
          return orderStatus.includes('shipped') || orderStatus.includes('transferred');
        } else if (filterStatus === 'delivered') {
          return orderStatus === 'delivered';
        }
        return orderStatus.includes(filterStatus);
      });

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Orders</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage and track your shop orders</p>
      </div>

      <div className="flex gap-4">
        {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-background-dark'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center"
        >
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders found</h3>
          <p className="text-gray-600 dark:text-gray-400">You don't have any orders in this category yet</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const cartItems = typeof order.cart === 'string' ? JSON.parse(order.cart) : order.cart;
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            const user = typeof order.user === 'string' ? JSON.parse(order.user) : order.user;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customer: {user?.name || 'Unknown'} • {user?.email || ''}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className={`${statusInfo.color} text-white px-4 py-2 rounded-lg flex items-center gap-2`}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="font-semibold">{statusInfo.text}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {cartItems.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.productName || item.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Quantity: {item.quantity || item.qty || 1} × ${(Number(item.price) || 0).toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${((Number(item.price) || 0) * (item.quantity || item.qty || 1)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      ${(Number(order.totalPrice) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        if (!seller) return;
                        try {
                          const user = typeof order.user === 'string' ? JSON.parse(order.user) : order.user;
                          const groupTitle = `${user.name}-${seller.name}-Order${order.id}`;
                          const conversation = await chatService.createConversation(groupTitle, user.id, seller.id);
                          navigate(`/seller/messages?conversationId=${conversation.id}`);
                        } catch (error: any) {
                          const errorMessage = error.response?.data?.message || error.message || 'Failed to start conversation';
                          toast.error(errorMessage);
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </motion.button>
                    {order.status.toLowerCase().includes('pending') && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'Confirmed')}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Confirm Order
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'Shipped')}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                          Mark as Shipped
                        </button>
                      </>
                    )}
                    {order.status.toLowerCase().includes('confirmed') && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'Shipped')}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Mark as Shipped
                      </button>
                    )}
                    {order.status.toLowerCase().includes('shipped') && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'Delivered')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

