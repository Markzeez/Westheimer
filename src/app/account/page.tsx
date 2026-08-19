'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ComponentType } from 'react';
import {
  User,
  Package,
  Heart,
  Settings,
  Shield,
  LogOut,
  Bell,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ToastProvider';
import { Header } from '@/component/Header';
import { Footer } from '@/component/Footer';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

type TabId = 'profile' | 'orders' | 'wishlist' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  phone?: string;
  address?: string;
}

const tabs: Tab[] = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: Package,
  },
  {
    id: 'wishlist',
    label: 'Wishlist',
    icon: Heart,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
  },
];

const mockOrders: Order[] = [
  {
    _id: 'ORD-001',
    total: 1299.99,
    status: 'delivered',
    createdAt: '2024-01-15',
    items: [
      {
        name: 'Sofa',
        quantity: 1,
        price: 1299.99,
        image: '',
      },
    ],
  },
  {
    _id: 'ORD-002',
    total: 499.5,
    status: 'shipped',
    createdAt: '2024-02-20',
    items: [
      {
        name: 'Coffee Table',
        quantity: 1,
        price: 499.5,
        image: '',
      },
    ],
  },
];

const notificationSettings = [
  {
    label: 'Order Updates',
    desc: 'Shipping confirmations and delivery updates',
  },
  {
    label: 'Promotional Emails',
    desc: 'New arrivals, sales, and special offers',
  },
  {
    label: 'Price Drop Alerts',
    desc: 'Get notified when wishlist items go on sale',
  },
  {
    label: 'Newsletter',
    desc: 'Weekly design inspiration and tips',
  },
];

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  // const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  /*
   * Populate the profile form when the session becomes available.
   *
   * The original code placed session values directly inside
   * defaultValues. react-hook-form only uses defaultValues on the
   * initial render, so the form could remain empty after NextAuth
   * finished loading the session.
   */
  useEffect(() => {
    if (!session?.user) {
      return;
    }

    const user = session.user as ExtendedUser;

    profileForm.reset({
      name: user.name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
    });
  }, [session, profileForm]);

  /*
   * Fetch account data.
   *
   * Replace the mock orders with your API call when your endpoint
   * is ready.
   */
  useEffect(() => {
    if (status !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setIsLoading(true);

      try {
        // Example:
        //
        // const response = await fetch('/api/user/orders');
        //
        // if (!response.ok) {
        //   throw new Error('Failed to fetch orders');
        // }
        //
        // const data = await response.json();
        // setOrders(data.orders);

        setOrders(mockOrders);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        toast.error('Failed to load account information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [status]);

  const handleProfileUpdate = async (data: ProfileForm) => {
    if (!session?.user) {
      toast.error('You must be signed in');
      return;
    }

    setSaving(true);

    try {
      /*
       * Replace this section with your real API request.
       *
       * const response = await fetch('/api/user/profile', {
       *   method: 'PUT',
       *   headers: {
       *     'Content-Type': 'application/json',
       *   },
       *   body: JSON.stringify(data),
       * });
       *
       * if (!response.ok) {
       *   throw new Error('Failed to update profile');
       * }
       */

      // const currentUser = session.user as ExtendedUser;

      await update({
        name: data.name,
        email: data.email,
        phone: data.phone ?? '',
        address: data.address ?? '',
      });

      profileForm.reset(data);

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (data: PasswordForm) => {
    setSaving(true);

    try {
      /*
       * Replace this with your real password endpoint.
       *
       * const response = await fetch('/api/user/password', {
       *   method: 'PUT',
       *   headers: {
       *     'Content-Type': 'application/json',
       *   },
       *   body: JSON.stringify(data),
       * });
       *
       * if (!response.ok) {
       *   throw new Error('Failed to change password');
       * }
       */

      console.log('Password update requested:', {
        currentPassword: Boolean(data.currentPassword),
        newPassword: Boolean(data.newPassword),
      });

      passwordForm.reset();

      toast.success('Password changed successfully!');
    } catch (error) {
      console.error('Password update failed:', error);
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut({
        callbackUrl: '/',
      });
    } catch (error) {
      console.error('Sign out failed:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmed) {
      return;
    }

    toast.error('Account deletion is not implemented yet.');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Invalid date';
    }

    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();

    const statusConfig: Record<
      string,
      {
        color: string;
        bg: string;
      }
    > = {
      pending: {
        color: 'text-yellow-700',
        bg: 'bg-yellow-100',
      },
      processing: {
        color: 'text-blue-700',
        bg: 'bg-blue-100',
      },
      shipped: {
        color: 'text-purple-700',
        bg: 'bg-purple-100',
      },
      delivered: {
        color: 'text-green-700',
        bg: 'bg-green-100',
      },
      cancelled: {
        color: 'text-red-700',
        bg: 'bg-red-100',
      },
      refunded: {
        color: 'text-orange-700',
        bg: 'bg-orange-100',
      },
    };

    const config =
      statusConfig[normalizedStatus] ?? {
        color: 'text-gray-700',
        bg: 'bg-gray-100',
      };

    const formattedStatus =
      normalizedStatus.charAt(0).toUpperCase() +
      normalizedStatus.slice(1);

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.color}`}
      >
        {formattedStatus}
      </span>
    );
  };

  /*
   * NextAuth can initially have an "unauthenticated/loading" state.
   * Checking !session immediately can cause a flash of the login page.
   */
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <p className="text-sm text-gray-500">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <User className="h-8 w-8 text-primary-600" />
          </div>

          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Please Sign In
          </h1>

          <p className="mb-8 text-gray-500">
            You need to be signed in to access your account.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-white transition hover:bg-primary-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const user = session.user as ExtendedUser;
  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pb-16 pt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              My Account
            </h1>

            <p className="mt-1 text-gray-600">
              Manage your profile, orders, and preferences
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6">
                {/* User Info */}
                <div className="mb-6 flex items-center gap-4 border-b border-gray-200 pb-6">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
                    <User className="h-8 w-8 text-primary-600" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">
                      {user.name || 'User'}
                    </h3>

                    <p className="truncate text-sm text-gray-500">
                      {user.email || ''}
                    </p>

                    {isAdmin && (
                      <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                        Admin
                      </span>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <nav
                  className="space-y-1"
                  role="tablist"
                  aria-label="Account navigation"
                >
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>

                {/* Sign Out */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {/* PROFILE */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Personal Information */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                      <h2 className="mb-6 text-xl font-semibold text-gray-900">
                        Personal Information
                      </h2>

                      <form
                        onSubmit={profileForm.handleSubmit(
                          handleProfileUpdate
                        )}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          {/* Name */}
                          <div>
                            <label
                              htmlFor="name"
                              className="mb-1 block text-sm font-medium text-gray-700"
                            >
                              Full Name *
                            </label>

                            <input
                              id="name"
                              type="text"
                              {...profileForm.register('name')}
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            />

                            {profileForm.formState.errors.name && (
                              <p className="mt-1 text-sm text-red-500">
                                {
                                  profileForm.formState.errors.name
                                    .message
                                }
                              </p>
                            )}
                          </div>

                          {/* Email */}
                          <div>
                            <label
                              htmlFor="email"
                              className="mb-1 block text-sm font-medium text-gray-700"
                            >
                              Email *
                            </label>

                            <input
                              id="email"
                              type="email"
                              {...profileForm.register('email')}
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            />

                            {profileForm.formState.errors.email && (
                              <p className="mt-1 text-sm text-red-500">
                                {
                                  profileForm.formState.errors.email
                                    .message
                                }
                              </p>
                            )}
                          </div>

                          {/* Phone */}
                          <div>
                            <label
                              htmlFor="phone"
                              className="mb-1 block text-sm font-medium text-gray-700"
                            >
                              Phone
                            </label>

                            <input
                              id="phone"
                              type="tel"
                              {...profileForm.register('phone')}
                              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                            />

                            {profileForm.formState.errors.phone && (
                              <p className="mt-1 text-sm text-red-500">
                                {
                                  profileForm.formState.errors.phone
                                    .message
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <label
                            htmlFor="address"
                            className="mb-1 block text-sm font-medium text-gray-700"
                          >
                            Address
                          </label>

                          <textarea
                            id="address"
                            rows={3}
                            {...profileForm.register('address')}
                            className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={saving}
                          className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-5 w-5" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Change Password */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                      <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <Shield className="h-5 w-5 text-primary-600" />
                        Change Password
                      </h2>

                      <form
                        onSubmit={passwordForm.handleSubmit(
                          handlePasswordChange
                        )}
                        className="max-w-md space-y-6"
                      >
                        {/* Current Password */}
                        <div>
                          <label
                            htmlFor="current-password"
                            className="mb-1 block text-sm font-medium text-gray-700"
                          >
                            Current Password *
                          </label>

                          <input
                            id="current-password"
                            type="password"
                            autoComplete="current-password"
                            {...passwordForm.register('currentPassword')}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          />

                          {passwordForm.formState.errors
                            .currentPassword && (
                            <p className="mt-1 text-sm text-red-500">
                              {
                                passwordForm.formState.errors
                                  .currentPassword.message
                              }
                            </p>
                          )}
                        </div>

                        {/* New Password */}
                        <div>
                          <label
                            htmlFor="new-password"
                            className="mb-1 block text-sm font-medium text-gray-700"
                          >
                            New Password *
                          </label>

                          <input
                            id="new-password"
                            type="password"
                            autoComplete="new-password"
                            {...passwordForm.register('newPassword')}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          />

                          {passwordForm.formState.errors.newPassword && (
                            <p className="mt-1 text-sm text-red-500">
                              {
                                passwordForm.formState.errors.newPassword
                                  .message
                              }
                            </p>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label
                            htmlFor="confirm-password"
                            className="mb-1 block text-sm font-medium text-gray-700"
                          >
                            Confirm New Password *
                          </label>

                          <input
                            id="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            {...passwordForm.register('confirmPassword')}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          />

                          {passwordForm.formState.errors
                            .confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">
                              {
                                passwordForm.formState.errors
                                  .confirmPassword.message
                              }
                            </p>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={saving}
                          className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Shield className="h-5 w-5" />

                          {saving ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* ORDERS */}
                {activeTab === 'orders' && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                          <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary-600" />
                          <p className="text-sm text-gray-500">
                            Loading orders...
                          </p>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="py-16 text-center">
                          <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />

                          <h3 className="mb-2 text-lg font-medium text-gray-900">
                            No orders yet
                          </h3>

                          <p className="mb-6 text-gray-500">
                            When you place an order, it will appear here.
                          </p>

                          <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-white transition hover:bg-primary-700"
                          >
                            Start Shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {orders.map((order) => (
                            <div
                              key={order._id}
                              className="p-6 transition hover:bg-gray-50"
                            >
                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
                                    <Package className="h-8 w-8 text-gray-400" />
                                  </div>

                                  <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                      <span className="font-medium text-gray-900">
                                        Order #{order._id}
                                      </span>

                                      {getStatusBadge(order.status)}
                                    </div>

                                    <p className="mt-1 text-sm text-gray-500">
                                      Placed on{' '}
                                      {formatDate(order.createdAt)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900">
                                      {formatPrice(order.total)}
                                    </p>

                                    <p className="text-sm text-gray-500">
                                      {order.items.length} item
                                      {order.items.length !== 1
                                        ? 's'
                                        : ''}
                                    </p>
                                  </div>

                                  <Link
                                    href={`/orders/${order._id}`}
                                    className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
                                  >
                                    View Details
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* WISHLIST */}
                {activeTab === 'wishlist' && (
                  <motion.div
                    key="wishlist"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                      <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                          My Wishlist
                        </h2>

                        <button
                          type="button"
                          onClick={() =>
                            toast.success(
                              'Wishlist is already empty.'
                            )
                          }
                          className="text-sm font-medium text-primary-600 hover:text-primary-700"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="py-12 text-center">
                        <Heart className="mx-auto mb-4 h-16 w-16 text-gray-300" />

                        <h3 className="mb-2 text-lg font-medium text-gray-900">
                          Your wishlist is empty
                        </h3>

                        <p className="mb-6 text-gray-500">
                          Save items you love for later.
                        </p>

                        <Link
                          href="/shop"
                          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-white transition hover:bg-primary-700"
                        >
                          Start Shopping
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SETTINGS */}
                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Email Notifications */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                      <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <Bell className="h-5 w-5 text-primary-600" />
                        Email Notifications
                      </h2>

                      <div className="space-y-4">
                        {notificationSettings.map((item, index) => (
                          <label
                            key={item.label}
                            className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-gray-50 p-4"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.label}
                              </p>

                              <p className="text-sm text-gray-500">
                                {item.desc}
                              </p>
                            </div>

                            <input
                              type="checkbox"
                              defaultChecked={index < 2}
                              className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6">
                      <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-gray-900">
                        <Shield className="h-5 w-5 text-red-600" />
                        Danger Zone
                      </h2>

                      <p className="mb-6 text-gray-500">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>

                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
                      >
                        <X className="h-5 w-5" />
                        Delete Account
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}