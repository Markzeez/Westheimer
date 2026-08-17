'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Check, CreditCard, Truck, Shield, RotateCcw, Lock, MapPin, Mail, Phone, User, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/stores/cartStore';
import { Header } from '@/component/Header';
import { Footer } from '@/component/Footer';
import { toast } from '@/components/ToastProvider';

const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(5, 'Valid ZIP code required'),
  country: z.string().min(1, 'Country is required'),
});

const paymentSchema = z.object({
  cardName: z.string().min(1, 'Name on card is required'),
  cardNumber: z.string().min(16, 'Invalid card number'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry (MM/YY)'),
  cvv: z.string().min(3, 'Invalid CVV'),
});

type ShippingForm = z.infer<typeof shippingSchema>;
type PaymentForm = z.infer<typeof paymentSchema>;

const steps = [
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: Shield },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTotalItems, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const shippingForm = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
    },
  });

  const paymentForm = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
    },
  });

  const shipping = getSubtotal() >= 500 ? 0 : 15;
  const tax = getSubtotal() * 0.08;
  const total = getSubtotal() + shipping + tax;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cart is Empty</h1>
          <p className="text-gray-500 mb-8">Add some furniture to your cart before checking out.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleShippingSubmit = async (data: ShippingForm) => {
    setCurrentStep(1);
  };

  const handlePaymentSubmit = async (data: PaymentForm) => {
    setCurrentStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      // In real app: call API to create order
      // const res = await fetch('/api/orders', { method: 'POST', body: JSON.stringify({...}) });
      // const order = await res.json();
      
      // Simulate order creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      clearCart();
      
      toast.success('Order placed successfully!');
      // Redirect to receipt page for printing
      router.push(`/orders/${orderId}/receipt`);
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const stepKeys = ['shipping', 'payment', 'review'] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm ${
                      index < currentStep
                        ? 'bg-primary-600 text-white'
                        : index === currentStep
                        ? 'bg-primary-100 text-primary-600 border-2 border-primary-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {index < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`hidden lg:block w-24 h-1 mx-2 ${
                        index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <span className={`hidden lg:block text-sm font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              {/* Step 1: Shipping */}
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.form
                    key="shipping"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={shippingForm.handleSubmit(handleShippingSubmit)}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary-600" />
                        Shipping Information
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                          <input {...shippingForm.register('firstName')} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
                          {shippingForm.formState.errors.firstName && (
                            <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.firstName.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                          <input {...shippingForm.register('lastName')} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
                          {shippingForm.formState.errors.lastName && (
                            <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.lastName.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                          <input type="email" {...shippingForm.register('email')} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
                          {shippingForm.formState.errors.email && (
                            <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.email.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                          <input type="tel" {...shippingForm.register('phone')} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
                          {shippingForm.formState.errors.phone && (
                            <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.phone.message}</p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                          <input {...shippingForm.register('address')} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
                          {shippingForm.formState.errors.address && (
                            <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.address.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                          <input {...shippingForm.register('city')} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
                          {shippingForm.formState.errors.city && (
                            <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.city.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                          <input {...shippingForm.register('state')} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
                          {shippingForm.formState.errors.state && (
                            <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.state.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                          <input {...shippingForm.register('zipCode')} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
                          {shippingForm.formState.errors.zipCode && (
                            <p className="text-sm text-red-500 mt-1">{shippingForm.formState.errors.zipCode.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                          <select {...shippingForm.register('country')} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
                            <option value="USA">United States</option>
                            <option value="CAN">Canada</option>
                            <option value="UK">United Kingdom</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                      Continue to Payment
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </motion.form>
                )}

                {/* Step 2: Payment */}
                {currentStep === 1 && (
                  <motion.form
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary-600" />
                        Payment Details
                      </h2>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card *</label>
                          <input {...paymentForm.register('cardName')} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500" />
                          {paymentForm.formState.errors.cardName && (
                            <p className="text-sm text-red-500 mt-1">{paymentForm.formState.errors.cardName.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                          <input
                            {...paymentForm.register('cardNumber')}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 font-mono"
                          />
                          {paymentForm.formState.errors.cardNumber && (
                            <p className="text-sm text-red-500 mt-1">{paymentForm.formState.errors.cardNumber.message}</p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY) *</label>
                            <input
                              {...paymentForm.register('expiry')}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                            />
                            {paymentForm.formState.errors.expiry && (
                              <p className="text-sm text-red-500 mt-1">{paymentForm.formState.errors.expiry.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                            <input
                              {...paymentForm.register('cvv')}
                              type="password"
                              placeholder="123"
                              maxLength={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                            />
                            {paymentForm.formState.errors.cvv && (
                              <p className="text-sm text-red-500 mt-1">{paymentForm.formState.errors.cvv.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(0)}
                        className="flex-1 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                        Continue to Review
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* Step 3: Review */}
                {currentStep === 2 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary-600" />
                        Review Your Order
                      </h2>

                      <div className="space-y-4 mb-6">
                        <h3 className="font-medium text-gray-900">Shipping Address</h3>
                        <p className="text-gray-600 whitespace-pre-line">
                          {shippingForm.watch('firstName')} {shippingForm.watch('lastName')}<br />
                          {shippingForm.watch('address')}<br />
                          {shippingForm.watch('city')}, {shippingForm.watch('state')} {shippingForm.watch('zipCode')}<br />
                          {shippingForm.watch('country')}<br />
                          {shippingForm.watch('phone')}<br />
                          {shippingForm.watch('email')}
                        </p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <h3 className="font-medium text-gray-900">Payment Method</h3>
                        <p className="text-gray-600">
                          Ending in {paymentForm.watch('cardNumber').slice(-4)}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Items</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {items.map((item) => (
                            <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          'Place Order'
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <dl className="space-y-3 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-medium text-gray-900">{formatPrice(getSubtotal())}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Shipping</dt>
                    <dd className="font-medium text-gray-900">
                      {shipping === 0 ? <span className="text-green-600">Free</span> : formatPrice(shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Tax (8%)</dt>
                    <dd className="font-medium text-gray-900">{formatPrice(tax)}</dd>
                  </div>
                </dl>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <dt>Total</dt>
                    <dd>{formatPrice(total)}</dd>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Secure SSL encrypted checkout
                  </p>
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