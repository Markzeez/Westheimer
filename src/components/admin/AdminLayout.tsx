
'use client'

import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
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
  User,
  Shield,
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
  MoreVertical,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

/* ============================================================
   NAVIGATION
============================================================ */

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

const adminUserNavigation = [
  {
    name: 'Profile',
    href: '/admin/profile',
    icon: User,
  },
  {
    name: 'Security',
    href: '/admin/security',
    icon: Shield,
  },
]

/* ============================================================
   TYPES
============================================================ */

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface AdminHeaderProps {
  onMenuClick?: () => void
}

interface AdminLayoutProps {
  children: ReactNode
}

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: ReactNode
  iconColor: string
  bgColor: string
  href?: string
}

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  isLoading?: boolean
  emptyMessage?: string
  onRowClick?: (item: T) => void
  pagination?: {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  actions?: (item: T) => ReactNode
}

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'outline'
  className?: string
}

interface ActionButtonsProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onMore?: () => void
  disabled?: boolean
}

/* ============================================================
   HELPERS
============================================================ */

/**
 * Determines whether a navigation item is active.
 *
 * Handles the root route correctly:
 *
 * "/"       -> only active on "/"
 * "/admin"  -> active on "/admin" and "/admin/..."
 */
function isNavItemActive(
  pathname: string | null,
  href: string
): boolean {
  if (!pathname) {
    return false
  }

  if (href === '/') {
    return pathname === '/'
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  )
}

/* ============================================================
   ADMIN SIDEBAR
============================================================ */

