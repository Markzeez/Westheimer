-- ============================================================
-- WESTHEIMER DESIGNS
-- SUPABASE DATABASE SCHEMA
-- ============================================================
--
-- This schema is designed for:
-- - Supabase Auth
-- - User profiles
-- - Products
-- - Orders
-- - Order items
-- - Reviews
-- - Cart
-- - Payments
-- - Wishlist
-- - Admin dashboard
-- - Product ratings
-- - Revenue analytics
--
-- IMPORTANT:
-- Run this in Supabase SQL Editor.
--
-- ============================================================


-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 2. ENUM TYPES
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'user_role'
  ) THEN
    CREATE TYPE user_role AS ENUM (
      'user',
      'admin'
    );
  END IF;
END
$$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'order_status'
  ) THEN
    CREATE TYPE order_status AS ENUM (
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    );
  END IF;
END
$$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'payment_status'
  ) THEN
    CREATE TYPE payment_status AS ENUM (
      'pending',
      'completed',
      'failed',
      'refunded'
    );
  END IF;
END
$$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'payment_method'
  ) THEN
    CREATE TYPE payment_method AS ENUM (
      'stripe',
      'paypal',
      'cod',
      'bank_transfer'
    );
  END IF;
END
$$;


-- ============================================================
-- 3. USERS
-- ============================================================
--
-- Extends Supabase auth.users.
--
-- Passwords MUST NOT be stored here.
-- Supabase Auth handles passwords.
--
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  name TEXT NOT NULL,

  email TEXT NOT NULL UNIQUE,

  phone TEXT,

  address TEXT,

  role user_role NOT NULL DEFAULT 'user',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_users_email
ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_users_role
ON public.users(role);


ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 4. ADMIN HELPER FUNCTION
-- ============================================================
--
-- IMPORTANT:
-- Do NOT directly query public.users inside its own RLS
-- policy. That can cause infinite recursion.
--
-- SECURITY DEFINER allows this function to check the role
-- without recursively applying the users table policy.
--
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;


REVOKE ALL
ON FUNCTION public.is_admin()
FROM PUBLIC;

GRANT EXECUTE
ON FUNCTION public.is_admin()
TO authenticated;


-- ============================================================
-- 5. USERS RLS POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile"
ON public.users;

CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);


DROP POLICY IF EXISTS "Admins can view all users"
ON public.users;

CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);


DROP POLICY IF EXISTS "Users can update own profile"
ON public.users;

CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);


DROP POLICY IF EXISTS "Admins can update all users"
ON public.users;

CREATE POLICY "Admins can update all users"
ON public.users
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);


DROP POLICY IF EXISTS "Admins can delete users"
ON public.users;

CREATE POLICY "Admins can delete users"
ON public.users
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);


-- ============================================================
-- 6. PRODUCTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL,

  description TEXT NOT NULL,

  price NUMERIC(10,2) NOT NULL
    CHECK (price >= 0),

  category TEXT NOT NULL,

  sub_category TEXT,

  images JSONB NOT NULL DEFAULT '[]'::jsonb,

  inventory INTEGER NOT NULL DEFAULT 0
    CHECK (inventory >= 0),

  ratings NUMERIC(2,1) NOT NULL DEFAULT 0
    CHECK (ratings >= 0 AND ratings <= 5),

  review_count INTEGER NOT NULL DEFAULT 0
    CHECK (review_count >= 0),

  features TEXT[] NOT NULL DEFAULT '{}',

  dimensions JSONB,

  material TEXT,

  color TEXT,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  is_featured BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- PRODUCTS POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view active products"
ON public.products;

CREATE POLICY "Anyone can view active products"
ON public.products
FOR SELECT
USING (
  is_active = TRUE
);


DROP POLICY IF EXISTS "Admins can manage products"
ON public.products;

CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);


-- ============================================================
-- PRODUCT INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_products_category
ON public.products(category);

CREATE INDEX IF NOT EXISTS idx_products_sub_category
ON public.products(sub_category);

CREATE INDEX IF NOT EXISTS idx_products_is_active
ON public.products(is_active);

CREATE INDEX IF NOT EXISTS idx_products_is_featured
ON public.products(is_featured);

CREATE INDEX IF NOT EXISTS idx_products_price
ON public.products(price);

