import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Store, Package, DollarSign, Truck } from 'lucide-react';
import api from '../../lib/api';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalShops: 0,
    totalProducts: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Load all stats in parallel
      const [usersRes, shopsRes, productsRes, ordersRes] = await Promise.all([
        api.get('/user/admin-all-users'),
        api.get('/shop/admin-all-sellers'),
        api.get('/product/admin-all-products'),
        api.get('/admin/orders'),
      ]);

      setStats({
        totalUsers: usersRes.data.users?.length || 0,
        totalShops: shopsRes.data.sellers?.length || 0,
        totalProducts: productsRes.data.products?.length || 0,
        totalOrders: ordersRes.data.orders?.length || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Total Shops',
      value: stats.totalShops,
      icon: Store,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: DollarSign,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Overview of the platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} rounded-xl p-6 border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/admin/users"
              className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium text-gray-900 dark:text-white">Manage Users</span>
              </div>
            </a>
            <a
              href="/admin/shops"
              className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-primary" />
                <span className="font-medium text-gray-900 dark:text-white">Manage Shops</span>
              </div>
            </a>
            <a
              href="/admin/products"
              className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <span className="font-medium text-gray-900 dark:text-white">Manage Products</span>
              </div>
            </a>
            <a
              href="/admin/orders"
              className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-primary" />
                <span className="font-medium text-gray-900 dark:text-white">Manage Orders</span>
              </div>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-gray-900 dark:text-white">System Status</span>
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-gray-900 dark:text-white">Database</span>
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-gray-900 dark:text-white">API Server</span>
              <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium">Active</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

