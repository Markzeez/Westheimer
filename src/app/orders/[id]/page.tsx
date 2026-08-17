'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Truck, MapPin, CreditCard, Clock, CheckCircle, Package, XCircle, RotateCcw, AlertCircle, Printer, FileText } from 'lucide-react';
import { Header } from '@/component/Header';
import { Footer } from '@/component/Footer';

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: { name: string; address: string; city: string; state: string; zipCode: string; country: string; phone: string };
  items: Array<{ _id: string; name: string; quantity: number; price: number; image: string }>;
  trackingNumber?: string;
  paymentMethod: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'processing', label: 'Processing', icon: AlertCircle },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderDetailPage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const orderId = typeof params?.id === 'string' ? params.id : '';
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/account?tab=orders');
      return;
    }

    fetchOrder();
  }, [orderId, router]);

  const fetchOrder = async () => {
    try {
      // In real app: const res = await fetch(`/api/orders/${orderId}`);
      // Mock data
      await new Promise(r => setTimeout(r, 500));
      setOrder({
        _id: orderId,
        total: 1299.99,
        status: 'shipped',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-17T14:20:00Z',
        shippingAddress: {
          name: 'John Doe',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          phone: '+1 (555) 123-4567',
        },
        items: [
          { _id: '1', name: 'Modern Sectional Sofa', quantity: 1, price: 1299.99, image: 'https://picsum.photos/seed/sofa/200/200.jpg' },
        ],
        trackingNumber: '1Z999AA10123456784',
        paymentMethod: 'Credit Card ending in 4242',
      });
    } catch {
      router.push('/account?tab=orders');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return statusSteps.findIndex(s => s.key === order.status);
  };

  const currentStep = getCurrentStepIndex();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-8 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="h-64 bg-gray-200 rounded" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="h-64 bg-gray-200 rounded" />
                <div className="h-64 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-gray-500">Order not found</p>
            <Link href="/account?tab=orders" className="mt-4 text-primary-600 hover:underline">Back to Orders</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const shipping = order.total >= 500 ? 0 : 15;
  const tax = order.total * 0.08;
  const grandTotal = order.total + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button & Header */}
          <div className="mb-8">
            <Link href="/account?tab=orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
              <ChevronLeft className="w-5 h-5" />
              Back to Orders
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order #{order._id}</h1>
                <p className="text-gray-600 mt-1">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-xl font-medium ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <Link
                  href={`/orders/${order._id}/receipt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </Link>
              </div>
            </div>
          </div>

          {/* Order Progress Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 mb-8"
          >
            <div className="relative">
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200" />
              <div className="absolute top-6 left-0 right-0 h-1 bg-primary-600">
                <div className="h-full bg-primary-600" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
              </div>
              <div className="relative flex items-center justify-between">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-all ${
                      index <= currentStep
                        ? 'bg-primary-600 text-white border-4 border-white shadow-lg'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-medium text-center w-24 block ${index <= currentStep ? 'text-primary-600' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Items & Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Order Items ({order.items.length})</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {order.items.map((item) => (
                    <div key={item._id} className="p-6 flex gap-4">
                      <Link href={`/products/${item._id}`} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item._id}`}>
                          <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                      <p className="font-semibold text-gray-900 whitespace-nowrap">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Shipping & Payment */}
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    Shipping Address
                  </h3>
                  <address className="text-gray-600 not-italic space-y-1">
                    <p className="font-medium">{order.shippingAddress.name}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p>{order.shippingAddress.country}</p>
                    <p>{order.shippingAddress.phone}</p>
                  </address>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                    Payment Method
                  </h3>
                  <p className="text-gray-600">{order.paymentMethod}</p>
                </motion.div>
              </div>

              {/* Tracking */}
              {order.trackingNumber && order.status !== 'delivered' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary-600" />
                        Tracking Information
                      </h3>
                      <p className="text-gray-500">Your package is on the way!</p>
                    </div>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-medium">
                      Track Package
                    </button>
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl font-mono text-sm text-gray-700">
                    {order.trackingNumber}
                  </div>
                </motion.div>
              )}

              {/* Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-6">Order Timeline</h3>
                <div className="space-y-6">
                  {[
                    { status: 'pending', time: order.createdAt, desc: 'Order placed successfully' },
                    { status: 'processing', time: order.updatedAt, desc: 'Order is being prepared' },
                    { status: 'shipped', time: order.updatedAt, desc: 'Package shipped with tracking' },
                    { status: 'delivered', time: order.updatedAt, desc: 'Package delivered' },
                  ].map((event, index) => {
                    const isCompleted = statusSteps.findIndex(s => s.key === event.status) <= currentStep;
                    const isCurrent = statusSteps.findIndex(s => s.key === event.status) === currentStep;
                    return (
                      <div key={event.status} className="flex gap-4">
                        <div className="relative flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${isCompleted ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'} ${isCurrent ? 'ring-4 ring-primary-200' : ''}`}>
                            {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          </div>
                          {index < 3 && <div className="absolute top-8 bottom-0 left-3.5 w-1 bg-gray-200" />}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{event.desc}</p>
                          <p className="text-sm text-gray-500">{formatDate(event.time)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24"
              >
                <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                <dl className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-medium text-gray-900">{formatPrice(order.total)}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Shipping</dt>
                    <dd className="font-medium text-gray-900">{shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Tax</dt>
                    <dd className="font-medium text-gray-900">{formatPrice(tax)}</dd>
                  </div>
                </dl>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <dt>Total</dt>
                    <dd>{formatPrice(grandTotal)}</dd>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}