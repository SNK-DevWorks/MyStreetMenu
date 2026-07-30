"use client";

import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, Loader2, MapPin, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    shopName: '',
    category: '',
    phone: '',
    whatsapp: '',
    location: '',
  });

  const supabase = createClient();

  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData((prev) => ({
          ...prev,
          shopName: user.user_metadata?.shop_name || user.user_metadata?.name || '',
          phone: user.user_metadata?.phone || '',
          location: user.user_metadata?.location || user.user_metadata?.address || '',
        }));
      }
    };
    getUserData();
  }, [supabase.auth]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles moving to the next step
  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  // Handles moving to the previous step
  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Simulates final submission and redirect to dashboard
  const finishOnboarding = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: {
            shop_name: formData.shopName || user.user_metadata?.shop_name,
            category: formData.category,
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            location: formData.location,
            address: formData.location,
            onboarding_completed: true,
          },
        });
      }
    } catch (err) {
      console.error('Error saving onboarding info:', err);
    } finally {
      setIsLoading(false);
      router.push('/vendor/dashboard');
    }
  };

  // We use a small style block for keyframes that are complex to write purely in inline utility classes
  const customStyles = `
    .step-enter {
      animation: slideInRight 0.4s ease-out forwards;
    }
    
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .card-shadow {
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
    }
  `;

  return (
    <div className="min-h-screen bg-[#FCF9F6] flex items-center justify-center font-sans text-gray-800 p-4">
      <style>{customStyles}</style>

      {/* Main Container */}
      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 md:p-12 card-shadow relative overflow-hidden">
        {/* Header / Logo Area */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/text-logo.png" alt="MyStreetMenu" className="h-9 w-auto object-contain mx-auto" />
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center items-center space-x-2 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-orange-500' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="step-enter text-center">
            <h1 className="text-3xl font-bold mb-3 text-gray-900">
              Welcome to MyStreetMenu
            </h1>
            <p className="text-gray-500 mb-8 leading-relaxed max-w-md mx-auto">
              Let's set up your digital menu in just a couple of steps.
            </p>
            <button
              onClick={nextStep}
              className="w-full sm:w-auto px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors duration-200 shadow-sm shadow-orange-200 cursor-pointer"
            >
              Get Started
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="step-enter">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
              Tell us about your shop
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                nextStep();
              }}
              className="space-y-4 max-w-md mx-auto"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. SNK DevWorks"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-400 text-gray-900"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="10-digit number"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-400 text-gray-900"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-400 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Paste Google Maps link or enter address..."
                    className="w-full px-4 py-3 pr-32 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-400 text-gray-900"
                  />
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-2 px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-orange-200/60 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-orange-500" />
                  </a>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Click 'Google Maps' to find your shop, then copy & paste the link or address here.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full px-4 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors duration-200 shadow-sm shadow-orange-200 flex justify-center items-center gap-1 cursor-pointer"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="step-enter text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">
              Start your free trial
            </h2>

            <div className="max-w-sm mx-auto bg-white border-2 border-orange-500 rounded-3xl p-8 text-left relative shadow-lg mb-8">
              {/* Badge */}
              <div className="absolute -top-3.5 right-6 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Recommended
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-extrabold text-gray-900">
                  ₹59
                </span>
                <span className="text-gray-500 ml-1 font-medium">/month</span>
              </div>
              <p className="text-orange-500 font-semibold text-sm mb-6 pb-6 border-b border-gray-100">
                30-Day Free Trial
              </p>

              <p className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                What's included?
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-orange-500 mr-3 shrink-0" />
                  <span className="text-gray-700 font-medium text-sm">
                    Digital QR Menu
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-orange-500 mr-3 shrink-0" />
                  <span className="text-gray-700 font-medium text-sm">
                    Unlimited Menu Items
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-orange-500 mr-3 shrink-0" />
                  <span className="text-gray-700 font-medium text-sm">
                    Promotions & Offers
                  </span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-orange-500 mr-3 shrink-0" />
                  <span className="text-gray-700 font-medium text-sm">
                    Basic Analytics
                  </span>
                </li>
              </ul>

              <button
                onClick={nextStep}
                className="w-full px-4 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 text-gray-500 hover:text-gray-800 font-medium transition-colors duration-200 cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="step-enter text-center">
            <div className="relative mx-auto w-32 h-32 mb-6 mt-4">
              {/* Abstract celebratory shape with rotating animation */}
              <div className="absolute inset-0 bg-[#E8F0FE] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="text-5xl">🚀</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              You're all set!
            </h2>
            <p className="text-gray-500 mb-10 text-lg max-w-md mx-auto">
              Your 30-day free trial is now active.
            </p>

            <button
              onClick={finishOnboarding}
              disabled={isLoading}
              className="w-full sm:w-auto px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm shadow-orange-200 flex items-center justify-center mx-auto disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Loading Dashboard...
                </>
              ) : (
                'Go to Dashboard'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
