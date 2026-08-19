'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, X } from 'lucide-react';

import {
  StatusBadge,
  ActionButtons,
  DataTable,
  AdminLayout,
} from '@/components/admin/AdminLayout';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  address?: string;
  role: 'user' | 'admin';
  createdAt: string;
  orderHistory?: string[];
}

interface UserForm {
  name: string;
  email: string;
  address: string;
  role: 'user' | 'admin';
  password: string;
}

interface UsersResponse {
  data?: AdminUser[];
  pagination?: {
    totalPages?: number;
    page?: number;
    limit?: number;
    total?: number;
  };
  error?: string;
  message?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [search, setSearch] = useState<string>('');
  const [filterRole, setFilterRole] = useState<
    '' | 'user' | 'admin'
  >('');

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState<UserForm>({
    name: '',
    email: '',
    address: '',
    role: 'user',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Fetch users
   */
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });

      if (search.trim()) {
        params.set('search', search.trim());
      }

      if (filterRole) {
        params.set('role', filterRole);
      }

      const response = await fetch(
        `/api/admin?type=users&${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      let json: UsersResponse = {};

      try {
        json = await response.json();
      } catch {
        json = {};
      }

      if (!response.ok) {
        throw new Error(
          json.error || json.message || 'Failed to fetch users'
        );
      }

      setUsers(Array.isArray(json.data) ? json.data : []);

      setTotalPages(
        Math.max(1, json.pagination?.totalPages ?? 1)
      );
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, filterRole]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setForm({
      name: '',
      email: '',
      address: '',
      role: 'user',
      password: '',
    });

    setEditingUser(null);
  }, []);

  /**
   * Open create modal
   */
  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  /**
   * Open edit modal
   */
  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);

    setForm({
      name: user.name ?? '',
      email: user.email ?? '',
      address: user.address ?? '',
      role: user.role ?? 'user',
      password: '',
    });

    setShowModal(true);
  };

  /**
   * Close modal
   */
  const closeModal = () => {
    if (isSubmitting) return;

    setShowModal(false);
    resetForm();
  };

  /**
   * Handle form field changes
   */
  const updateForm = <K extends keyof UserForm>(
    field: K,
    value: UserForm[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /**
   * Create / update user
   */
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const payload: {
        name: string;
        email: string;
        address: string;
        role: 'user' | 'admin';
        password?: string;
      } = {
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        role: form.role,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      if (!payload.name) {
        throw new Error('Name is required');
      }

      if (!payload.email) {
        throw new Error('Email is required');
      }

      if (!editingUser && !form.password.trim()) {
        throw new Error('Password is required');
      }

      if (form.password && form.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const url = editingUser
        ? `/api/admin/users/${editingUser._id}`
        : '/api/admin/users';

      const method = editingUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let result: {
        error?: string;
        message?: string;
      } = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            'Failed to save user'
        );
      }

      setShowModal(false);
      resetForm();

      await fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);

      window.alert(
        error instanceof Error
          ? error.message
          : 'Failed to save user'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Delete user
   */
  const handleDelete = async (userId: string) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `/api/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      let result: {
        error?: string;
        message?: string;
      } = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            'Failed to delete user'
        );
      }

      setDeleteConfirm(null);

      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);

      window.alert(
        error instanceof Error
          ? error.message
          : 'Failed to delete user'
      );
    }
  };

  /**
   * Table columns
   */
  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (user: AdminUser) => (
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {user.name || 'Unnamed User'}
          </p>

          <p className="text-xs text-gray-500 truncate">
            {user.email}
          </p>
        </div>
      ),
    },

    {
      key: 'role',
      header: 'Role',
      render: (user: AdminUser) => (
        <StatusBadge status={user.role} />
      ),
    },

    {
      key: 'address',
      header: 'Address',
      render: (user: AdminUser) => (
        <span className="block max-w-[200px] truncate text-sm text-gray-500">
          {user.address || '—'}
        </span>
      ),
    },

    {
      key: 'orders',
      header: 'Orders',
      render: (user: AdminUser) => (
        <span className="text-sm text-gray-500">
          {user.orderHistory?.length ?? 0}
        </span>
      ),
    },

    {
      key: 'createdAt',
      header: 'Joined',
      render: (user: AdminUser) => (
        <span className="text-sm text-gray-500">
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : '—'}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Users
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage customer accounts and admin users.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>

        {/* Search / Filter */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <select
            value={filterRole}
            onChange={(event) => {
              setFilterRole(
                event.target.value as '' | 'user' | 'admin'
              );
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Roles</option>
            <option value="user">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Users Table */}
        <DataTable
          columns={columns}
          data={users}
          keyExtractor={(user: AdminUser) => user._id}
          isLoading={isLoading}
          emptyMessage="No users found"
          onRowClick={openEditModal}
          actions={(user: AdminUser) => (
            <div className="flex items-center justify-end gap-1">
              <ActionButtons
                onEdit={() => openEditModal(user)}
                onDelete={() => setDeleteConfirm(user._id)}
              />
            </div>
          )}
          pagination={{
            page,
            totalPages,
            onPageChange: setPage,
          }}
        />

        {/* Create / Edit User Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  closeModal();
                }
              }}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 10,
                }}
                transition={{ duration: 0.2 }}
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {editingUser
                        ? 'Edit User'
                        : 'Add New User'}
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      {editingUser
                        ? 'Update this user account.'
                        : 'Create a new user account.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="user-name"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Name *
                    </label>

                    <input
                      id="user-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={(event) =>
                        updateForm(
                          'name',
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="John Doe"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="user-email"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Email *
                    </label>

                    <input
                      id="user-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) =>
                        updateForm(
                          'email',
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="john@example.com"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="user-password"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      {editingUser
                        ? 'New Password'
                        : 'Password *'}
                    </label>

                    <input
                      id="user-password"
                      type="password"
                      required={!editingUser}
                      minLength={8}
                      autoComplete={
                        editingUser
                          ? 'new-password'
                          : 'new-password'
                      }
                      value={form.password}
                      onChange={(event) =>
                        updateForm(
                          'password',
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      placeholder={
                        editingUser
                          ? 'Leave blank to keep current password'
                          : 'Minimum 8 characters'
                      }
                    />

                    {editingUser && (
                      <p className="mt-1 text-xs text-gray-500">
                        Leave blank if you do not want to
                        change the password.
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="user-address"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Address
                    </label>

                    <textarea
                      id="user-address"
                      rows={3}
                      value={form.address}
                      onChange={(event) =>
                        updateForm(
                          'address',
                          event.target.value
                        )
                      }
                      className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      placeholder="Enter user's address"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label
                      htmlFor="user-role"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      Role *
                    </label>

                    <select
                      id="user-role"
                      required
                      value={form.role}
                      onChange={(event) =>
                        updateForm(
                          'role',
                          event.target.value as
                            | 'user'
                            | 'admin'
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="user">
                        Customer
                      </option>
                      <option value="admin">
                        Admin
                      </option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting
                        ? 'Saving...'
                        : editingUser
                        ? 'Update User'
                        : 'Create User'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 10,
                }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="text-center">
                  {/* Icon */}
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Delete User?
                  </h3>

                  <p className="mb-6 text-sm leading-6 text-gray-500">
                    This action cannot be undone. The user
                    account will be permanently removed.
                  </p>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleDelete(deleteConfirm)
                      }
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}