export function AdminSidebar({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
}: AdminSidebarProps = {}) {
  const { data: session } = useSession()
  const pathname = usePathname()

  /*
   * The layout controls the sidebar on mobile.
   *
   * The internal state is only used if AdminSidebar is rendered
   * by itself somewhere else.
   */
  const [internalIsOpen, setInternalIsOpen] =
    useState(false)

  const isControlled = controlledIsOpen !== undefined

  const isOpen = isControlled
    ? controlledIsOpen
    : internalIsOpen

  const closeSidebar = () => {
    if (controlledOnClose) {
      controlledOnClose()
      return
    }

    setInternalIsOpen(false)
  }

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/',
    })
  }

  return (
    <>
      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="
            fixed
            inset-0
            z-40
            cursor-default
            bg-black/50
            backdrop-blur-[2px]
            lg:hidden
          "
          onClick={closeSidebar}
        />
      )}

      {/* ======================================================
          SIDEBAR
      ====================================================== */}
      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          flex
          w-[280px]
          max-w-[85vw]
          flex-col
          border-r
          border-gray-200
          bg-white
          shadow-xl
          transition-transform
          duration-300
          ease-in-out
          lg:w-64
          lg:translate-x-0
          lg:shadow-none
          ${
            isOpen
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
        aria-label="Admin navigation"
      >
        {/* ====================================================
            SIDEBAR HEADER
        ==================================================== */}
        <div
          className="
            flex
            h-16
            shrink-0
            items-center
            justify-between
            border-b
            border-gray-200
            px-4
          "
        >
          <Link
            href="/admin"
            onClick={closeSidebar}
            className="
              flex
              min-w-0
              items-center
              gap-2
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-primary-600
              "
            >
              <Package
                className="h-5 w-5 text-white"
                aria-hidden="true"
              />
            </div>

            <span
              className="
                truncate
                text-lg
                font-bold
                text-gray-900
              "
            >
              FurniAdmin
            </span>
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={closeSidebar}
            className="
              rounded-lg
              p-2
              text-gray-500
              transition-colors
              hover:bg-gray-100
              hover:text-gray-900
              lg:hidden
            "
            aria-label="Close sidebar"
          >
            <X
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* ====================================================
            MAIN NAVIGATION
        ==================================================== */}
        <nav
          className="
            flex-1
            overflow-y-auto
            px-3
            py-4
          "
          aria-label="Main navigation"
        >
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = isNavItemActive(
                pathname,
                item.href
              )

              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`
                    flex
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    font-medium
                    transition-all
                    duration-200
                    ${
                      isActive
                        ? `
                          bg-primary-50
                          text-primary-700
                          shadow-sm
                        `
                        : `
                          text-gray-600
                          hover:bg-gray-100
                          hover:text-gray-900
                        `
                    }
                  `}
                  aria-current={
                    isActive ? 'page' : undefined
                  }
                >
                  <Icon
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />

                  <span className="truncate">
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* ====================================================
            USER MENU
        ==================================================== */}
        <div
          className="
            shrink-0
            border-t
            border-gray-200
            p-3
          "
        >
          {/* User information */}
          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
              rounded-lg
              px-3
              py-2
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-primary-100
              "
            >
              <User
                className="h-4 w-4 text-primary-700"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="
                  truncate
                  text-sm
                  font-medium
                  text-gray-900
                "
              >
                {session?.user?.name || 'Admin User'}
              </p>

              <p
                className="
                  truncate
                  text-xs
                  text-gray-500
                "
              >
                {session?.user?.email ||
                  'admin@example.com'}
              </p>
            </div>
          </div>

          {/* User navigation */}
          <div className="mt-2 space-y-1 px-2">
            {adminUserNavigation.map((item) => {
              const isActive = isNavItemActive(
                pathname,
                item.href
              )

              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    px-3
                    py-2
                    text-sm
                    transition-colors
                    ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : `
                          text-gray-600
                          hover:bg-gray-100
                          hover:text-gray-900
                        `
                    }
                  `}
                  aria-current={
                    isActive ? 'page' : undefined
                  }
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />

                  {item.name}
                </Link>
              )
            })}

            {/* Sign out */}
            <button
              type="button"
              onClick={handleSignOut}
              className="
                flex
                w-full
                items-center
                gap-2
                rounded-lg
                px-3
                py-2
                text-left
                text-sm
                text-red-600
                transition-colors
                hover:bg-red-50
              "
            >
              <LogOut
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              />

              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

/* ============================================================
   ADMIN HEADER
============================================================ */

export function AdminHeader({
  onMenuClick,
}: AdminHeaderProps = {}) {
  return (
    <header
      className="
        sticky
        top-0
        z-30
        border-b
        border-gray-200
        bg-white/95
        backdrop-blur
        lg:hidden
      "
    >
      <div
        className="
          flex
          min-h-16
          items-center
          justify-between
          gap-3
          px-4
          sm:px-6
        "
      >
        {/* Menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-gray-500
            transition-colors
            hover:bg-gray-100
            hover:text-gray-900
          "
          aria-label="Open navigation menu"
        >
          <Menu
            className="h-6 w-6"
            aria-hidden="true"
          />
        </button>

        {/* Title */}
        <h1
          className="
            min-w-0
            truncate
            text-center
            text-base
            font-semibold
            text-gray-900
            sm:text-lg
          "
        >
          Admin Dashboard
        </h1>

        {/* Spacer */}
        <div
          className="h-10 w-10 shrink-0"
          aria-hidden="true"
        />
      </div>
    </header>
  )
}

/* ============================================================
   ADMIN LAYOUT
============================================================ */

export function AdminLayout({
  children,
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false)

  return (
    <div
      className="
        min-h-screen
        overflow-x-hidden
        bg-gray-50
      "
    >
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <AdminHeader
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <div className="lg:pl-64">
        <main
          className="
            min-w-0
            p-4
            sm:p-6
            lg:p-8
          "
        >
          {children}
        </main>
      </div>
    </div>
  )
}

/* ============================================================
   STAT CARD
============================================================ */

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconColor,
  bgColor,
  href,
}: StatCardProps) {
  const isPositive =
    change !== undefined && change >= 0

  const content = (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`
        rounded-xl
        border
        border-gray-200
        bg-white
        p-4
        sm:p-5
        lg:p-6
        ${
          href
            ? `
              cursor-pointer
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:border-gray-300
              hover:shadow-md
            `
            : ''
        }
      `}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div className="min-w-0 flex-1">
          <p
            className="
              truncate
              text-xs
              font-medium
              text-gray-500
              sm:text-sm
            "
          >
            {title}
          </p>

          <p
            className="
              mt-1
              truncate
              text-2xl
              font-bold
              text-gray-900
              sm:mt-2
              sm:text-3xl
            "
          >
            {value}
          </p>

          {change !== undefined && (
            <div
              className="
                mt-2
                flex
                flex-wrap
                items-center
                gap-1
              "
            >
              <span
                className={`
                  inline-flex
                  items-center
                  gap-0.5
                  text-xs
                  font-medium
                  sm:text-sm
                  ${
                    isPositive
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                `}
              >
                {isPositive ? (
                  <ArrowUpRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowDownRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                )}

                {Math.abs(change)}%
              </span>

              <span
                className="
                  text-xs
                  text-gray-500
                  sm:text-sm
                "
              >
                {changeLabel || 'vs last month'}
              </span>
            </div>
          )}
        </div>

        <div
          className={`
            shrink-0
            rounded-xl
            p-2.5
            sm:p-3
            ${bgColor}
          `}
        >
          <span className={iconColor}>
            {icon}
          </span>
        </div>
      </div>
    </motion.div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="block"
        aria-label={`View ${title}`}
      >
        {content}
      </Link>
    )
  }

  return content
}

/* ============================================================
   DATA TABLE
============================================================ */

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  pagination,
  actions,
}: DataTableProps<T>) {
  /* ==========================================================
     LOADING STATE
  ========================================================== */

  if (isLoading) {
    return (
      <div
        className="
          overflow-hidden
          rounded-xl
          border
          border-gray-200
          bg-white
        "
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="
                      px-4
                      py-3
                      text-left
                      text-xs
                      font-medium
                      uppercase
                      tracking-wider
                      text-gray-500
                      sm:px-6
                    "
                  >
                    {column.header}
                  </th>
                ))}

                {actions && (
                  <th
                    className="
                      px-4
                      py-3
                      text-right
                      text-xs
                      font-medium
                      uppercase
                      tracking-wider
                      text-gray-500
                      sm:px-6
                    "
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <tr
                  key={index}
                  className="animate-pulse"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="
                        whitespace-nowrap
                        px-4
                        py-4
                        sm:px-6
                      "
                    >
                      <div
                        className="
                          h-4
                          w-3/4
                          rounded
                          bg-gray-200
                        "
                      />
                    </td>
                  ))}

                  {actions && (
                    <td
                      className="
                        whitespace-nowrap
                        px-4
                        py-4
                        text-right
                        sm:px-6
                      "
                    >
                      <div
                        className="
                          ml-auto
                          h-6
                          w-16
                          rounded
                          bg-gray-200
                        "
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  /* ==========================================================
     EMPTY STATE
  ========================================================== */

  if (data.length === 0) {
    return (
      <div
        className="
          rounded-xl
          border
          border-gray-200
          bg-white
          px-6
          py-12
          text-center
          sm:px-12
        "
      >
        <Package
          className="
            mx-auto
            mb-4
            h-12
            w-12
            text-gray-300
          "
          aria-hidden="true"
        />

        <p className="text-sm text-gray-500 sm:text-base">
          {emptyMessage}
        </p>
      </div>
    )
  }

  /* ==========================================================
     TABLE
  ========================================================== */

  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-gray-200
        bg-white
      "
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-4
                    py-3
                    text-left
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-gray-500
                    sm:px-6
                    ${column.className || ''}
                  `}
                >
                  {column.header}
                </th>
              ))}

              {actions && (
                <th
                  className="
                    px-4
                    py-3
                    text-right
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-gray-500
                    sm:px-6
                  "
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={`
                  transition-colors
                  ${
                    onRowClick
                      ? `
                        cursor-pointer
                        hover:bg-gray-50
                      `
                      : ''
                  }
                `}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`
                      whitespace-nowrap
                      px-4
                      py-4
                      text-sm
                      text-gray-900
                      sm:px-6
                      ${column.className || ''}
                    `}
                  >
                    {column.render
                      ? column.render(item)
                      : String(
                          (
                            item as Record<
                              string,
                              unknown
                            >
                          )[column.key] ?? ''
                        )}
                  </td>
                ))}

                {actions && (
                  <td
                    className="
                      whitespace-nowrap
                      px-4
                      py-4
                      text-right
                      text-sm
                      font-medium
                      sm:px-6
                    "
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ======================================================
          PAGINATION
      ====================================================== */}
      {pagination && (
        <div
          className="
            flex
            flex-col
            gap-4
            border-t
            border-gray-200
            px-4
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-6
          "
        >
          <p
            className="
              text-center
              text-sm
              text-gray-500
              sm:text-left
            "
          >
            Page {pagination.page} of{' '}
            {pagination.totalPages}
          </p>

          <div className="flex justify-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() =>
                pagination.onPageChange(
                  pagination.page - 1
                )
              }
              disabled={pagination.page === 1}
              className="
                rounded-lg
                border
                border-gray-300
                px-3
                py-1.5
                text-sm
                transition-colors
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() =>
                pagination.onPageChange(
                  pagination.page + 1
                )
              }
              disabled={
                pagination.page ===
                pagination.totalPages
              }
              className="
                rounded-lg
                border
                border-gray-300
                px-3
                py-1.5
                text-sm
                transition-colors
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================================================
   STATUS BADGE
============================================================ */

const statusConfig: Record<
  string,
  {
    label: string
    color: string
    bg: string
    icon: ReactNode
  }
> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    icon: <Clock className="h-3 w-3" />,
  },

  processing: {
    label: 'Processing',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    icon: (
      <RefreshCw className="h-3 w-3 animate-spin" />
    ),
  },

  shipped: {
    label: 'Shipped',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    icon: <Truck className="h-3 w-3" />,
  },

  delivered: {
    label: 'Delivered',
    color: 'text-green-700',
    bg: 'bg-green-100',
    icon: <CheckCircle className="h-3 w-3" />,
  },

  cancelled: {
    label: 'Cancelled',
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: <XCircle className="h-3 w-3" />,
  },

  refunded: {
    label: 'Refunded',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    icon: <ArrowDownRight className="h-3 w-3" />,
  },

  active: {
    label: 'Active',
    color: 'text-green-700',
    bg: 'bg-green-100',
    icon: <CheckCircle className="h-3 w-3" />,
  },

  inactive: {
    label: 'Inactive',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    icon: <XCircle className="h-3 w-3" />,
  },

  'low-stock': {
    label: 'Low Stock',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    icon: (
      <AlertTriangle className="h-3 w-3" />
    ),
  },

  'out-of-stock': {
    label: 'Out of Stock',
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: <XCircle className="h-3 w-3" />,
  },

  'in-stock': {
    label: 'In Stock',
    color: 'text-green-700',
    bg: 'bg-green-100',
    icon: <CheckCircle className="h-3 w-3" />,
  },

  admin: {
    label: 'Admin',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    icon: <Shield className="h-3 w-3" />,
  },

  user: {
    label: 'User',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    icon: <User className="h-3 w-3" />,
  },
}