CREATE INDEX IF NOT EXISTS idx_products_created_at
ON public.products(created_at DESC);


CREATE INDEX IF NOT EXISTS idx_products_search
ON public.products
USING GIN (
  to_tsvector(
    'english',
    COALESCE(name, '') || ' ' ||
    COALESCE(description, '')
  )
);


-- ============================================================
-- 7. ORDERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE RESTRICT,

  total NUMERIC(10,2) NOT NULL
    CHECK (total >= 0),

  status order_status NOT NULL DEFAULT 'pending',

  shipping_address JSONB NOT NULL,

  payment_id UUID,

  tracking_number TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- ORDERS POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own orders"
ON public.orders;

CREATE POLICY "Users can view own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
);


DROP POLICY IF EXISTS "Admins can view all orders"
ON public.orders;

CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  public.is_admin()
);


DROP POLICY IF EXISTS "Users can create orders"
ON public.orders;

CREATE POLICY "Users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);


DROP POLICY IF EXISTS "Admins can create orders"
ON public.orders;

CREATE POLICY "Admins can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin()
);


DROP POLICY IF EXISTS "Users can update own orders"
ON public.orders;

CREATE POLICY "Users can update own orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);


DROP POLICY IF EXISTS "Admins can update orders"
ON public.orders;

CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);


-- ============================================================
-- ORDER INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id
ON public.orders(user_id);

CREATE INDEX IF NOT EXISTS idx_orders_status
ON public.orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_tracking_number
ON public.orders(tracking_number);


-- ============================================================
-- 8. ORDER ITEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  order_id UUID NOT NULL
    REFERENCES public.orders(id)
    ON DELETE CASCADE,

  product_id UUID NOT NULL
    REFERENCES public.products(id)
    ON DELETE RESTRICT,

  name TEXT NOT NULL,

  price NUMERIC(10,2) NOT NULL
    CHECK (price >= 0),

  quantity INTEGER NOT NULL
    CHECK (quantity > 0),

  image TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- ORDER ITEMS POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Users can view own order items"
ON public.order_items;

CREATE POLICY "Users can view own order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
);


DROP POLICY IF EXISTS "Users can create order items"
ON public.order_items;

CREATE POLICY "Users can create order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders
    WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
  )
);


DROP POLICY IF EXISTS "Admins can manage order items"
ON public.order_items;

CREATE POLICY "Admins can manage order items"
ON public.order_items
FOR ALL
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);


CREATE INDEX IF NOT EXISTS idx_order_items_order_id
ON public.order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
ON public.order_items(product_id);


-- ============================================================
-- 9. REVIEWS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  product_id UUID NOT NULL
    REFERENCES public.products(id)
    ON DELETE CASCADE,

  rating INTEGER NOT NULL
    CHECK (rating >= 1 AND rating <= 5),

  comment TEXT NOT NULL,

  images TEXT[] NOT NULL DEFAULT '{}',

  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,

  helpful_count INTEGER NOT NULL DEFAULT 0
    CHECK (helpful_count >= 0),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, product_id)
);


ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- REVIEW POLICIES
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view reviews"
ON public.reviews;

CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (
  TRUE
);


DROP POLICY IF EXISTS "Users can create reviews"
ON public.reviews;

CREATE POLICY "Users can create reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);


DROP POLICY IF EXISTS "Users can update own reviews"
ON public.reviews;

CREATE POLICY "Users can update own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);


DROP POLICY IF EXISTS "Users can delete own reviews"
ON public.reviews;

CREATE POLICY "Users can delete own reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);


DROP POLICY IF EXISTS "Admins can manage reviews"
ON public.reviews;

CREATE POLICY "Admins can manage reviews"
ON public.reviews
FOR ALL
TO authenticated
USING (
  public.is_admin()
)
WITH CHECK (
  public.is_admin()
);


CREATE INDEX IF NOT EXISTS idx_reviews_product_id
ON public.reviews(product_id);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id
ON public.reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_reviews_created_at
ON public.reviews(created_at DESC);


-- ============================================================
-- 10. CARTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID NOT NULL
    REFERENCES public.users(id)
    ON DELETE CASCADE,

  items JSONB NOT NULL DEFAULT '[]'::jsonb,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);


ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS "Users can manage own cart"
ON public.carts;

CREATE POLICY "Users can manage own cart"