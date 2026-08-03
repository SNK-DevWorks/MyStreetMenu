"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Check, ChevronRight, Loader2, MapPin, ExternalLink, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { completeOnboardingAction } from '@/actions/auth/complete-onboarding';

// ─── Session Storage Key ──────────────────────────────────────────────────────
const STORAGE_KEY = 'msm_onboarding_draft';

// ─── Google Maps URL validator ────────────────────────────────────────────────
function isGoogleMapsUrl(value: string): boolean {
  return /^https?:\/\/(maps\.google\.|google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(value.trim());
}

function validateLocation(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Location is required.';

  const isUrl = /^https?:\/\//i.test(trimmed);
  if (isUrl && !isGoogleMapsUrl(trimmed)) {
    return 'Please paste a valid Google Maps link (e.g. maps.app.goo.gl/...) or type a plain address.';
  }
  if (!isUrl && trimmed.length < 5) {
    return 'Address is too short. Please enter a full address or paste a Google Maps link.';
  }
  return null; // valid
}

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    shopName: '',
    category: '',
    phone: '',
    whatsapp: '',
    location: '',
  });

  const supabase = createClient();

  // ── Restore draft from sessionStorage (industry-standard "form persistence") ──
  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/vendor/login');
        return;
      }

      const isOnboarded = Boolean(
        user.user_metadata?.onboarding_completed ||
        (user.user_metadata?.shop_name && user.user_metadata?.phone)
      );
      if (isOnboarded) {
        router.replace('/vendor/dashboard');
        return;
      }

      // Try to restore a saved draft (user may have left to open Google Maps)
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const { formData: savedForm, step: savedStep } = JSON.parse(saved);
          if (savedForm) {
            setFormData((prev) => ({
              ...prev,
              shopName: savedForm.shopName || user.user_metadata?.shop_name || user.user_metadata?.name || '',
              phone: savedForm.phone || user.user_metadata?.phone || '',
              whatsapp: savedForm.whatsapp || '',
              category: savedForm.category || '',
              location: savedForm.location || user.user_metadata?.location || '',
            }));
            if (savedStep && savedStep >= 1 && savedStep <= 4) {
              setStep(savedStep);
            }
            return;
          }
        }
      } catch {
        // ignore sessionStorage errors (private browsing etc.)
      }

      // No draft — seed from auth metadata
      setFormData((prev) => ({
        ...prev,
        shopName: user.user_metadata?.shop_name || user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || '',
        location: user.user_metadata?.location || user.user_metadata?.address || '',
      }));
    };
    getUserData();
  }, [supabase.auth, router]);

  // ── Persist draft to sessionStorage on every change ────────────────────────
  const persistDraft = useCallback((data: typeof formData, currentStep: number) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ formData: data, step: currentStep }));
    } catch {
      // ignore
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    persistDraft(updated, step);

    // Clear location error as user types
    if (name === 'location') {
      setLocationError(null);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      const newStep = step + 1;
      setStep(newStep);
      persistDraft(formData, newStep);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      const newStep = step - 1;
      setStep(newStep);
      persistDraft(formData, newStep);
    }
  };

  // ── Step 2 form submit — validate location before advancing ──────────────────
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Google Maps link or address
    const locErr = validateLocation(formData.location);
    if (locErr) {
      setLocationError(locErr);
      return;
    }
    setLocationError(null);
    nextStep();
  };

  // ── Open Google Maps — save draft first so state survives navigation ─────────
  const handleOpenGoogleMaps = () => {
    persistDraft(formData, step);
    // Force open in new tab — safest approach
    window.open('https://maps.google.com', '_blank', 'noopener,noreferrer');
  };

  // ── Final submit ─────────────────────────────────────────────────────────────
  const finishOnboarding = async () => {
    // Final guard: ensure required fields are present
    if (!formData.shopName.trim()) {
      setErrorMsg('Shop name is required. Please go back and fill it in.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Phone number is required. Please go back and fill it in.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await completeOnboardingAction({
        shopName: formData.shopName,
        category: formData.category,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        location: formData.location,
      });

      if (!result.success) {
        setErrorMsg(result.error ?? 'Something went wrong. Please try again.');
        setIsLoading(false);
        return;
      }

      // Clear the saved draft — onboarding complete
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }

      router.push('/vendor/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

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

      <div className="w-full max-w-2xl bg-white rounded-3xl p-8 md:p-12 card-shadow relative overflow-hidden">
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/text-logo.png" alt="MyStreetMenu" className="h-9 w-auto object-contain mx-auto" />
          </div>
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
              Let&apos;s set up your digital menu in just a couple of steps.
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

            <form onSubmit={handleStep2Submit} className="space-y-4 max-w-md mx-auto">
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
                    className={`w-full px-4 py-3 pr-36 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-400 text-gray-900 ${
                      locationError ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  {/* Open Google Maps button — saves draft before leaving */}
                  <button
                    type="button"
                    onClick={handleOpenGoogleMaps}
                    className="absolute right-2 px-2.5 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-orange-200/60 cursor-pointer shrink-0"
                  >
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-orange-500" />
                  </button>
                </div>

                {/* Location validation error */}
                {locationError && (
                  <div className="mt-1.5 flex items-start gap-1.5 text-red-600 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{locationError}</span>
                  </div>
                )}

                {/* Helper hint */}
                {!locationError && (
                  <p className="text-xs text-gray-400 mt-1">
                    {isGoogleMapsUrl(formData.location)
                      ? '✅ Google Maps link detected — we\'ll extract your address automatically.'
                      : 'Click \'Google Maps\' to find your shop, copy the link, then come back and paste it here.'}
                  </p>
                )}
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
              <div className="absolute -top-3.5 right-6 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Recommended
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-extrabold text-gray-900">₹59</span>
                <span className="text-gray-500 ml-1 font-medium">/month</span>
              </div>
              <p className="text-orange-500 font-semibold text-sm mb-6 pb-6 border-b border-gray-100">
                30-Day Free Trial
              </p>

              <p className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                What&apos;s included?
              </p>
              <ul className="space-y-4 mb-8">
                {['Digital QR Menu', 'Unlimited Menu Items', 'Promotions & Offers', 'Basic Analytics'].map((f) => (
                  <li key={f} className="flex items-center">
                    <Check className="h-5 w-5 text-orange-500 mr-3 shrink-0" />
                    <span className="text-gray-700 font-medium text-sm">{f}</span>
                  </li>
                ))}
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
              <div className="absolute inset-0 bg-[#E8F0FE] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="text-5xl">🚀</span>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 text-gray-900">You&apos;re all set!</h2>
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
                  Setting up your shop...
                </>
              ) : (
                'Go to Dashboard'
              )}
            </button>

            {errorMsg && (
              <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm max-w-md mx-auto text-left">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
