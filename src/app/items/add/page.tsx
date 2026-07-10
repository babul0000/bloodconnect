'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { z } from 'zod';
import { Heart, User, MapPin, ArrowLeft, Landmark, AlertCircle, Phone } from 'lucide-react';

// Define Zod validation schema
const requestSchema = z.object({
  patientName: z.string().min(2, 'Patient name must be at least 2 characters'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
  hospitalName: z.string().min(3, 'Hospital name must be at least 3 characters'),
  location: z.string().min(3, 'Location details must be at least 3 characters'),
  urgencyLevel: z.enum(['Urgent', 'Normal']),
  contactNumber: z
    .string()
    .min(10, 'Contact number must be at least 10 digits')
    .regex(/^[0-9+\-\s]+$/, 'Invalid contact number format'),
});

type FormValues = z.infer<typeof requestSchema>;

export default function AddRequestPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [hospitalName, setHospitalName] = useState('');
  const [location, setLocation] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<'Urgent' | 'Normal'>('Normal');
  const [contactNumber, setContactNumber] = useState('');

  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [apiError, setApiError] = useState('');

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-rose-600" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (!user) {
      setApiError('You must be logged in to submit a blood request.');
      setIsSubmitting(false);
      return;
    }

    const formData: FormValues = {
      patientName,
      bloodGroup: bloodGroup as any,
      hospitalName,
      location,
      urgencyLevel,
      contactNumber,
    };

    // Validate with Zod
    const validation = requestSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof FormValues] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          email: user.email,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Blood request posted successfully!');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setApiError(data.error || 'Failed to post request. Please try again.');
      }
    } catch (err) {
      console.error('Error posting request:', err);
      setApiError('Backend server connection failed. Please verify the server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white px-4 py-16 transition-colors duration-300">
      {/* Background neon blur glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl z-10 transition-all">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h2 className="text-zinc-900 dark:text-white text-2xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-600 fill-rose-600 animate-pulse" /> Request Blood
          </h2>
          <p className="text-zinc-550 dark:text-zinc-400 text-sm mt-1">Post a new request for emergency blood donors</p>
        </div>

        {successMsg && (
          <div className="mb-4 p-3.5 text-sm rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold">
            {successMsg}
          </div>
        )}

        {apiError && (
          <div className="mb-4 p-3.5 text-sm rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 font-bold">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Name */}
          <div className="space-y-1 text-left">
            <label className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Patient Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
              <input
                required
                type="text"
                placeholder="e.g. Jane Doe"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all ${
                  errors.patientName ? 'border-rose-500 focus:border-rose-500' : 'border-zinc-200 dark:border-zinc-800'
                }`}
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
            </div>
            {errors.patientName && <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">{errors.patientName}</p>}
          </div>

          {/* Blood Group */}
          <div className="space-y-1 text-left">
            <label className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Required Blood Group</label>
            <div className="relative">
              <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
              <select
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all cursor-pointer appearance-none"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
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

          {/* Hospital Name */}
          <div className="space-y-1 text-left">
            <label className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Hospital Name</label>
            <div className="relative">
              <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
              <input
                required
                type="text"
                placeholder="e.g. City General Hospital"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all ${
                  errors.hospitalName ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'
                }`}
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
              />
            </div>
            {errors.hospitalName && <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">{errors.hospitalName}</p>}
          </div>

          {/* Location */}
          <div className="space-y-1 text-left">
            <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Hospital Location (City, Area)</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
              <input
                required
                type="text"
                placeholder="e.g. Dhaka, Dhanmondi"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all ${
                  errors.location ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'
                }`}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            {errors.location && <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">{errors.location}</p>}
          </div>

          {/* Contact Number */}
          <div className="space-y-1 text-left">
            <label className="text-zinc-555 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Contact Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
              <input
                required
                type="tel"
                placeholder="e.g. +1234567890"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-505 transition-all ${
                  errors.contactNumber ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'
                }`}
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
              />
            </div>
            {errors.contactNumber && <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">{errors.contactNumber}</p>}
          </div>

          {/* Urgency Level Toggle/Selector */}
          <div className="space-y-2 text-left pt-1">
            <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Urgency Level</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setUrgencyLevel('Normal')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                  urgencyLevel === 'Normal'
                    ? 'bg-zinc-100 border-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white'
                    : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-405 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setUrgencyLevel('Urgent')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                  urgencyLevel === 'Urgent'
                    ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
                    : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-405 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                }`}
              >
                Urgent 🚨
              </button>
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
              'Submit Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
