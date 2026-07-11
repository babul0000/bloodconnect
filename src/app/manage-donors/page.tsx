'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ShieldAlert, ArrowLeft, RefreshCw, User, MapPin } from 'lucide-react';

import { Donor } from '@/lib/types';
import { fetchAllDonors } from '@/lib/get/donors';
import { deleteDonor } from '@/lib/post/donors';

export default function ManageDonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDonors = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchAllDonors();
      setDonors(data);
    } catch (err) {
      console.error('Error fetching donors:', err);
      setError('Backend connection error. Please verify the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this donor registration?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteDonor(id);
      // Remove donor from local state
      setDonors(donors.filter(donor => donor._id !== id));
    } catch (err) {
      console.error('Error deleting donor:', err);
      alert('Error connecting to backend server.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-955 text-zinc-905 dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <ShieldAlert className="w-8 h-8 text-rose-600" /> Manage Donor Database
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Admin dashboard to monitor and manage registered blood donors.
              </p>
            </div>
            <button
              onClick={fetchDonors}
              className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Database
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-rose-600" />
            <span className="text-sm font-medium text-zinc-500">Retrieving records...</span>
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-sm">
            <User className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-600" />
            <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">No registered donors</h3>
            <p className="mt-2 text-sm text-zinc-505 dark:text-zinc-400">
              There are no donors currently registered in the database.
            </p>
            <Link
              href="/add-donor"
              className="mt-6 inline-flex bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-md shadow-rose-500/10"
            >
              Add First Donor
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 text-xs font-bold uppercase text-zinc-400 dark:text-zinc-500">
                    <th className="px-6 py-4">Blood Group</th>
                    <th className="px-6 py-4">Donor Name</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                  {donors.map((donor) => (
                    <tr key={donor._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white font-extrabold text-sm shadow-sm shadow-rose-500/10">
                          {donor.bloodType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                        {donor.name}
                      </td>
                      <td className="px-6 py-4 text-zinc-550 dark:text-zinc-400 flex items-center gap-1.5 py-6">
                        <MapPin className="w-4 h-4 text-zinc-400" /> {donor.location}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(donor._id)}
                          disabled={deletingId === donor._id}
                          className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-955/20 dark:hover:bg-rose-955/40 text-rose-600 dark:text-rose-400 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border border-rose-200/30 dark:border-rose-900/20 cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === donor._id ? (
                            <span className="h-3 w-3 animate-spin rounded-full border border-rose-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
