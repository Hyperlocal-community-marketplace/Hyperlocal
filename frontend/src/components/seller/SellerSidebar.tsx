import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  Store,
  LogOut,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { shopService } from '../../lib/shop';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../lib/image';

const navItems = [
  { path: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/seller/products', label: 'Products', icon: Package },
  { path: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/seller/messages', label: 'Messages', icon: MessageCircle },
  { path: '/seller/settings', label: 'Shop Settings', icon: Settings },
];

export function SellerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const seller = shopService.getCurrentSeller();

  const handleLogout = async () => {
    await shopService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
    window.location.reload();
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-20 overflow-y-auto"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link to="/seller/dashboard" className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Sparkles className="h-5 w-5 text-background-dark" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Seller Portal</span>
        </Link>
      </div>

      <div className="p-4">
        {seller && (
          <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3">
              {seller.avatar ? (
                <img
                  src={getImageUrl(seller.avatar)}
                  alt={seller.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{seller.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{seller.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-background-dark font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