export function StatusBadge({
  status,
  variant = 'default',
  className = '',
}: StatusBadgeProps) {
  const config =
    statusConfig[status.toLowerCase()] || {
      label:
        status.charAt(0).toUpperCase() +
        status.slice(1),
      color: 'text-gray-700',
      bg: 'bg-gray-100',
      icon: <Box className="h-3 w-3" />,
    }

  if (variant === 'outline') {
    return (
      <span
        className={`
          inline-flex
          items-center
          gap-1.5
          rounded-full
          border
          border-current
          px-2.5
          py-1
          text-xs
          font-medium
          ${config.color}
          ${className}
        `}
      >
        {config.icon}
        {config.label}
      </span>
    )
  }

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-xs
        font-medium
        ${config.bg}
        ${config.color}
        ${className}
      `}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

/* ============================================================
   ACTION BUTTONS
============================================================ */

export function ActionButtons({
  onView,
  onEdit,
  onDelete,
  onMore,
  disabled = false,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onView && (
        <button
          type="button"
          onClick={onView}
          disabled={disabled}
          className="
            rounded-lg
            p-2
            text-gray-500
            transition-colors
            hover:bg-gray-100
            hover:text-gray-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          aria-label="View"
        >
          <Eye
            className="h-4 w-4"
            aria-hidden="true"
          />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          className="
            rounded-lg
            p-2
            text-gray-500
            transition-colors
            hover:bg-gray-100
            hover:text-gray-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          aria-label="Edit"
        >
          <Edit
            className="h-4 w-4"
            aria-hidden="true"
          />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          className="
            rounded-lg
            p-2
            text-red-500
            transition-colors
            hover:bg-red-50
            hover:text-red-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          aria-label="Delete"
        >
          <Trash2
            className="h-4 w-4"
            aria-hidden="true"
          />
        </button>
      )}

      {onMore && (
        <button
          type="button"
          onClick={onMore}
          disabled={disabled}
          className="
            rounded-lg
            p-2
            text-gray-500
            transition-colors
            hover:bg-gray-100
            hover:text-gray-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
          aria-label="More options"
        >
          <MoreVertical
            className="h-4 w-4"
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  )
}
