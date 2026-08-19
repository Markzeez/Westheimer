'use client';

import { useEffect, useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  X,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';
import { ProductImageCarousel } from '@/components/ui/ProductImageCarousel';
import { StatusBadge } from '@/components/admin/AdminLayout';

interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subCategory?: string;
  images: ProductImage[];
  inventory: number;
  ratings: number;
  reviewCount: number;
  features: string[];
  dimensions?: Dimensions;
  material?: string;
  color?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
}

const CATEGORIES = [
  { value: 'living-room', label: 'Living Room' },
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'dining-room', label: 'Dining Room' },
  { value: 'office', label: 'Office' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'storage', label: 'Storage' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'decor', label: 'Decor' },
];

const defaultForm = {
  name: '',
  description: '',
  price: 0,
  category: 'living-room',
  subCategory: '',
  inventory: 0,
  features: [] as string[],
  dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
  material: '',
  color: '',
  isActive: true,
  isFeatured: false,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (search) params.set('search', search);
      if (filterCategory) params.set('category', filterCategory);
      if (filterStock === 'in-stock') params.set('inStock', 'true');
      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      setProducts(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch {
      console.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, filterCategory, filterStock]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setForm(defaultForm);
    setImageFiles([]);
    setImagePreviews([]);
    setEditingProduct(null);
    setNewFeature('');
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      subCategory: product.subCategory || '',
      inventory: product.inventory,
      features: product.features || [],
      dimensions: product.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
      material: product.material || '',
      color: product.color || '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
    setImageFiles([]);
    setImagePreviews(product.images.map((i) => i.url));
    setShowModal(true);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (newFeature.trim() && form.features.length < 10) {
      setForm((prev) => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', String(form.price));
      fd.append('category', form.category);
      fd.append('subCategory', form.subCategory);
      fd.append('inventory', String(form.inventory));
      fd.append('features', JSON.stringify(form.features));
      fd.append('dimensions', JSON.stringify(form.dimensions));
      fd.append('material', form.material);
      fd.append('color', form.color);
      fd.append('isActive', String(form.isActive));
      fd.append('isFeatured', String(form.isFeatured));
      imageFiles.forEach((file) => fd.append('images', file));

      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      setDeleteConfirm(null);
      fetchProducts();
    } catch {
      alert('Failed to delete product');
    }
  };

  const handleBulkAction = async (action: string, data?: Record<string, unknown>) => {
    if (selectedProducts.length === 0) return;
    try {
      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, productIds: selectedProducts, data }),
      });
      setSelectedProducts([]);
      fetchProducts();
    } catch {
      alert('Failed action execution');
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const getStockStatus = (inventory: number) => {
    if (inventory === 0) return 'out-of-stock';
    if (inventory <= 10) return 'low-stock';
    return 'in-stock';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your furniture inventory and product listings.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => alert('Export coming soon')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={filterStock}
          onChange={(e) => {
            setFilterStock(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Stock</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock (≤10)</option>
        </select>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-200"
          >
            <span className="text-sm text-primary-700 font-medium">
              {selectedProducts.length} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-3 py-1.5 text-xs font-medium bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Deactivate
              </button>
              <button
                onClick={() => handleBulkAction('feature')}
                className="px-3 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Feature
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No products found</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow ${
                  selectedProducts.includes(product._id)
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : 'border-gray-200'
                }`}
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => toggleSelectProduct(product._id)}
                    className="absolute top-3 left-3 z-10 w-4 h-4 text-primary-600 rounded border-gray-300"
                  />
                  <ProductImageCarousel
                    images={product.images}
                    showThumbnails={false}
                    className="aspect-square"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">
                    {product.category.replace('-', ' ')}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
                    <StatusBadge status={getStockStatus(product.inventory)} />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span>Stock: {product.inventory}</span> <span>•</span>
                    <span>⭐ {product.ratings.toFixed(1)}</span> <span>•</span>
                    <span>{product.reviewCount} reviews</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    {product.isActive && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        Active
                      </span>
                    )}
                    {product.isFeatured && (
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        ★ Featured
                      </span>
                    )}
                    {!product.isActive && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => setPreviewProduct(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product._id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Product Form Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-10 px-4 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images (up to 5)
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {imagePreviews.map((preview, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group"
                      >
                        <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 text-[10px] bg-primary-500 text-white px-1 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                    {imagePreviews.length < 5 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                        <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-[10px] text-gray-400">Add Image</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    First image is the primary display image. JPG, PNG, WebP.
                  </p>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Modern Oak Dining Table"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Detailed product description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => setForm((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inventory *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.inventory}
                      onChange={(e) => setForm((prev) => ({ ...prev, inventory: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    {form.inventory <= 10 && form.inventory > 0 && (
                      <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Low stock
                      </p>
                    )}
                    {form.inventory === 0 && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Out of stock
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      required
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                    <input
                      type="text"
                      value={form.subCategory}
                      onChange={(e) => setForm((prev) => ({ ...prev, subCategory: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Sofa, Armchair"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                    <input
                      type="text"
                      value={form.material}
                      onChange={(e) => setForm((prev) => ({ ...prev, material: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                      placeholder="e.g., Oak Wood, Leather"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                    <input
                      type="text"
                      value={form.color}
                      onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                      placeholder="e.g., Walnut Brown"
                    />
                  </div>
                </div>

                {/* Dimensions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions</label>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Length</label>
                      <input
                        type="number"
                        min="0"
                        value={form.dimensions.length}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            dimensions: { ...prev.dimensions, length: parseFloat(e.target.value) || 0 },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Width</label>
                      <input
                        type="number"
                        min="0"
                        value={form.dimensions.width}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            dimensions: { ...prev.dimensions, width: parseFloat(e.target.value) || 0 },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Height</label>
                      <input
                        type="number"
                        min="0"
                        value={form.dimensions.height}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            dimensions: { ...prev.dimensions, height: parseFloat(e.target.value) || 0 },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Unit</label>
                      <select
                        value={form.dimensions.unit}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            dimensions: { ...prev.dimensions, unit: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="cm">cm</option>
                        <option value="inch">inch</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Add a feature"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Add
                    </button>
                  </div>
                  {form.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.features.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {f}
                          <button
                            type="button"
                            onClick={() => removeFeature(i)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                </div>
              </form>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setPreviewProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Product Preview</h2>
                  <button
                    onClick={() => setPreviewProduct(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ProductImageCarousel images={previewProduct.images} showThumbnails={true} />
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">{previewProduct.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {previewProduct.category.replace('-', ' ')}
                    </p>
                    <p className="text-3xl font-bold text-primary-600">
                      ${previewProduct.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={getStockStatus(previewProduct.inventory)} />
                      <span className="text-sm text-gray-500">
                        ({previewProduct.inventory} in stock)
                      </span>
                    </div>
                    <p className="text-gray-600">{previewProduct.description}</p>
                    {previewProduct.material && (
                      <p className="text-sm">
                        <span className="font-medium">Material:</span> {previewProduct.material}
                      </p>
                    )}
                    {previewProduct.color && (
                      <p className="text-sm">
                        <span className="font-medium">Color:</span> {previewProduct.color}
                      </p>
                    )}
                    {previewProduct.dimensions && (
                      <p className="text-sm">
                        <span className="font-medium">Dimensions:</span>{' '}
                        {previewProduct.dimensions.length} × {previewProduct.dimensions.width} ×{' '}
                        {previewProduct.dimensions.height} {previewProduct.dimensions.unit}
                      </p>
                    )}
                    {previewProduct.features.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {previewProduct.features.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  This action cannot be undone. The product will be permanently removed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
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
  );
}