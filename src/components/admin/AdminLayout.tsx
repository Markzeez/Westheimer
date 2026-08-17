'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Shield,
  TrendingUp,
  DollarSign,
  Box,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const adminUserNavigation = [
  { name: 'Profile', href: '/admin/profile', icon: User },
  { name: 'Security', href: '/admin/security', icon: Shield },
];

export function AdminSidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Admin navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FurniAdmin</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main navigation">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email || 'admin@example.com'}
                </p>
              </div>
            </div>
            <div className="mt-2 space-y-1 px-2">
              {adminUserNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function AdminHeader() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
      <div className="flex items-center justify-between h-16 px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-700"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
        <div className="w-10" />
      </div>
    </header>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminHeader />
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

// Stats Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  href?: string;
}

export function StatCard({ title, value, change, changeLabel, icon, iconColor, bgColor, href }: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border border-gray-200 p-6 ${href ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      {href && <a href={href} className="block" />}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500">{changeLabel || 'vs last month'}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Data Table Component
interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  actions?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  pagination,
  actions
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.header}
                  </th>
                ))}
                {actions && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </td>
                  ))}
                  {actions && <td className="px-6 py-4 whitespace-nowrap text-right"><div className="h-6 w-16 bg-gray-200 rounded mx-auto" /></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                  >
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Status Badge Component
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'outline';
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: <Clock className="w-3 h-3" /> },
  processing: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-100', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
  shipped: { label: 'Shipped', color: 'text-purple-700', bg: 'bg-purple-100', icon: <Truck className="w-3 h-3" /> },
  delivered: { label: 'Delivered', color: 'text-green-700', bg: 'bg-green-100', icon: <CheckCircle className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100', icon: <XCircle className="w-3 h-3" /> },
  refunded: { label: 'Refunded', color: 'text-orange-700', bg: 'bg-orange-100', icon: <ArrowDownRight className="w-3 h-3" /> },
  active: { label: 'Active', color: 'text-green-700', bg: 'bg-green-100', icon: <CheckCircle className="w-3 h-3" /> },
  inactive: { label: 'Inactive', color: 'text-gray-700', bg: 'bg-gray-100', icon: <XCircle className="w-3 h-3" /> },
  'low-stock': { label: 'Low Stock', color: 'text-orange-700', bg: 'bg-orange-100', icon: <AlertTriangle className="w-3 h-3" /> },
  'out-of-stock': { label: 'Out of Stock', color: 'text-red-700', bg: 'bg-red-100', icon: <XCircle className="w-3 h-3" /> },
  'in-stock': { label: 'In Stock', color: 'text-green-700', bg: 'bg-green-100', icon: <CheckCircle className="w-3 h-3" /> },
  admin: { label: 'Admin', color: 'text-purple-700', bg: 'bg-purple-100', icon: <Shield className="w-3 h-3" /> },
  user: { label: 'User', color: 'text-blue-700', bg: 'bg-blue-100', icon: <User className="w-3 h-3" /> },
};

export function StatusBadge({ status, variant = 'default', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || { 
    label: status.charAt(0).toUpperCase() + status.slice(1), 
    color: 'text-gray-700', 
    bg: 'bg-gray-100', 
    icon: <Box className="w-3 h-3" /> 
  };

  if (variant === 'outline') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color} border-current ${className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} ${className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

// Action Buttons
interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMore?: () => void;
  disabled?: boolean;
}

export function ActionButtons({ onView, onEdit, onDelete, onMore, disabled = false }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onView && (
        <button
          onClick={onView}
          disabled={disabled}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          aria-label="View"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          disabled={disabled}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          disabled={disabled}
          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      {onMore && (
        <button
          onClick={onMore}
          disabled={disabled}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          aria-label="More options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}