import type { CartItem } from '../types';

const CART_STORAGE_KEY = 'cart';
const GUEST_CART_KEY = 'guestCart';

export const cartService = {
  getCart(): CartItem[] {
    const cartStr = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartStr) return [];
    try {
      return JSON.parse(cartStr);
    } catch {
      return [];
    }
  },

  saveCartForUser(userId: number): void {
    const cart = this.getCart();
    if (cart.length > 0) {
      localStorage.setItem(`cart_user_${userId}`, JSON.stringify(cart));
    }
  },

  loadCartForUser(userId: number): CartItem[] {
    const cartStr = localStorage.getItem(`cart_user_${userId}`);
    if (!cartStr) return [];
    try {
      return JSON.parse(cartStr);
    } catch {
      return [];
    }
  },

  saveGuestCart(): void {
    const cart = this.getCart();
    if (cart.length > 0) {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    }
  },

  loadGuestCart(): CartItem[] {
    const cartStr = localStorage.getItem(GUEST_CART_KEY);
    if (!cartStr) return [];
    try {
      return JSON.parse(cartStr);
    } catch {
      return [];
    }
  },

  addToCart(product: {
    productId: number;
    productName: string;
    price: number;
    image: string;
    shopId: number;
  }, quantity: number = 1): void {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.productId === product.productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: `${product.productId}-${Date.now()}`,
        productId: product.productId,
        productName: product.productName,
        price: product.price,
        quantity,
        image: product.image,
        shopId: product.shopId,
      });
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    
    // If user is logged in, also save to their user-specific cart
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.id) {
          this.saveCartForUser(user.id);
        }
      }
    } catch {
      // Ignore errors
    }
    
    window.dispatchEvent(new Event('cartUpdated'));
  },

  removeFromCart(productId: number): void {
    const cart = this.getCart().filter(item => item.productId !== productId);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.id) {
          this.saveCartForUser(user.id);
        }
      }
    } catch {
      // Ignore errors
    }
    window.dispatchEvent(new Event('cartUpdated'));
  },

  updateQuantity(productId: number, quantity: number): void {
    const cart = this.getCart();
    const item = cart.find(item => item.productId === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user?.id) {
            this.saveCartForUser(user.id);
          }
        }
      } catch {
        // Ignore errors
      }
      window.dispatchEvent(new Event('cartUpdated'));
    }
  },

  clearCart(): void {
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new Event('cartUpdated'));
  },

  getTotal(): number {
    return this.getCart().reduce((total, item) => total + item.price * item.quantity, 0);
  },
};


