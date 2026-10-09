# Westheimer Designs - Furniture E-commerce Platform

A complete Next.js 15 furniture e-commerce application with admin dashboard, built with modern technologies.

## Features

### 🛍️ Customer Features
- **Product Catalog** - Browse furniture by categories with filters (price, rating, stock)
- **Product Details** - 3-image carousel with thumbnails & fullscreen view
- **Shopping Cart** - Persistent cart with drawer (Zustand + localStorage + Supabase sync)
- **Wishlist** - Save items for later
- **Checkout** - 3-step process (Shipping → Payment → Review)
- **Printable Receipts** - Professional receipts after payment
- **User Accounts** - Profile, order history, wishlist, settings
- **Order Tracking** - Timeline with status updates
- **About Page** - Company story, values, team, milestones
- **Contact Page** - Contact form, FAQ, showroom info

### 👨‍💼 Admin Dashboard
- **Analytics** - Revenue charts, order statistics, top products (Recharts)
- **Product Management** - Full CRUD with **3-image Cloudinary upload**
- **User Management** - View, edit, delete users with roles
- **Order Management** - Update status, tracking numbers
- **Settings** - Store configuration, integrations, notifications

### 🔧 Technical Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + Framer Motion
- **Database**: **Supabase (PostgreSQL)** + Row Level Security
- **Auth**: Clerk (authentication) + Supabase (database-backed profiles and roles)
- **State**: Zustand (cart/wishlist) + TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Images**: Cloudinary (auto-optimization, CDN)
- **Notifications**: react-toastify
- **Charts**: Recharts

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account (free tier works)
- Clerk account
- Cloudinary account (for image uploads)

### Installation

```bash
# Clone and install dependencies
cd new-app
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your .env.local with:
# - Supabase credentials
# - Clerk publishable and secret keys
# - Cloudinary credentials (optional but recommended)

# Run development server
npm run dev
```

### Supabase Setup

1. Create a [Supabase project](https://supabase.com)
2. Go to Settings → API to get:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public)
   - `SUPABASE_SERVICE_ROLE_KEY` (service role - keep secret!)
3. Go to SQL Editor and run the initial schema:
   - Copy contents of `supabase/migrations/20240101000000_initial_schema.sql`
   - Execute in Supabase SQL Editor
4. Apply `supabase/migrations/20261009063646_clerk_identity_mapping.sql` before starting the app. This preserves existing profile UUIDs and order references while enabling Clerk identity links.
5. Keep the Supabase service-role key server-side; authenticated database operations are performed by server routes after Clerk authorization.

### Clerk Setup

1. Create a [Clerk application](https://clerk.com), configure the sign-in methods you want to offer, and enable the name fields if you want Clerk to populate profile names at signup.
2. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env.local` and your deployment environment.
3. Existing Supabase profiles are linked to Clerk on first sign-in when the verified primary email matches. New accounts receive a profile with the default `user` role.
4. Admin authorization continues to use the server-side `role` field in `public.users`; do not grant admin access through user-editable Clerk metadata.

### Cloudinary Setup (Recommended)

1. Create a [Cloudinary account](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from Dashboard
3. Create an **Upload Preset** (unsigned) named `westheimer_products`
4. Add credentials to `.env.local`

Without Cloudinary, images are stored as base64 (development only).

### Admin Access

1. Register at `/register`
2. In Supabase Dashboard → Table Editor → `users` table:
   - Find your user row
   - Change `role` from `user` to `admin`
3. Access `/admin` dashboard

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Cloudinary (for production image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=westheimer_products
```

## Project Structure

```
src/
├── app/
│   ├── (public)
│   │   ├── page.tsx                    # Home
│   │   ├── about/page.tsx              # About Us
│   │   ├── contact/page.tsx            # Contact + FAQ
│   │   ├── shop/page.tsx               # Product listing
│   │   ├── products/[id]/page.tsx      # Product detail
│   │   ├── cart/page.tsx               # Shopping cart
│   │   ├── checkout/page.tsx           # 3-step checkout
│   │   ├── account/page.tsx            # User profile
│   │   ├── orders/[id]/page.tsx        # Order detail
│   │   └── orders/[id]/receipt/page.tsx # Printable receipt
│   ├── login/                          # Clerk sign-in
│   ├── register/                       # Clerk sign-up
│   ├── admin/
│   │   ├── page.tsx                    # Dashboard with charts
│   │   ├── products/page.tsx           # Product CRUD
│   │   ├── users/page.tsx              # User management
│   │   ├── orders/page.tsx             # Order management
│   │   ├── analytics/page.tsx          # Analytics
│   │   └── settings/page.tsx           # Settings
│   └── api/
│       ├── products/                   # Product CRUD
│       ├── orders/                     # Order management
│       ├── admin/                      # Admin APIs
│       └── upload/                     # Cloudinary upload
├── components/
│   ├── ui/
│   │   ├── ProductImageCarousel.tsx    # 3-image slider
│   │   ├── CartDrawer.tsx              # Slide-out cart
│   │   └── ToastProvider.tsx           # Notifications
│   ├── admin/AdminLayout.tsx           # Admin UI components
│   └── Providers.tsx                   # Clerk + Query + Toast
├── stores/cartStore.ts                 # Zustand cart + wishlist (Supabase sync)
├── lib/
│   ├── auth.ts                         # Clerk identity and profile mapping
│   ├── supabase.ts                     # Supabase client
│   ├── supabase-admin.ts               # Supabase admin helpers
│   └── cloudinary.ts                   # Cloudinary helpers
├── types/
│   ├── index.ts                        # TypeScript types
│   └── supabase.ts                     # Supabase-specific types
└── supabase/
    └── migrations/                     # Database migrations
```

## Key Implementation Details

### 3-Image Product Carousel
- Admin uploads up to 3 images
- Auto-uploads to Cloudinary with transformations
- Frontend: Thumbnails, fullscreen, keyboard/touch navigation
- Optimized URLs for different sizes

### Admin Product Management
- Create/Edit/Delete products
- Drag & drop image upload (3 max)
- Real-time Cloudinary preview
- Bulk actions (activate, feature, delete)

### Receipt System
- Server-rendered receipt page (`/orders/[id]/receipt`)
- Auto-opens print dialog on load
- Professional layout with company branding
- Access-controlled (owner or admin only)

### Supabase Integration
- **Row Level Security (RLS)** remains enabled; Supabase-Auth-only policies are removed by the Clerk migration
- **Clerk** for user authentication
- **Service Role** for server operations after Clerk authorization
- **Real-time subscriptions** ready for future features
- **Database functions** for analytics (revenue by month)

### State Management
- **Zustand** for cart/wishlist (persisted to localStorage + Supabase sync)
- **TanStack Query** for server state
- **Supabase** for profiles, authorization roles, and application data

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Supabase Production Checklist
- [ ] Enable RLS on all tables
- [ ] Configure Clerk email settings and redirect URLs
- [ ] Configure CORS for your domain
- [ ] Set up database backups
- [ ] Enable Point-in-Time Recovery (Pro plan)

## License

MIT License - feel free to use for your projects!