import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Plus, Minus, Loader2, Sparkles, Zap, Heart, Share2, MessageCircle, User, Send } from 'lucide-react';
import { productService } from '../lib/products';
import { cartService } from '../lib/cart';
import { shopService } from '../lib/shop';
import { chatService } from '../lib/chat';
import { authService } from '../lib/auth';
import type { Product, Shop } from '../types';
import { toast } from 'sonner';
import { getImageUrl } from '../lib/image';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [startingConversation, setStartingConversation] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
      // Check if user came from order page to write review
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('review') === 'true') {
        setShowReviewForm(true);
      }
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProductById(Number(id));
      setProduct(productData);
      
      if (productData.shopId) {
        const shopData = await shopService.getShopInfo(productData.shopId);
        setShop(shopData);
      }

      // Load reviews
      await loadReviews();
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!id) return;
    try {
      setLoadingReviews(true);
      const reviewsData = await productService.getReviews(Number(id));
      setReviews(reviewsData || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!product || !reviewComment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }

    const user = authService.getCurrentUser();
    if (!user) {
      toast.error('Please log in to leave a review');
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      // Get orderId from URL if available
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('orderId');
      await productService.createReview(
        product.id, 
        reviewRating, 
        reviewComment,
        orderId ? Number(orderId) : undefined
      );
      toast.success('Review submitted successfully!');
      setReviewComment('');
      setReviewRating(5);
      setShowReviewForm(false);
      await loadReviews();
      await loadProduct(); // Reload product to update rating
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Convert prices to numbers
    const originalPrice = Number(product.originalPrice) || 0;
    const discountPrice = product.discountPrice ? Number(product.discountPrice) : null;
    const price = discountPrice || originalPrice;
    
    cartService.addToCart({
      productId: product.id,
      productName: product.name,
      price: price,
      image: product.images?.[0] || '',
      shopId: product.shopId,
    }, quantity);
    
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  const handleMessageSeller = async () => {
    const user = authService.getCurrentUser();
    if (!user) {
      toast.error('Please log in to message the seller');
      navigate('/login');
      return;
    }

    if (!shop || !product) {
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

  // Convert prices to numbers (they might come as strings from the database)
  const originalPrice = product ? Number(product.originalPrice) || 0 : 0;
  const discountPrice = product?.discountPrice ? Number(product.discountPrice) : null;
  const price = discountPrice || originalPrice;
  const hasDiscount = discountPrice && discountPrice < originalPrice;

  if (loading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading product details...</p>
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="inline-block p-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
            <Sparkles className="h-12 w-12 text-purple-400" />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">Product not found</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold shadow-lg"
          >
            Go back to home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const imageUrl = getImageUrl(product.images?.[0]);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8"
        >
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {hasDiscount && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute top-6 right-6 z-10 bg-primary text-background-dark px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl"
              >
                <Zap className="h-4 w-4" />
                Special Offer!
              </motion.div>
            )}
            
            <div className="aspect-square overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800/20 relative group">
              <motion.img
                src={imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            {/* Action buttons overlay */}
            <div className="flex gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800/20 px-4 py-3 rounded-lg border-2 border-primary/20 hover:border-primary transition-colors"
              >
                <Heart className="h-5 w-5 text-primary" />
                <span className="font-semibold">Save</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-800/20 px-4 py-3 rounded-lg border-2 border-primary/20 hover:border-primary transition-colors"
              >
                <Share2 className="h-5 w-5 text-primary" />
                <span className="font-semibold">Share</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4"
              >
                {product.category}
              </motion.span>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-6 gradient-text"
              >
                {product.name}
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-4 mb-6"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-full">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg">
                    {product.ratings != null ? Number(product.ratings).toFixed(1) : '0.0'}
                  </span>
                  {product.reviewCount !== undefined && (
                    <span className="text-gray-600 dark:text-gray-400">({product.reviewCount} reviews)</span>
                  )}
                </div>
                <Sparkles className="h-5 w-5 text-purple-400" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="mb-6"
              >
                {hasDiscount && (
                  <span className="text-2xl text-gray-600 dark:text-gray-400 line-through mr-3">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-5xl font-bold text-gray-900 dark:text-white">
                  ${price.toFixed(2)}
                </span>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed"
              >
                {product.description}
              </motion.p>

              {shop && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="mb-8 p-6 bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg hover:border-primary transition-colors shadow-lg"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">Sold by</p>
                    <p className="text-xl font-bold text-primary mb-2">{shop.name}</p>
                  {shop.address && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-4">
                      <span>📍</span> {shop.address}
                    </p>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMessageSeller}
                    disabled={startingConversation}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-background-dark px-6 py-3 rounded-lg font-semibold hover:bg-opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {startingConversation ? 'Starting conversation...' : 'Message Seller'}
                  </motion.button>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-6"
            >
              <div>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Quantity</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 border-2 border-primary/20 rounded-lg bg-white dark:bg-gray-800/20">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-primary/10 transition-colors"
                    >
                      <Minus className="h-5 w-5 text-primary" />
                    </motion.button>
                    <span className="px-6 text-xl font-bold text-gray-900 dark:text-white">{quantity}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-3 hover:bg-primary/10 transition-colors"
                    >
                      <Plus className="h-5 w-5 text-primary" />
                    </motion.button>
                  </div>
                  <div className="px-4 py-2 bg-green-50 rounded-full">
                    <span className="text-sm font-bold text-green-600">
                      {product.stock} available
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-3 bg-primary text-background-dark px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-opacity-80 transition-all"
              >
                <ShoppingCart className="h-6 w-6" />
                Add to Cart
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleAddToCart();
                  navigate('/cart');
                }}
                className="flex-1 bg-white dark:bg-gray-800/20 border-2 border-primary text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary/10 transition-colors shadow-lg"
              >
                Buy Now
              </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-12 bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-2xl p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold gradient-text">Reviews</h2>
            {authService.getCurrentUser() && !shopService.getCurrentSeller() && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-6 py-2 bg-primary text-background-dark rounded-lg font-semibold hover:bg-opacity-80 transition-all"
              >
                {showReviewForm ? 'Cancel' : 'Write Review'}
              </motion.button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-primary/20"
            >
              <h3 className="text-xl font-bold mb-4">Your Review</h3>
              
              {/* Rating */}
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2">Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= reviewRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-4">
                <p className="text-sm font-semibold mb-2">Your Comment</p>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full p-4 border-2 border-primary/20 rounded-lg bg-white dark:bg-gray-800 focus:border-primary focus:outline-none resize-none"
                  rows={4}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitReview}
                disabled={submittingReview || !reviewComment.trim()}
                className="w-full flex items-center justify-center gap-2 bg-primary text-background-dark px-6 py-3 rounded-lg font-semibold hover:bg-opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Review
                  </>
                )}
              </motion.button>
            </motion.div>
          )}

          {/* Reviews List */}
          {loadingReviews ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-primary/10"
                >
                  <div className="flex items-start gap-4 mb-4">
                    {review.user?.avatar ? (
                      <img
                        src={getImageUrl(review.user.avatar)}
                        alt={review.user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-lg">{review.user?.name || 'Anonymous'}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

