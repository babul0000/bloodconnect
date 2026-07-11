'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { User, Heart, Calendar, ShieldCheck, ArrowLeft, Check, AlertCircle, Phone, Sparkles, Activity, ShieldAlert } from 'lucide-react';

import { fetchProfile as fetchProfileLib } from '@/lib/get/profile';
import { updateProfile } from '@/lib/post/profile';

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [lastDonationDate, setLastDonationDate] = useState('');
  const [medicalEligibility, setMedicalEligibility] = useState('Eligible');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchProfileLib(user.email);
      setBloodGroup(data.bloodGroup || '');
      setLastDonationDate(data.lastDonationDate || '');
      setMedicalEligibility(data.medicalEligibility || 'Eligible');
      setName(data.name || user?.name || '');
      setPhone(data.phone || '');
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

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-rose-600" />
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updateProfile({
        email: user.email,
        name,
        phone,
        bloodGroup,
        lastDonationDate,
        medicalEligibility,
      });
      setSuccessMsg('Profile updated successfully!');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (userName: string) => {
    if (!userName) return 'U';
    return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-white transition-colors duration-300 relative py-12 md:py-20 overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-rose-400/5 dark:bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Navigation back */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-455 dark:hover:text-rose-350 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Auth guard card if no user session */}
        {!user ? (
          <div className="max-w-md mx-auto text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-xl">
            <ShieldAlert className="w-16 h-16 mx-auto text-rose-500 mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Access Restricted</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              You must login using email and password to view and update your user profile dashboard.
            </p>
            <Link
              href="/auth/signin"
              className="mt-6 inline-flex bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3 rounded-2xl transition-all duration-200 shadow-md shadow-rose-500/10 cursor-pointer text-sm"
            >
              Go to Sign In
            </Link>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-rose-600" />
            <span className="text-sm font-medium text-zinc-500">Loading user metadata...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Premium Profile Dashboard Display */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Profile Card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700" />

                {/* Avatar Badge */}
                <div className="relative mt-4">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform duration-300 select-none overflow-hidden">
                    {user.image ? (
                      <img src={user.image} alt={name || user.name || 'User'} className="h-full w-full object-cover" />
                    ) : (
                      getInitials(name || user.name || '')
                    )}
                  </div>
                  <span className={`absolute bottom-1 right-1 h-4.5 w-4.5 rounded-full border-3 border-white dark:border-zinc-900 ${
                    medicalEligibility === 'Eligible' ? 'bg-emerald-500' : medicalEligibility === 'Ineligible' ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-zinc-900 dark:text-zinc-50">{name || user.name || 'User'}</h3>
                <div className="mt-1.5 flex items-center justify-center">
                  <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                    user.role === 'admin' 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-455' 
                      : user.role === 'creator'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-455'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}>
                    {user.role || 'user'}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-2">{user.email}</p>

                {/* Info Badges Grid */}
                <div className="mt-8 w-full grid grid-cols-2 gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-3 flex flex-col items-center">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500/10 mb-1" />
                    <span className="text-[10px] font-bold uppercase text-zinc-400">Blood Group</span>
                    <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">
                      {bloodGroup || 'Not Set'}
                    </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-3 flex flex-col items-center">
                    <Calendar className="w-5 h-5 text-rose-500 mb-1" />
                    <span className="text-[10px] font-bold uppercase text-zinc-400">Last Donation</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 truncate max-w-full">
                      {lastDonationDate || 'Never'}
                    </span>
                  </div>
                </div>

                {/* Eligibility Status Detail Banner */}
                <div className="mt-4 w-full">
                  <div className={`rounded-2xl p-3 text-xs font-semibold flex items-center justify-center gap-2 border ${
                    medicalEligibility === 'Eligible' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                      : medicalEligibility === 'Ineligible'
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    <Activity className="w-4 h-4 shrink-0" />
                    <span>Eligibility: {medicalEligibility === 'Eligible' ? 'Eligible to Donate' : medicalEligibility === 'Ineligible' ? 'Ineligible/Deferred' : 'Pending Review'}</span>
                  </div>
                </div>
              </div>

              {/* Motivational Tip Card */}
              <div className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-zinc-900 dark:to-zinc-950 border border-rose-100/50 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <Sparkles className="absolute right-4 top-4 text-rose-500/30 w-12 h-12" />
                <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Saving Lives Fact
                </h4>
                <p className="text-xs text-zinc-650 dark:text-zinc-450 mt-3 leading-relaxed">
                  Every 2 seconds, someone in the world needs blood. Your single donation of 1 unit of blood can save up to 3 individual patient lives! Thank you for keeping your profile updated.
                </p>
              </div>
            </div>

            {/* Right Column: Editable Profile Settings Form */}
            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="border-b border-zinc-100 dark:border-zinc-850 pb-5 mb-6">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-rose-600" /> Account & Profile Settings
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Keep your personal contact coordinates and donation record details up to date.
                </p>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                
                {successMsg && (
                  <div className="p-3.5 text-sm rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-455 font-bold flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" /> {successMsg}
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3.5 text-sm rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-455 font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Name Input */}
                  <div className="space-y-1 text-left">
                    <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email (Readonly) */}
                  <div className="space-y-1 text-left">
                    <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Registered Email (Immutable)</label>
                    <input
                      disabled
                      type="email"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-zinc-100 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-450 text-sm outline-none cursor-not-allowed"
                      value={user.email}
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="space-y-1 text-left">
                    <label className="text-zinc-555 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Contact Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-405 dark:text-zinc-500" />
                      <input
                        type="tel"
                        placeholder="e.g. 01953869054"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Blood Group Dropdown */}
                  <div className="space-y-1 text-left">
                    <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Blood Group</label>
                    <div className="relative">
                      <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      <select
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all cursor-pointer appearance-none animate-fadeIn"
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                      >
                        <option value="" className="text-zinc-900 dark:bg-zinc-900">Select blood type</option>
                        <option value="A+" className="text-zinc-900 dark:bg-zinc-900">A+</option>
                        <option value="A-" className="text-zinc-900 dark:bg-zinc-900">A-</option>
                        <option value="B+" className="text-zinc-900 dark:bg-zinc-900">B+</option>
                        <option value="B-" className="text-zinc-900 dark:bg-zinc-900">B-</option>
                        <option value="O+" className="text-zinc-900 dark:bg-zinc-900">O+</option>
                        <option value="O-" className="text-zinc-900 dark:bg-zinc-900">O-</option>
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
                    <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Last Donation Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all"
                        value={lastDonationDate}
                        onChange={(e) => setLastDonationDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Medical Eligibility Dropdown */}
                  <div className="space-y-1 text-left">
                    <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Medical Eligibility Status</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-405 dark:text-zinc-500" />
                      <select
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all cursor-pointer appearance-none"
                        value={medicalEligibility}
                        onChange={(e) => setMedicalEligibility(e.target.value)}
                      >
                        <option value="Eligible" className="text-zinc-900 dark:bg-zinc-900">Eligible (Ready to Donate)</option>
                        <option value="Ineligible" className="text-zinc-900 dark:bg-zinc-900">Ineligible / Deferred</option>
                        <option value="Pending Review" className="text-zinc-900 dark:bg-zinc-900">Pending Medical Review</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl py-3.5 transition-all duration-200 shadow-lg shadow-rose-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-white" />
                    ) : (
                      'Save Profile Updates'
                    )}
                  </button>
                </div>

              </form>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
