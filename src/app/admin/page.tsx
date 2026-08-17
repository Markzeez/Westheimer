'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Box,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import Link from 'next/link';
import { StatCard, StatusBadge } from '@/components/admin/AdminLayout';

interface DashboardData {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  revenueByMonth: { month: string; revenue: number }[];
  topProducts: { _id: string; name: string; sales: number; revenue: number }[];
  lowStockProducts: { _id: string; name: string; inventory: number }[];
  recentOrders: any[];
}

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin?type=stats');
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-6" />
              <div className="h-64 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">{error || 'Failed to load dashboard data'}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-600',
    processing: 'text-blue-600',
    shipped: 'text-purple-600',
    delivered: 'text-green-600',
    cancelled: 'text-red-600',
    refunded: 'text-orange-600',
  };

  const orderStatusData = Object.entries(data.ordersByStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back! Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${data.totalRevenue.toLocaleString()}`}
          change={12.5}
          icon={<DollarSign className="w-6 h-6" />}
          iconColor="text-green-600"
          bgColor="bg-green-100"
          href="/admin/analytics"
        />
        <StatCard
          title="Total Orders"
          value={data.totalOrders.toLocaleString()}
          change={8.2}
          icon={<ShoppingCart className="w-6 h-6" />}
          iconColor="text-blue-600"
          bgColor="bg-blue-100"
          href="/admin/orders"
        />
        <StatCard
          title="Total Products"
          value={data.totalProducts.toLocaleString()}
          change={3.1}
          icon={<Package className="w-6 h-6" />}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
          href="/admin/products"
        />
        <StatCard
          title="Total Users"
          value={data.totalUsers.toLocaleString()}
          change={5.4}
          icon={<Users className="w-6 h-6" />}
          iconColor="text-indigo-600"
          bgColor="bg-indigo-100"
          href="/admin/users"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueByMonth}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Order ID
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Total
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentOrders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="py-3 text-sm font-medium text-gray-900">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {order.userId?.name || 'Unknown'}
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-900">
                      ${order.total.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {data.recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Alert</h3>
            <Link
              href="/admin/products"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {data.lowStockProducts.length > 0 ? (
              data.lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.inventory} left in stock</p>
                    </div>
                  </div>
                  <StatusBadge status={product.inventory === 0 ? 'out-of-stock' : 'low-stock'} />
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">All products are well stocked!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      {data.topProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={12}
                  width={150}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
                    return [value, 'Units Sold'];
                  }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}