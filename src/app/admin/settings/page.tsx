'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Shield, Bell, Palette, Globe, Database, Key, Eye, EyeOff } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'notifications' | 'security' | 'integrations'>('general');
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Database },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store configuration and preferences.</p>
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between"
          >
            <span className="text-sm font-medium">Settings saved successfully!</span>
            <button onClick={() => setSaved(false)} className="text-green-500 hover:text-green-700">×</button>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex gap-1 px-2" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-primary-600 border-b-2 border-primary-600 -mb-px'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Panels */}
          <div className="p-6">
            {/* General Settings */}
            <div role="tabpanel" hidden={activeTab !== 'general'} className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <input type="text" defaultValue="FurniStore" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label>
                  <input type="email" defaultValue="hello@furnistore.com" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Address</label>
                  <textarea rows={3} defaultValue="123 Furniture Ave, Design District, NY 10001" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={3} defaultValue="Premium furniture for modern living spaces." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>

            {/* Appearance Settings */}
            <div role="tabpanel" hidden={activeTab !== 'appearance'} className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Brand Colors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                    <input type="color" defaultValue="#6366f1" className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                    <input type="color" defaultValue="#8b5cf6" className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                    <input type="color" defaultValue="#f59e0b" className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                    <input type="color" defaultValue="#ffffff" className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Typography</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heading Font</label>
                    <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option value="inter">Inter</option>
                      <option value="poppins">Poppins</option>
                      <option value="montserrat">Montserrat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Body Font</label>
                    <select className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option value="inter">Inter</option>
                      <option value="system">System UI</option>
                      <option value="roboto">Roboto</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>

            {/* Notifications Settings */}
            <div role="tabpanel" hidden={activeTab !== 'notifications'} className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>

              <div className="space-y-4">
                {[
                  { title: 'New Orders', desc: 'Get notified when a new order is placed', enabled: true },
                  { title: 'Low Stock Alerts', desc: 'Receive alerts when products are running low', enabled: true },
                  { title: 'Payment Received', desc: 'Notifications for successful payments', enabled: true },
                  { title: 'Customer Reviews', desc: 'New review submissions', enabled: false },
                  { title: 'Weekly Reports', desc: 'Weekly performance summary emails', enabled: true },
                  { title: 'Marketing Updates', desc: 'Product updates and promotional emails', enabled: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>

            {/* Security Settings */}
            <div role="tabpanel" hidden={activeTab !== 'security'} className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                </div>
                <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">Update Password</button>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Two-Factor Authentication</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">2FA Status</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">Enable 2FA</button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-4">API Keys</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Public API Key</p>
                      <p className="text-sm text-gray-500 font-mono">pk_live_••••••••••••••••</p>
                    </div>
                    <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100">Regenerate</button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Secret API Key</p>
                      <p className="text-sm text-gray-500 font-mono">sk_live_••••••••••••••••</p>
                    </div>
                    <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-100">Regenerate</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Integrations Settings */}
            <div role="tabpanel" hidden={activeTab !== 'integrations'} className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Third-Party Integrations</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { name: 'Stripe', desc: 'Payment processing', icon: '💳', connected: true },
                  { name: 'PayPal', desc: 'Alternative payments', icon: '💰', connected: false },
                  { name: 'SendGrid', desc: 'Email delivery', icon: '📧', connected: true },
                  { name: 'AWS S3', desc: 'File storage', icon: '☁️', connected: false },
                  { name: 'Google Analytics', desc: 'Website analytics', icon: '📊', connected: true },
                  { name: 'Meta Pixel', desc: 'Conversion tracking', icon: '📈', connected: false },
                ].map((item, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${item.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {item.connected ? 'Connected' : 'Not Connected'}
                      </span>
                    </div>
                    <button className={`w-full px-3 py-2 text-sm rounded-lg font-medium ${item.connected ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                      {item.connected ? 'Manage' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}