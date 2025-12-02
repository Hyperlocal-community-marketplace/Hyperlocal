import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  Sparkles,
  X,
  Store
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { authService } from '../lib/auth';
import { shopService } from '../lib/shop';
import { cartService } from '../lib/cart';
import { toast } from 'sonner';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(cartService.getCart().length);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [seller, setSeller] = useState(() => shopService.getCurrentSeller());

  const updateAuthState = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser.id || parsedUser._id || null);
        setUser(parsedUser);
      } catch {
        setUser(null);
        setUserId(null);
      }
    } else {
      setUser(null);
      setUserId(null);
    }

    const storedSeller = localStorage.getItem('seller');
    if (storedSeller) {
      try {
        const parsedSeller = JSON.parse(storedSeller);
        setSeller(parsedSeller);
      } catch {
        setSeller(null);
      }
    } else {
      setSeller(null);
    }
  };

  useEffect(() => {
    updateAuthState();

    const handleCartUpdate = () => {
      setCartCount(cartService.getCart().length);
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'seller') {
        updateAuthState();
      }
    };

    const handleLogin = () => {
      updateAuthState();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleLogin);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleLogin);
    };
  }, []);

  useEffect(() => {
    updateAuthState();
  }, [location.pathname]);


  const handleLogout = async () => {
    if (user) await authService.logout();
    if (seller) await shopService.logout();
    toast.success('Logged out successfully');
    navigate('/');
    window.location.reload();
  };

  const handleProfileClick = () => {
    if (seller) {
      navigate('/seller/settings');
    } else if (userId) {
      // ✅ Navigates to /profile/:id using user.id
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-primary/20"
    >
      <div className="container flex h-20 items-center justify-between px-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <Sparkles className="h-8 w-8 text-primary relative z-10" />
          </motion.div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Hyperlocal
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/shops"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
          >
            Shops
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative group">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <ShoppingCart className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </motion.div>
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-background-dark text-xs flex items-center justify-center font-bold shadow-lg animate-pulse-glow"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>

          {/* Authenticated Section */}
          {user || seller ? (
            <>
              <Link
                to="/orders"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Orders
              </Link>
              <Link
                to="/chat"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Messages
              </Link>

              {seller && (
                <Link
                  to="/seller/dashboard"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                >
                  Seller Portal
                </Link>
              )}


              {/* 👇 Clickable Name (Redirects to Profile) */}
              <div
                onClick={handleProfileClick}
                className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 rounded-full cursor-pointer hover:bg-primary/20 transition-all"
              >
                {seller ? (
                  <>
                    <Store className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {seller.name}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </span>
                  </>
                )}
              </div>

              {/* Logout */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-500 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </motion.button>
            </>
          ) : (
            // Unauthenticated (Login/Signup)
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold rounded-lg bg-primary text-background-dark hover:bg-opacity-80 transition-colors"
                >
                  Sign Up
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold rounded-lg bg-primary/20 dark:bg-primary/30 text-gray-800 dark:text-white hover:bg-primary/30 dark:hover:bg-primary/40 transition-colors"
                >
                  Log In
                </Link>
              </motion.div>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-primary" />
          ) : (
            <Menu className="h-6 w-6 text-primary" />
          )}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-lg"
          >
            <div className="container flex flex-col space-y-4 p-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium py-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/shops"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium py-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Shops
              </Link>

              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold py-2 flex items-center space-x-2 hover:text-primary transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Cart ({cartCount})</span>
              </Link>

              {user || seller ? (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium py-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                  >
                    Orders
                  </Link>
                  <Link
                    to="/chat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium py-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                  >
                    Messages
                  </Link>
                  {seller && (
                    <Link
                      to="/seller/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-medium py-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
                    >
                      Seller Portal
                    </Link>
                  )}

                  {/* 👇 Mobile: Clickable Name */}
                  <div
                    onClick={() => {
                      handleProfileClick();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 py-2 cursor-pointer hover:text-primary transition-colors"
                  >
                    {seller ? (
                      <>
                        <Store className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{seller.name}</span>
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{user?.name}</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm text-left font-semibold text-red-500 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-6 py-2 bg-primary text-background-dark rounded-lg font-bold text-center"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
