'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, Sparkles, Home, CreditCard, Bell, User, ArrowRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { Header } from '@/component/Header';
import { Footer } from '@/component/Footer';

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles, description: 'Tell us about your style' },
  { id: 'rooms', title: 'Rooms', icon: Home, description: 'Which rooms are you furnishing?' },
  { id: 'budget', title: 'Budget', icon: CreditCard, description: "What's your price range?" },
  { id: 'profile', title: 'Profile', icon: User, description: 'Complete your profile' },
  { id: 'notifications', title: 'Updates', icon: Bell, description: 'Stay in the loop' },
];

const STYLE_OPTIONS = [
  { id: 'modern', label: 'Modern', emoji: '✨', description: 'Clean lines, minimal aesthetic' },
  { id: 'mid-century', label: 'Mid-Century', emoji: '🪑', description: 'Iconic 50s/60s designs' },
  { id: 'scandinavian', label: 'Scandinavian', emoji: '☁️', description: 'Light, airy, functional' },
  { id: 'industrial', label: 'Industrial', emoji: '🏭', description: 'Raw materials, urban feel' },
  { id: 'bohemian', label: 'Bohemian', emoji: '🌿', description: 'Eclectic, layered, colorful' },
  { id: 'traditional', label: 'Traditional', emoji: '🏛️', description: 'Classic, timeless elegance' },
  { id: 'coastal', label: 'Coastal', emoji: '🌊', description: 'Relaxed, beachy vibes' },
  { id: 'eclectic', label: 'Eclectic', emoji: '🎨', description: 'Mix & match personality' },
];

const ROOM_OPTIONS = [
  { id: 'living-room', label: 'Living Room', emoji: '🛋️' },
  { id: 'bedroom', label: 'Bedroom', emoji: '🛏️' },
  { id: 'dining-room', label: 'Dining Room', emoji: '🍽️' },
  { id: 'home-office', label: 'Home Office', emoji: '💻' },
  { id: 'outdoor', label: 'Outdoor/Patio', emoji: '🌿' },
  { id: 'entryway', label: 'Entryway', emoji: '🚪' },
];

const BUDGET_RANGES = [
  { id: 'under-1k', label: 'Under $1,000', description: 'Budget-friendly finds' },
  { id: '1k-5k', label: '$1,000 - $5,000', description: 'Quality pieces for key rooms' },
  { id: '5k-15k', label: '$5,000 - $15,000', description: 'Full room makeovers' },
  { id: '15k-plus', label: '$15,000+', description: 'Whole home transformation' },
];

function OnboardingPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    styles: [] as string[],
    rooms: [] as string[],
    budget: '' as string,
    address: '' as string,
    phone: '' as string,
    emailUpdates: true,
    smsUpdates: false,
    newArrivals: true,
    sales: true,
    designTips: false,
  });
  const [completed, setCompleted] = useState(false);

  // Check if user already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!session?.user) return;

      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from('users')
          .select('onboarding_completed, onboarding_data')
          .eq('id', (session.user as any).id)
          .single();

        if (data?.onboarding_completed) {
          setCompleted(true);
          // Redirect to intended page or home
          const redirectTo = searchParams?.get('redirect') || '/';
          router.push(redirectTo);
        } else if (data?.onboarding_data) {
          // Pre-fill form with saved data
          setFormData(prev => ({ ...prev, ...data.onboarding_data }));
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    if (session?.user) {
      checkOnboardingStatus();
    }
  }, [session, router, searchParams]);

  const saveProgress = async (final = false) => {
    if (!session?.user) return;

    try {
      const supabase = createSupabaseBrowserClient();
      const updateData: any = {
        onboarding_data: formData,
        updated_at: new Date().toISOString(),
      };

      if (final) {
        updateData.onboarding_completed = true;
        updateData.onboarding_completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', (session.user as any).id);

      if (error) throw error;

      if (final) {
        setCompleted(true);
        const redirectTo = searchParams?.get('redirect') || '/';
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      saveProgress();
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    await saveProgress(true);
    setIsLoading(false);
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/skip-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setCompleted(true);
        const redirectTo = searchParams?.get('redirect') || '/';
        router.push(redirectTo);
      }
    } catch (error) {
      console.error('Skip onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOption = (field: string, value: string) => {
    const current = formData[field as keyof typeof formData] as string[];
    setFormData(prev => ({
      ...prev,
      [field]: current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value],
    }));
  };

  const toggleBoolean = (field: keyof typeof formData) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const currentStepData = STEPS[currentStep];

  if (completed) {
    return null; // Will redirect
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto px-4"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Westheimer Designs</h2>
            <p className="text-gray-500 mb-8">Please sign in to continue your onboarding journey.</p>
            <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700">
              Sign In
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="pt-8 pb-16">
        {/* Progress Indicator */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center flex-1 relative"
              >
                {/* Connecting line */}
                {index < STEPS.length - 1 && (
                  <div className="absolute top-6 left-1/2 w-full h-1.5 -z-10">
                    <div
                      className="h-full rounded bg-gray-200"
                      style={{ width: index < currentStep ? '100%' : '0%' }}
                    >
                      <div className="h-full bg-primary-600 rounded" />
                    </div>
                  </div>
                )}

                <div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    index < currentStep
                      ? 'bg-primary-600 text-white'
                      : index === currentStep
                      ? 'bg-primary-100 text-primary-600 ring-4 ring-primary-200'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                <span className="mt-2 text-xs font-medium text-center text-gray-600 max-w-[80px]">
                  {step.title}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm"
            >
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h1>
                <p className="text-gray-600 mt-2">{currentStepData.description}</p>
              </div>

              {/* Step 0: Welcome / Style Preferences */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <p className="text-gray-600">Select the styles that inspire you (choose 1-3)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {STYLE_OPTIONS.map((style) => (
                      <motion.button
                        key={style.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleOption('styles', style.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          formData.styles.includes(style.id)
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-3xl mb-2 block">{style.emoji}</span>
                        <h4 className="font-semibold text-gray-900">{style.label}</h4>
                        <p className="text-xs text-gray-500 mt-1">{style.description}</p>
                        {formData.styles.includes(style.id) && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  {formData.styles.length > 0 && (
                    <p className="text-sm text-primary-600 font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {formData.styles.length} style{formData.styles.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}

              {/* Step 1: Room Preferences */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <p className="text-gray-600">Which rooms are you looking to furnish? (select all that apply)</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {ROOM_OPTIONS.map((room) => (
                      <motion.button
                        key={room.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleOption('rooms', room.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all ${
                          formData.rooms.includes(room.id)
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-3xl mb-2 block">{room.emoji}</span>
                        <h4 className="font-semibold text-gray-900">{room.label}</h4>
                        {formData.rooms.includes(room.id) && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  {formData.rooms.length > 0 && (
                    <p className="text-sm text-primary-600 font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {formData.rooms.length} room{formData.rooms.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: Budget */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <p className="text-gray-600">What&apos;s your overall budget range?</p>
                  <div className="space-y-3">
                    {BUDGET_RANGES.map((budget) => (
                      <motion.button
                        key={budget.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ x: 4 }}
                        onClick={() => setFormData(prev => ({ ...prev, budget: budget.id }))}
                        className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                          formData.budget === budget.id
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{budget.label}</h4>
                            <p className="text-sm text-gray-500 mt-1">{budget.description}</p>
                          </div>
                          {formData.budget === budget.id && (
                            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Profile */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <p className="text-gray-600">Complete your profile for faster checkout and delivery</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address (optional)
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Street address, city, state, ZIP"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number (optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <p className="text-sm text-gray-500">We&apos;ll only use this for delivery updates and order confirmations.</p>
                  </div>
                </div>
              )}

              {/* Step 4: Notifications */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <p className="text-gray-600">Choose how you&apos;d like to stay updated</p>
                  <div className="space-y-4">
                    {[
                      { key: 'emailUpdates', label: 'Email Updates', desc: 'New arrivals, sales, and design inspiration' },
                      { key: 'smsUpdates', label: 'SMS Updates', desc: 'Order and delivery notifications via text' },
                      { key: 'newArrivals', label: 'New Arrivals', desc: 'Be the first to know about new collections' },
                      { key: 'sales', label: 'Sales & Promotions', desc: 'Exclusive discounts and flash sales' },
                      { key: 'designTips', label: 'Design Tips', desc: 'Weekly interior design ideas and guides' },
                    ].map((item) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{item.label}</h4>
                          <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData[item.key as keyof typeof formData] as boolean}
                            onChange={() => toggleBoolean(item.key as keyof typeof formData)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSkip}
                disabled={isLoading}
                className="px-6 py-3 text-gray-500 bg-white border border-gray-300 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Skip for now
              </button>

              {currentStep === STEPS.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Completing...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 flex items-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingPageContent />
    </Suspense>
  );
}
