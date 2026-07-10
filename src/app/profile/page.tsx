'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { User, Heart, Calendar, ShieldCheck, ArrowLeft, Check, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [bloodGroup, setBloodGroup] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [medicalEligibility, setMedicalEligibility] = useState('Eligible');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-rose-600" />
      </div>
    );
  }

  const fetchProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/profile?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setBloodGroup(data.bloodGroup || '');
        setLastDonationDate(data.lastDonationDate || '');
        setMedicalEligibility(data.medicalEligibility || 'Eligible');
      } else {
        setErrorMsg('Failed to load profile details.');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setErrorMsg('Error connecting to backend database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          bloodGroup,
          lastDonationDate,
          medicalEligibility,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Profile updated successfully!');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrorMsg('Error connecting to backend database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-white px-4 py-16 transition-colors duration-300">
      {/* Background neon blur glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl z-10 transition-all">
        
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-350 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h2 className="text-zinc-900 dark:text-white text-2xl font-bold tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-rose-600" /> Profile Management
          </h2>
          <p className="text-zinc-550 dark:text-zinc-400 text-sm mt-1">Manage your lifeflow personal data and donation logs</p>
        </div>

        {!user ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Sign In Required</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              You must be logged in to view your profile settings.
            </p>
            <Link
              href="/auth/signin"
              className="mt-6 inline-flex bg-rose-600 hover:bg-rose-550 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-md shadow-rose-500/10 cursor-pointer text-sm"
            >
              Sign In
            </Link>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-rose-600" />
            <span className="text-sm font-medium text-zinc-500">Loading user profile...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            
            {successMsg && (
              <div className="p-3 text-sm rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" /> {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 text-sm rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
              </div>
            )}

            {/* Email Address (Disabled) */}
            <div className="space-y-1 text-left">
              <label className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider block">Registered Email</label>
              <input
                disabled
                type="email"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-150 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 text-sm outline-none cursor-not-allowed"
                value={user?.email || ''}
              />
            </div>

            {/* Blood Group Select */}
            <div className="space-y-1 text-left">
              <label className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider block">Your Blood Group</label>
              <div className="relative">
                <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
                <select
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all cursor-pointer appearance-none"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                >
                  <option value="" className="text-zinc-900 dark:bg-zinc-900">Select blood type</option>
                  <option value="A+" className="text-zinc-900 dark:bg-zinc-900">A+</option>
                  <option value="A-" className="text-zinc-900 dark:bg-zinc-900">A-</option>
                  <option value="B+" className="text-zinc-900 dark:bg-zinc-900">B+</option>
                  <option value="B-" className="text-zinc-900 dark:bg-zinc-900">B-</option>
                  <option value="O+" className="text-zinc-900 dark:bg-zinc-950">O+</option>
                  <option value="O-" className="text-zinc-900 dark:bg-zinc-950">O-</option>
                  <option value="AB+" className="text-zinc-900 dark:bg-zinc-900">AB+</option>
                  <option value="AB-" className="text-zinc-900 dark:bg-zinc-900">AB-</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Last Donation Date */}
            <div className="space-y-1 text-left">
              <label className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider block">Last Donation Date</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-505 transition-all"
                  value={lastDonationDate}
                  onChange={(e) => setLastDonationDate(e.target.value)}
                />
              </div>
            </div>

            {/* Medical Eligibility Status */}
            <div className="space-y-1 text-left">
              <label className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider block">Medical Eligibility Status</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
                <select
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-505 transition-all cursor-pointer appearance-none"
                  value={medicalEligibility}
                  onChange={(e) => setMedicalEligibility(e.target.value)}
                >
                  <option value="Eligible" className="text-zinc-900 dark:bg-zinc-900">Eligible (Ready to donate)</option>
                  <option value="Ineligible" className="text-zinc-900 dark:bg-zinc-900">Ineligible</option>
                  <option value="Pending Review" className="text-zinc-900 dark:bg-zinc-900">Pending Review</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2500/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl py-3.5 mt-4 transition-all duration-200 shadow-lg shadow-rose-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-white" />
              ) : (
                'Save Profile Updates'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
