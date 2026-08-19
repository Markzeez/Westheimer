'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Shield,
  Bell,
  Palette,
  Globe,
  Database,
  Eye,
  EyeOff,
  CreditCard,
  Wallet,
  Mail,
  Cloud,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

type TabId =
  | 'general'
  | 'appearance'
  | 'notifications'
  | 'security'
  | 'integrations';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NotificationSetting {
  title: string;
  desc: string;
  enabled: boolean;
}

interface Integration {
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  connected: boolean;
}

const tabs: Tab[] = [
  {
    id: 'general',
    label: 'General',
    icon: Globe,
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Palette,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Database,
  },
];

const initialNotifications: NotificationSetting[] = [
  {
    title: 'New Orders',
    desc: 'Get notified when a new order is placed',
    enabled: true,
  },
  {
    title: 'Low Stock Alerts',
    desc: 'Receive alerts when products are running low',
    enabled: true,
  },
  {
    title: 'Payment Received',
    desc: 'Notifications for successful payments',
    enabled: true,
  },
  {
    title: 'Customer Reviews',
    desc: 'New review submissions',
    enabled: false,
  },
  {
    title: 'Weekly Reports',
    desc: 'Weekly performance summary emails',
    enabled: true,
  },
  {
    title: 'Marketing Updates',
    desc: 'Product updates and promotional emails',
    enabled: false,
  },
];

