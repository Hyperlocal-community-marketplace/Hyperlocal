import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-background-light dark:bg-background-dark mt-20">
      <div className="container py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
              <h3 className="font-bold text-xl text-gray-900 dark:text-white">Hyperlocal</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Connect with local sellers and discover amazing products in your community. Shop local, support local!
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors font-medium">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors font-medium">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors font-medium">
                  My Orders
                </Link>
              </li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-bold text-lg mb-4 gradient-text">Account</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors font-medium">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-gray-600 dark:text-gray-400 hover:text-purple-600 transition-colors font-medium">
                  Messages
                </Link>
              </li>
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-bold text-lg mb-4 gradient-text">Contact</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Support your local community by shopping hyperlocal! Made with{' '}
              <Heart className="inline h-4 w-4 text-red-500" /> for your neighborhood.
            </p>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-primary/20 text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 Hyperlocal Marketplace. All rights reserved. Built with passion for local communities.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

