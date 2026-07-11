'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, User, MapPin, ArrowLeft } from 'lucide-react';
import { registerDonor } from '@/lib/post/donors';

export default function AddDonorPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [bloodType, setBloodType] = useState('A+');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    if (!name || !location) {
      setError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      await registerDonor({ name, bloodType, location });
      setMessage('Successfully registered as a donor!');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      console.error('Error adding donor:', err);
      setError(err.message || 'Something went wrong. Please check your backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white px-4 py-16 transition-colors duration-300">
      {/* Background neon blur glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl z-10 transition-all">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h2 className="text-zinc-900 dark:text-white text-2xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600" /> Become a Donor
          </h2>
          <p className="text-zinc-505 dark:text-zinc-400 text-sm mt-1">Register as a life-saving blood donor volunteer</p>
        </div>

        {message && (
          <div className="mb-4 p-3.5 text-sm rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-medium font-bold">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 text-sm rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 font-medium font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div className="space-y-1.5 text-left">
            <label className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
              <input
                required
                type="text"
                placeholder="e.g. John Doe"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-all placeholder-zinc-400 dark:placeholder-zinc-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Blood Type Dropdown */}
          <div className="space-y-1.5 text-left">
            <label className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Blood Group</label>
            <div className="relative">
              <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
              <select
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-905 dark:text-white text-sm outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-all cursor-pointer appearance-none"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
              >
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

          {/* Location Input */}
          <div className="space-y-1.5 text-left">
            <label className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Location (City, Area)</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
              <input
                required
                type="text"
                placeholder="e.g. Dhaka, Gulshan"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-all placeholder-zinc-400 dark:placeholder-zinc-505"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl py-3.5 mt-4 transition-all duration-200 shadow-lg shadow-rose-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-white" />
            ) : (
              'Submit Registration'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
