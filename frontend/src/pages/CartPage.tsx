import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import { cartService } from '../lib/cart';
import type { CartItem } from '../types';
import { toast } from 'sonner';
import api from '../lib/api';
import { getImageUrl } from '../lib/image';

export function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    loadAndValidateCart();
    const handleCartUpdate = () => setCart(cartService.getCart());
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const loadAndValidateCart = async () => {
    const localCart = cartService.getCart();
    
    console.log('Loading cart from localStorage:', localCart);
    
    // If cart is empty, no need to validate
    if (localCart.length === 0) {
      setCart(localCart);
      setValidating(false);
      return;
    }

    // For now, just load the cart without backend validation
    // This ensures the cart works even if API is temporarily unavailable
    setCart(localCart);
    setValidating(false);

    // Try to validate in the background (optional)
    try {
      const response = await api.post('/product/validate-cart', {
        cartItems: localCart,
      });

      const { validProducts, removedProducts } = response.data;

      // If any products were removed, notify user and update cart
      if (removedProducts && removedProducts.length > 0) {
        // Update cart with only valid products
        localStorage.setItem('cart', JSON.stringify(validProducts));
        
        // Update user-specific cart if logged in
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user?.id) {
              cartService.saveCartForUser(user.id);
            }
          }
        } catch {
          // Ignore errors
        }

        // Notify user
        if (removedProducts.length === 1) {
          toast.error(`${removedProducts[0].productName} is no longer available and was removed from your cart`);
        } else {
          toast.error(`${removedProducts.length} products are no longer available and were removed from your cart`);
        }

        setCart(validProducts);
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error('Error validating cart (non-fatal):', error);
      // Cart is already loaded, so validation failure doesn't break the cart
    }
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    cartService.updateQuantity(productId, newQuantity);
    setCart(cartService.getCart());
    toast.success('Cart updated');
  };

  const removeItem = (productId: number) => {
    cartService.removeFromCart(productId);
    setCart(cartService.getCart());
    toast.success('Item removed from cart');
  };

  const total = cartService.getTotal();

  if (validating) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Validating your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center py-16 px-4">
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
            <div className="p-8 bg-primary/10 rounded-full">
              <ShoppingBag className="h-24 w-24 text-primary" />
            </div>
          </motion.div>
          <h2 className="text-4xl font-bold mb-4 gradient-text">Your cart is empty</h2>
          <p className="text-lg text-muted-foreground mb-8">Start adding amazing products to your cart!</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-background-dark px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-opacity-80 transition-all"
            >
              <Sparkles className="h-5 w-5" />
              Continue Shopping
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-2 gradient-text">Shopping Cart</h1>
          <p className="text-lg text-muted-foreground">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 p-6 bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg hover:border-primary transition-all hover:shadow-xl"
                >
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.productName}
                      className="w-32 h-32 object-cover rounded-xl shadow-lg"
                    />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white hover:text-primary transition-colors">
                      {item.productName}
                    </h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      ${item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 border-2 border-primary/20 rounded-lg bg-white dark:bg-gray-800/20">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-2 hover:bg-primary/10 transition-colors"
                        >
                          <Minus className="h-5 w-5 text-primary" />
                        </motion.button>
                        <span className="px-6 text-lg font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-2 hover:bg-primary/10 transition-colors"
                        >
                          <Plus className="h-5 w-5 text-primary" />
                        </motion.button>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeItem(item.productId)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 border-2 border-primary/20 rounded-lg p-8 bg-white dark:bg-gray-800/20 shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Order Summary</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="border-t-2 border-primary/20 pt-4 flex justify-between text-2xl font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 bg-primary text-background-dark px-6 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-opacity-80 transition-all mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </motion.button>
              <Link
                to="/"
                className="block text-center text-sm font-medium text-primary hover:opacity-80 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

