import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Sparkles, Zap } from 'lucide-react';
import type { Product } from '../types';
import { getImageUrl } from '../lib/image';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getImageUrl(product.images?.[0]);
  
  // Convert prices to numbers (they might come as strings from the database)
  const originalPrice = Number(product.originalPrice) || 0;
  const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
  const price = discountPrice || originalPrice;
  const hasDiscount = discountPrice && discountPrice < originalPrice;

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        className="group relative overflow-hidden rounded-lg bg-white dark:bg-gray-800/20 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift"
      >
        {/* Discount Badge */}
        {hasDiscount && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 z-10 bg-primary text-background-dark px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
          >
            <Zap className="h-3 w-3" />
            Sale
          </motion.div>
        )}

        {/* Image Container */}
        <div className="aspect-square overflow-hidden bg-background-light relative">
          <motion.img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {/* Stock Indicator */}
          {product.stock > 0 && product.stock < 10 && (
            <div className="absolute bottom-4 left-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
              Only {product.stock} left!
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-2">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              {product.category}
            </span>
          </div>
          
          <h3 className="mb-3 font-bold text-lg line-clamp-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold">
              {product.ratings != null ? Number(product.ratings).toFixed(1) : '0.0'}
            </span>
            {product.reviewCount !== undefined && (
              <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">({product.reviewCount})</span>
            )}
            <Sparkles className="h-3 w-3 text-primary/60 ml-auto" />
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-baseline gap-2">
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                ${price.toFixed(2)}
              </span>
            </div>
            {product.stock > 0 && (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                In Stock
              </span>
            )}
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-primary opacity-0 group-hover:opacity-5 transition-opacity -z-10 blur-xl"></div>
      </motion.div>
    </Link>
  );
}

