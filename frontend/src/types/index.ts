export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;     
  avatar?: string;
  latitude?: number;      
  longitude?: number;     
  createdAt?: string;
  updatedAt?: string;
}


export interface Admin {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  phoneNumber?: string;
  createdAt?: string;
}

export interface Shop {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  address?: string;
  phoneNumber?: string;
  zipCode?: string;
  description?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  tags?: string;
  originalPrice: number;
  discountPrice?: number;
  stock: number;
  shopId: number;
  ratings?: number;
  images: string[];
  reviewCount?: number;
  shop?: Shop;
}

export interface CartItem {
  id: string;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  shopId: number;
}

export interface Order {
  id: number;
  cart: CartItem[];
  shippingAddress: any;
  user: User;
  totalPrice: number;
  paymentInfo: any;
  shopId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface Conversation {
  id: number;
  groupTitle: string;
  userId: number;
  sellerId: number;
  lastMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number | string; // number for real messages, string for temporary optimistic messages
  conversationId: number;
  sender: number;
  text?: string;
  createdAt: string;
  senderRole?: 'user' | 'seller';
}