const integrations: Integration[] = [
  {
    name: 'Stripe',
    desc: 'Payment processing',
    icon: CreditCard,
    connected: true,
  },
  {
    name: 'PayPal',
    desc: 'Alternative payments',
    icon: Wallet,
    connected: false,
  },
  {
    name: 'SendGrid',
    desc: 'Email delivery',
    icon: Mail,
    connected: true,
  },
  {
    name: 'AWS S3',
    desc: 'File storage',
    icon: Cloud,
    connected: false,
  },
  {
    name: 'Google Analytics',
    desc: 'Website analytics',
    icon: BarChart3,
    connected: true,
  },
  {
    name: 'Meta Pixel',
    desc: 'Conversion tracking',
    icon: TrendingUp,
    connected: false,
  },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationSetting[]>(initialNotifications);

  const handleSave = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const toggleNotification = (index: number) => {
    setNotifications((current) =>
      current.map((notification, i) =>
        i === index
          ? {
              ...notification,
              enabled: !notification.enabled,
            }
          : notification
      )
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your store configuration and preferences.
          </p>
        </div>

        {/* Success Message */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700"
          >
            <span className="text-sm font-medium">
              Settings saved successfully!
            </span>

            <button
              type="button"
              onClick={() => setSaved(false)}
              aria-label="Dismiss notification"
              className="text-xl leading-none text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Settings Container */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {/* Tab Navigation */}
          <div className="overflow-x-auto border-b border-gray-200">
            <nav
              className="flex gap-1 px-2"
              role="tablist"
              aria-label="Settings"
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
                    aria-controls={`${tab.id}-panel`}
                    id={`${tab.id}-tab`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-t-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-b-2 border-primary-600 bg-white text-primary-600'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Panels */}
          <div className="p-6">
            {/* GENERAL */}
            {activeTab === 'general' && (
              <div
                role="tabpanel"
                id="general-panel"
                aria-labelledby="general-tab"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    General Settings
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure the basic information for your store.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Store Name */}
                  <div>
                    <label
                      htmlFor="store-name"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Store Name
                    </label>

                    <input
                      id="store-name"
                      type="text"
                      defaultValue="Westheimer Designs"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  {/* Store Email */}
                  <div>
                    <label
                      htmlFor="store-email"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Store Email
                    </label>

                    <input
                      id="store-email"
                      type="email"
                      defaultValue="hello@westheimerdesigns.com"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="store-phone"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </label>

                    <input
                      id="store-phone"
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label
                      htmlFor="currency"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Currency
                    </label>

                    <select
                      id="currency"
                      defaultValue="USD"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="NGN">NGN (₦)</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="store-address"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Store Address
                    </label>

                    <textarea
                      id="store-address"
                      rows={3}
                      defaultValue="123 Furniture Ave, Design District, NY 10001"
                      className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="store-description"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>

                    <textarea
                      id="store-description"
                      rows={3}
                      defaultValue="Premium furniture for modern living spaces."
                      className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white transition hover:bg-primary-700"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* APPEARANCE */}
            {activeTab === 'appearance' && (
              <div
                role="tabpanel"
                id="appearance-panel"
                aria-labelledby="appearance-tab"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Appearance
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Customize your store&apos;s visual appearance.
                  </p>
                </div>

                {/* Brand Colors */}
                <div>
                  <h3 className="mb-4 text-sm font-medium text-gray-700">
                    Brand Colors
                  </h3>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      {
                        id: 'primary-color',
                        label: 'Primary Color',
                        value: '#6366f1',
                      },
                      {
                        id: 'secondary-color',
                        label: 'Secondary Color',
                        value: '#8b5cf6',
                      },
                      {
                        id: 'accent-color',
                        label: 'Accent Color',
                        value: '#f59e0b',
                      },
                      {
                        id: 'background-color',
                        label: 'Background',
                        value: '#ffffff',
                      },
                    ].map((color) => (
                      <div key={color.id}>
                        <label
                          htmlFor={color.id}
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          {color.label}
                        </label>

                        <input
                          id={color.id}
                          type="color"
                          defaultValue={color.value}
                          className="h-10 w-full cursor-pointer rounded-lg border border-gray-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div>
                  <h3 className="mb-4 text-sm font-medium text-gray-700">
                    Typography
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="heading-font"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Heading Font
                      </label>

                      <select
                        id="heading-font"
                        defaultValue="inter"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="inter">Inter</option>
                        <option value="poppins">Poppins</option>
                        <option value="montserrat">Montserrat</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="body-font"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Body Font
                      </label>

                      <select
                        id="body-font"
                        defaultValue="inter"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      >
                        <option value="inter">Inter</option>
                        <option value="system">System UI</option>
                        <option value="roboto">Roboto</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white transition hover:bg-primary-700"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div
                role="tabpanel"
                id="notifications-panel"
                aria-labelledby="notifications-tab"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notification Preferences
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose which notifications you want to receive.
                  </p>
                </div>

                <div className="space-y-4">
                  {notifications.map((item, index) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between gap-4 rounded-lg bg-gray-50 p-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.title}
                        </p>

                        <p className="text-sm text-gray-500">
                          {item.desc}
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={item.enabled}
                        aria-label={`Toggle ${item.title}`}
                        onClick={() => toggleNotification(index)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          item.enabled
                            ? 'bg-primary-600'
                            : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            item.enabled
                              ? 'translate-x-5'
                              : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 font-medium text-white transition hover:bg-primary-700"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* SECURITY */}
            {activeTab === 'security' && (
              <div
                role="tabpanel"
                id="security-panel"
                aria-labelledby="security-tab"
                className="space-y-8"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Security
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your account security and authentication settings.
                  </p>
                </div>

                {/* Change Password */}
                <div>
                  <h3 className="mb-4 text-sm font-medium text-gray-700">
                    Change Password
                  </h3>

                  <div className="grid max-w-xl grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Current Password */}
                    <div className="md:col-span-2">
                      <label
                        htmlFor="current-password"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Current Password
                      </label>

                      <div className="relative">
                        <input
                          id="current-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((current) => !current)}
                          aria-label={
                            showPassword
                              ? 'Hide current password'
                              : 'Show current password'
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label
                        htmlFor="new-password"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        New Password
                      </label>

                      <input
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label
                        htmlFor="confirm-password"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Confirm New Password
                      </label>

                      <input
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="mt-4 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition hover:bg-primary-700"
                  >
                    Update Password
                  </button>
                </div>

                {/* 2FA */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="mb-4 text-sm font-medium text-gray-700">
                    Two-Factor Authentication
                  </h3>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          2FA Status
                        </p>

                        <p className="text-sm text-gray-500">
                          Add an extra layer of security to your account.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
                      >
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>

                {/* API Keys */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="mb-4 text-sm font-medium text-gray-700">
                    API Keys
                  </h3>

                  <div className="space-y-3">
                    <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Public API Key
                        </p>

                        <p className="font-mono text-sm text-gray-500">
                          pk_live_••••••••••••••••
                        </p>
                      </div>

                      <button
                        type="button"
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition hover:bg-gray-100"
                      >
                        Regenerate
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Secret API Key
                        </p>

                        <p className="font-mono text-sm text-gray-500">
                          sk_live_••••••••••••••••
                        </p>
                      </div>

                      <button
                        type="button"
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition hover:bg-gray-100"
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INTEGRATIONS */}
            {activeTab === 'integrations' && (
              <div
                role="tabpanel"
                id="integrations-panel"
                aria-labelledby="integrations-tab"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Third-Party Integrations
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Connect your store to external services.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {integrations.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.name}
                        className="rounded-lg border border-gray-200 p-4 transition hover:border-gray-300 hover:shadow-sm"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100">
                              <Icon className="h-5 w-5 text-gray-700" />
                            </div>

                            <div>
                              <p className="font-medium text-gray-900">
                                {item.name}
                              </p>

                              <p className="text-sm text-gray-500">
                                {item.desc}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${
                              item.connected
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item.connected
                              ? 'Connected'
                              : 'Not Connected'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleSave}
                          className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition ${
                            item.connected
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-primary-600 text-white hover:bg-primary-700'
                          }`}
                        >
                          {item.connected ? 'Manage' : 'Connect'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}