import { Types } from 'mongoose';

// User Types
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  address?: string;
  role: 'user' | 'admin';
  orderHistory: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

// Product Types
export interface IProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface IProduct {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  images: IProductImage[];
  inventory: number;
  ratings: number;
  reviewCount: number;
  features: string[];
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'inch';
  };
  material?: string;
  color?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductDocument extends IProduct, Document {}

// Order Types
export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentId?: Types.ObjectId;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderDocument extends IOrder, Document {}

// Review Types
export interface IReview {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  rating: number;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewDocument extends IReview, Document {}

// Cart Types
export interface ICartItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ICart {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
}

export interface ICartDocument extends ICart, Document {}

// Payment Types
export interface IPayment {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'stripe' | 'paypal' | 'cod' | 'bank_transfer';
  transactionId: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentDocument extends IPayment, Document {}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Admin Dashboard Types
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  revenueByMonth: { month: string; revenue: number }[];
  topProducts: { productId: Types.ObjectId; name: string; sales: number; revenue: number }[];
  lowStockProducts: { productId: Types.ObjectId; name: string; inventory: number }[];
}

// Form Types
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory: string;
  inventory: number;
  features: string[];
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'inch';
  };
  material: string;
  color: string;
  isActive: boolean;
  isFeatured: boolean;
  images: File[];
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  address: string;
  role: 'user' | 'admin';
}