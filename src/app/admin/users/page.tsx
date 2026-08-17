'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit, Trash2, Shield, User, MoreVertical, X, Mail, MapPin, Phone } from 'lucide-react';
import { StatusBadge, ActionButtons, DataTable, AdminLayout } from '@/components/admin/AdminLayout';

interface User {
  _id: string;
  name: string;
  email: string;
  address?: string;
  role: 'user' | 'admin';
  createdAt: string;
  orderHistory: string[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', email: '', address: '', role: 'user' as 'user' | 'admin', password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (filterRole) params.set('role', filterRole);
      const res = await fetch(`/api/admin?type=users&${params}`);
      const json = await res.json();
      setUsers(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch { console.error('Failed to fetch users'); }
    finally { setIsLoading(false); }
  }, [page, search, filterRole]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const resetForm = () => { setForm({ name: '', email: '', address: '', role: 'user', password: '' }); setEditingUser(null); };

  const openCreateModal = () => { resetForm(); setShowModal(true); };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, address: user.address || '', role: user.role, password: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      const url = editingUser ? `/api/admin/users/${editingUser._id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to save user'); }
      setShowModal(false); resetForm(); fetchUsers();
    } catch (err) { alert(err instanceof Error ? err.message : 'Failed to save user'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (userId: string) => {
    try { const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' }); if (!res.ok) throw new Error('Failed'); setDeleteConfirm(null); fetchUsers(); }
    catch { alert('Failed to delete user'); }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (u: User) => <div><p className="font-medium">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></div> },
    { key: 'role', header: 'Role', render: (u: User) => <StatusBadge status={u.role} /> },
    { key: 'address', header: 'Address', render: (u: User) => <span className="text-sm text-gray-500 truncate max-w-[200px] block">{u.address || '—'}</span> },
    { key: 'orders', header: 'Orders', render: (u: User) => <span className="text-sm text-gray-500">{u.orderHistory.length}</span> },
    { key: 'createdAt', header: 'Joined', render: (u: User) => <span className="text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</span> },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-500 mt-1">Manage customer accounts and admin users.</p>
          </div>
          <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm">
            <option value="">All Roles</option>
            <option value="user">Customer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <DataTable
          columns={columns}
          data={users}
          keyExtractor={(u) => u._id}
          isLoading={isLoading}
          emptyMessage="No users found"
          onRowClick={openEditModal}
          actions={(user) => (
            <div className="flex items-center justify-end gap-1">
              <ActionButtons
                onEdit={() => openEditModal(user)}
                onDelete={() => setDeleteConfirm(user._id)}
              />
            </div>
          )}
          pagination={{ page, totalPages, onPageChange: setPage }}
        />

        {/* User Form Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                  <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input required value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input required type="email" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{editingUser ? 'New Password (leave blank to keep current)' : 'Password *'} *</label>
                    <input type="password" value={form.password} onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder={editingUser ? '••••••••' : 'Min 8 characters'} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea rows={2} value={form.address} onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select value={form.role} onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value as 'user' | 'admin' }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      <option value="user">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                    <button disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">{isSubmitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-red-600" /></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User?</h3>
                  <p className="text-sm text-gray-500 mb-6">This action cannot be undone. The user account will be permanently removed.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                    <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
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