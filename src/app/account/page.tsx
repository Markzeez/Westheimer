'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, Heart, Settings, Shield, LogOut, Edit, Mail, MapPin, Phone, Bell, X, ChevronRight, Save, Loader2 } from 'lucide-react';
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

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number; price: number; image: string }>;
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AccountPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session?.user?.name || '',
      email: session?.user?.email || '',
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

  useEffect(() => {
    if (session?.user) {
      // Fetch user details and orders
      fetchUserData();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      // In a real app, fetch from API
      // const res = await fetch('/api/user/profile');
      // const data = await res.json();
      // profileForm.reset(data);
      
      // Mock orders
      setOrders([
        { _id: 'ORD-001', total: 1299.99, status: 'delivered', createdAt: '2024-01-15', items: [{ name: 'Sofa', quantity: 1, price: 1299.99, image: '' }] },
        { _id: 'ORD-002', total: 499.50, status: 'shipped', createdAt: '2024-02-20', items: [{ name: 'Coffee Table', quantity: 1, price: 499.50, image: '' }] },
      ]);
    } catch {
      console.error('Failed to fetch user data');
    }
  };

  const handleProfileUpdate = async (data: ProfileForm) => {
    setSaving(true);
    try {
      // await fetch('/api/user/profile', { method: 'PUT', body: JSON.stringify(data) });
      await update({ ...session, user: { ...session!.user, name: data.name, email: data.email } });
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (data: PasswordForm) => {
    setSaving(true);
    try {
      // await fetch('/api/user/password', { method: 'PUT', body: JSON.stringify(data) });
      passwordForm.reset();
      toast.success('Password changed successfully!');
    } catch {
      toast.error('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; bg: string }> = {
      pending: { color: 'text-yellow-700', bg: 'bg-yellow-100' },
      processing: { color: 'text-blue-700', bg: 'bg-blue-100' },
      shipped: { color: 'text-purple-700', bg: 'bg-purple-100' },
      delivered: { color: 'text-green-700', bg: 'bg-green-100' },
      cancelled: { color: 'text-red-700', bg: 'bg-red-100' },
      refunded: { color: 'text-orange-700', bg: 'bg-orange-100' },
    };
    const config = statusConfig[status] || { color: 'text-gray-700', bg: 'bg-gray-100' };
    return <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.bg} ${config.color}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-500 mb-8">You need to be signed in to access your account.</p>
          <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-600 mt-1">Manage your profile, orders, and preferences</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{session.user?.name}</h3>
                    <p className="text-sm text-gray-500">{session.user?.email}</p>
                    {(session.user as any)?.role === 'admin' && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">Admin</span>
                    )}
                  </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-1" role="tablist">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>

                {/* Sign Out */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                      <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input
                              {...profileForm.register('name')}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                            />
                            {profileForm.formState.errors.name && (
                              <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.name.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                              type="email"
                              {...profileForm.register('email')}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                            />
                            {profileForm.formState.errors.email && (
                              <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.email.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              {...profileForm.register('phone')}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                          <textarea
                            {...profileForm.register('address')}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          <Save className="w-5 h-5" />
                          {saving ? (
                            <>
                              <Loader2 className="animate-spin w-5 h-5" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Change Password */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary-600" />
                        Change Password
                      </h2>
                      <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-6 max-w-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
                          <input
                            type="password"
                            {...passwordForm.register('currentPassword')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                          />
                          {passwordForm.formState.errors.currentPassword && (
                            <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                          <input
                            type="password"
                            {...passwordForm.register('newPassword')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                          />
                          {passwordForm.formState.errors.newPassword && (
                            <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                          <input
                            type="password"
                            {...passwordForm.register('confirmPassword')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                          />
                          {passwordForm.formState.errors.confirmPassword && (
                            <p className="text-sm text-red-500 mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                        >
                          <Shield className="w-5 h-5" />
                          {saving ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      {orders.length === 0 ? (
                        <div className="text-center py-16">
                          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                          <p className="text-gray-500 mb-6">When you place an order, it will appear here.</p>
                          <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
                            Start Shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {orders.map((order) => (
                            <div key={order._id} className="p-6 hover:bg-gray-50">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <Package className="w-8 h-8 text-gray-400" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-medium text-gray-900">Order #{order._id}</span>
                                      {getStatusBadge(order.status)}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(order.createdAt)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900">{formatPrice(order.total)}</p>
                                    <p className="text-sm text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                                  </div>
                                  <Link
                                    href={`/orders/${order._id}`}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium"
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

                {/* Wishlist Tab */}
                {activeTab === 'wishlist' && (
                  <motion.div
                    key="wishlist"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">My Wishlist</h2>
                        <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">Clear All</button>
                      </div>
                      <div className="text-center py-12">
                        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-500 mb-6">Save items you love for later.</p>
                        <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
                          Start Shopping
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Email Notifications */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary-600" />
                        Email Notifications
                      </h2>
                      <div className="space-y-4">
                        {[
                          { label: 'Order Updates', desc: 'Shipping confirmations and delivery updates' },
                          { label: 'Promotional Emails', desc: 'New arrivals, sales, and special offers' },
                          { label: 'Price Drop Alerts', desc: 'Get notified when wishlist items go on sale' },
                          { label: 'Newsletter', desc: 'Weekly design inspiration and tips' },
                        ].map((item, i) => (
                          <label key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <input
                              type="checkbox"
                              defaultChecked={i < 2}
                              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-600" />
                        Danger Zone
                      </h2>
                      <p className="text-gray-500 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
                            toast.error('Account deletion not implemented in demo');
                          }
                        }}
                        className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 flex items-center gap-2"
                      >
                        <X className="w-5 h-5" />
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