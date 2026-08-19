// ===============================
// User Types
// ===============================

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role?: UserRole;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: UserRole;
}

// ===============================
// Product Types
// ===============================

export interface ProductImage {
  url: string;
  publicId?: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: "cm" | "inch";
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sub_category?: string;

  images: ProductImage[];

  inventory: number;
  ratings: number;
  review_count: number;

  features: string[];

  dimensions?: ProductDimensions;
  material?: string;
  color?: string;

  is_active: boolean;
  is_featured: boolean;

  created_at: string;
  updated_at: string;

  // Optional frontend aliases
  reviewCount?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface ProductInsert {
  name: string;
  description: string;
  price: number;
  category: string;
  sub_category?: string;

  images: ProductImage[];

  inventory: number;
  ratings?: number;
  review_count?: number;

  features?: string[];

  dimensions?: ProductDimensions;
  material?: string;
  color?: string;

  is_active?: boolean;
  is_featured?: boolean;
}

export type ProductUpdate = Partial<ProductInsert>;

// ===============================
// Order Types
// ===============================

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  payment_id?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;

  user?: User;
  items?: OrderItem[];
}

export interface OrderInsert {
  user_id: string;
  total: number;
  status?: OrderStatus;
  shipping_address: ShippingAddress;
  payment_id?: string;
  tracking_number?: string;
  notes?: string;
}

export interface OrderUpdate {
  status?: OrderStatus;
  tracking_number?: string;
  notes?: string;
}

// ===============================
// Review Types
// ===============================

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  images: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;

  user?: User;
}

export interface ReviewInsert {
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  images?: string[];
  is_verified_purchase?: boolean;
}

// ===============================
// Cart Types
// ===============================

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  updated_at: string;
}

// ===============================
// Payment Types
// ===============================

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded";

export type PaymentMethod =
  | "stripe"
  | "paypal"
  | "cod"
  | "bank_transfer";

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  transaction_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ===============================
// Wishlist Types
// ===============================

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;

  product?: Product;
}

// ===============================
// API Response Types
// ===============================

export interface ApiResponse<T> {
  data?: T;
  error?: Error | string;
  count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===============================
// Admin Dashboard Types
// ===============================

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;

  ordersByStatus: Record<string, number>;

  recentOrders: Order[];
  lowStockProducts: Product[];

  topProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }[];

  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
}

// ===============================
// Form Types
// ===============================

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface CheckoutShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CheckoutPaymentData {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}