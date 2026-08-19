'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Download } from 'lucide-react';
import { StatusBadge, ActionButtons, DataTable, AdminLayout } from '@/components/admin/AdminLayout';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shippingAddress: { name: string; address: string; city: string; state: string; zipCode: string; country: string; phone: string };
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterStatus) params.set('status', filterStatus);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin?type=orders&${params}`);
      const json = await res.json();
      setOrders(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch { console.error('Failed to fetch orders'); }
    finally { setIsLoading(false); }
  }, [page, filterStatus, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setNotes(order.notes || '');
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, trackingNumber, notes }),
      });
      if (!res.ok) throw new Error('Failed to update order');
      setShowStatusModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch { alert('Failed to update order'); }
    finally { setIsUpdating(false); }
  };

  const columns = [
    { key: 'id', header: 'Order', render: (o: Order) => <div><p className="font-mono font-medium">#{o._id.slice(-8).toUpperCase()}</p><p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p></div> },
    { key: 'customer', header: 'Customer', render: (o: Order) => { const u = typeof o.userId === 'object' ? o.userId : { name: 'Unknown', email: '' }; return <div><p className="font-medium">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></div>; } },
    { key: 'items', header: 'Items', render: (o: Order) => <span className="text-sm text-gray-500">{o.items.reduce((s, i) => s + i.quantity, 0)} item(s)</span> },
    { key: 'total', header: 'Total', render: (o: Order) => <span className="font-medium text-gray-900">${o.total.toFixed(2)}</span> },
    { key: 'status', header: 'Status', render: (o: Order) => <StatusBadge status={o.status} /> },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track customer orders.</p>
          </div>
          <button onClick={() => alert('Export orders coming soon')} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search orders..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm">
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        <DataTable
          columns={columns}
          data={orders}
          keyExtractor={(o) => o._id}
          isLoading={isLoading}
          emptyMessage="No orders found"
          onRowClick={openStatusModal}
          actions={(order) => (
            <div className="flex items-center justify-end gap-1">
              <ActionButtons
                onView={() => openStatusModal(order)}
                onEdit={() => openStatusModal(order)}
              />
            </div>
          )}
          pagination={{ page, totalPages, onPageChange: setPage }}
        />

        {/* Status Update Modal */}
        <AnimatePresence>
          {showStatusModal && selectedOrder && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowStatusModal(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Update Order Status</h2>
                  <button onClick={() => setShowStatusModal(false)} className="p-2 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                    <p className="text-sm font-mono text-gray-900">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <p className="text-sm text-gray-500">{typeof selectedOrder.userId === 'object' ? selectedOrder.userId.name : 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                    <p className="text-sm font-medium text-gray-900">${selectedOrder.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as typeof newStatus)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                    <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Optional" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Internal notes..." />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button onClick={() => setShowStatusModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                  <button disabled={isUpdating} onClick={handleStatusUpdate} className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50">{isUpdating ? 'Updating...' : 'Update Status'}</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}