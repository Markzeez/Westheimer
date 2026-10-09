'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Check, Truck, Shield, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/stores/cartStore';
import { Header } from '@/component/Header';
import { Footer } from '@/component/Footer';
import { toast } from '@/components/ToastProvider';
import { calculateOrderTotals, formatPrice } from '@/lib/currency';
import { LoadingButton } from '@/components/ui/loading-button';

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

type ShippingForm = z.infer<typeof shippingSchema>;

const steps = [
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'review', label: 'Review', icon: Shield },
];

export default function CheckoutPage() {
  const { items, getSubtotal } = useCartStore();
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
      country: 'Nigeria',
    },
  });

  const { shipping, tax, total } = calculateOrderTotals(getSubtotal());
  const [paymentMessage, setPaymentMessage] = useState('');

  useEffect(() => {
    const paymentResult = new URLSearchParams(window.location.search).get('payment');
    if (paymentResult === 'failed') {
      setPaymentMessage('Payment was not completed. Your cart is still available to try again.');
    } else if (paymentResult === 'review') {
      setPaymentMessage('Your payment needs review. Please contact support before trying again.');
    }
  }, []);

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

  const handleShippingSubmit = async () => {
    setCurrentStep(1);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      const shippingValues = shippingForm.getValues();
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          email: shippingValues.email,
          shippingAddress: {
            name: `${shippingValues.firstName} ${shippingValues.lastName}`,
            address: shippingValues.address,
            city: shippingValues.city,
            state: shippingValues.state,
            zip_code: shippingValues.zipCode,
            country: shippingValues.country,
            phone: shippingValues.phone,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok || typeof result.authorizationUrl !== 'string') {
        throw new Error(result.error || 'Unable to start payment');
      }
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start payment');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {paymentMessage && (
            <p role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              {paymentMessage}
            </p>
          )}
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
                        ? 'bg-primary-100 text-black border-2 border-primary-600'
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
                        <Truck className="w-5 h-5 text-black" />
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

                {/* Step 2: Review */}
                {currentStep === 1 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-black" />
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
                        <p className="text-gray-600">Secure online payment with Paystack (NGN)</p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-medium text-gray-900">Items</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {items.map((item) => (
                            <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                              <Image src={item.image} alt={item.name} width={64} height={64} className="w-16 h-16 rounded-lg object-cover" />
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
                        onClick={() => setCurrentStep(0)}
                        className="flex-1 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <LoadingButton
                        onClick={handlePlaceOrder}
                        loading={isProcessing}
                        loadingText="Processing..."
                        className="flex-1 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        Place Order
                      </LoadingButton>
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
                      <Image src={item.image} alt={item.name} width={64} height={64} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
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