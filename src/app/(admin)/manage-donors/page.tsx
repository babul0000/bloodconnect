'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { API_URL } from '@/lib/api-config';
import { 
  Heart, Trash2, ShieldAlert, ArrowLeft, RefreshCw, User, MapPin, Check, 
  Ban, Power, Search, Filter, AlertCircle, CheckCircle2, Phone, Mail, Award, ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell 
} from 'recharts';

import { deleteDonor as deleteDonorApi } from '@/lib/post/donors';

interface DonorRecord {
  _id: string;
  name: string;
  bloodType: string;
  location: string;
  email: string;
  contactNumber: string;
  status: string; // 'Available' | 'Unavailable'
  verified: boolean;
  active: boolean;
  createdAt?: string;
}

export default function ManageDonorsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user as any;

  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<DonorRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Search & Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('');
  const [filterVerification, setFilterVerification] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('');

  const fetchDonors = async () => {
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_URL}/api/donors`);
      if (!res.ok) throw new Error('Failed to fetch donors database');
      const data: DonorRecord[] = await res.json();
      setDonors(data);
      setFilteredDonors(data);
    } catch (err) {
      console.error('Error fetching donors:', err);
      setError('Failed to fetch donors list from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'creator')) {
      fetchDonors();
    }
  }, [user]);

  // Filtering effect
  useEffect(() => {
    let results = donors;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        d =>
          d.name.toLowerCase().includes(term) ||
          d.email.toLowerCase().includes(term) ||
          d.location.toLowerCase().includes(term)
      );
    }

    if (filterBloodType) {
      results = results.filter(d => d.bloodType.toLowerCase() === filterBloodType.toLowerCase());
    }

    if (filterVerification) {
      const wantVerified = filterVerification === 'verified';
      results = results.filter(d => d.verified === wantVerified);
    }

    if (filterAvailability) {
      results = results.filter(d => d.status.toLowerCase() === filterAvailability.toLowerCase());
    }

    setFilteredDonors(results);
  }, [searchTerm, filterBloodType, filterVerification, filterAvailability, donors]);

  // Action Handlers
  const handleVerifyToggle = async (donorId: string, currentVerified: boolean) => {
    setActionLoading(donorId);
    setError('');
    setSuccessMsg('');
    const newVerified = !currentVerified;
    try {
      const res = await fetch(`${API_URL}/api/donors/${donorId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: newVerified }),
      });
      if (!res.ok) throw new Error('Failed to update verification status');
      
      setSuccessMsg(`Donor verification status ${newVerified ? 'enabled' : 'disabled'}!`);
      setDonors(prev => prev.map(d => d._id === donorId ? { ...d, verified: newVerified } : d));
    } catch (err) {
      console.error(err);
      setError('Failed to verify donor.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAvailability = async (donorId: string, currentStatus: string) => {
    setActionLoading(donorId);
    setError('');
    setSuccessMsg('');
    const newStatus = currentStatus === 'Available' ? 'Unavailable' : 'Available';
    try {
      const res = await fetch(`${API_URL}/api/donors/${donorId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to toggle donor status');

      setSuccessMsg(`Donor marked as ${newStatus}!`);
      setDonors(prev => prev.map(d => d._id === donorId ? { ...d, status: newStatus } : d));
    } catch (err) {
      console.error(err);
      setError('Failed to update availability.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (donorId: string, currentActive: boolean) => {
    setActionLoading(donorId);
    setError('');
    setSuccessMsg('');
    const newActive = !currentActive;
    try {
      const res = await fetch(`${API_URL}/api/donors/${donorId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive }),
      });
      if (!res.ok) throw new Error('Failed to change donor active status');

      setSuccessMsg(`Donor registration ${newActive ? 'activated' : 'deactivated'}!`);
      setDonors(prev => prev.map(d => d._id === donorId ? { ...d, active: newActive } : d));
    } catch (err) {
      console.error(err);
      setError('Failed to deactivate/block donor.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDonor = async (donorId: string) => {
    if (!confirm('Are you sure you want to permanently delete this donor registration?')) {
      return;
    }
    setActionLoading(donorId);
    setError('');
    setSuccessMsg('');
    try {
      await deleteDonorApi(donorId);
      setSuccessMsg('Donor registration deleted successfully.');
      setDonors(prev => prev.filter(d => d._id !== donorId));
    } catch (err) {
      console.error(err);
      setError('Failed to delete donor registration.');
    } finally {
      setActionLoading(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterBloodType('');
    setFilterVerification('');
    setFilterAvailability('');
  };

  // Compute Mini-Dashboard stats
  const totalCount = donors.length;
  const verifiedCount = donors.filter(d => d.verified).length;
  const availableTodayCount = donors.filter(d => d.status === 'Available' && d.active !== false).length;

  // Prepare Chart Data (Donors per blood type)
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const chartData = bloodGroups.map(group => ({
    name: group,
    donors: donors.filter(d => d.bloodType === group).length
  }));

  const COLORS = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3', '#ffe4e6', '#fff1f2', '#ff5a5f'];

  // Auth/Role Protection Guard
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-white px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-rose-600" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'creator')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-white px-4 py-16">
        <div className="max-w-md w-full text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-xl">
          <ShieldAlert className="w-16 h-16 mx-auto text-rose-500 mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Access Restricted</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            You must login as an administrator or creator to view and manage registered blood donors.
          </p>
          <Link
            href="/auth/signin"
            className="mt-6 inline-flex bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3 rounded-2xl transition-all duration-250 shadow-md shadow-rose-500/10 cursor-pointer text-sm"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-955 text-zinc-905 dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-455 dark:hover:text-rose-350 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                <ShieldCheck className="w-8 h-8 text-rose-600" /> Manage Donors Directory
              </h1>
              <p className="text-sm text-zinc-505 dark:text-zinc-400 mt-1">
                Admin view to verify donor credentials, suspend accounts, and filter registry.
              </p>
            </div>
            <button
              onClick={fetchDonors}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-5 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Registry
            </button>
          </div>
        </div>

        {/* Messaging Feedback */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
          </div>
        )}

        {/* Mini-Dashboard Statistics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Quick Metrics */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase font-extrabold text-zinc-400 tracking-wider">Total Donors</span>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-2">{totalCount}</h3>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase font-extrabold text-zinc-400 tracking-wider">Verified Donors</span>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{verifiedCount}</h3>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] uppercase font-extrabold text-zinc-400 tracking-wider">Available Today</span>
              <h3 className="text-3xl font-black text-rose-600 dark:text-rose-455 mt-2">{availableTodayCount}</h3>
            </div>
          </div>

          {/* Mini-Chart: Donors Distribution */}
          <div className="lg:col-span-6 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-350 uppercase tracking-wider mb-4">Donors Count by Blood Type</h3>
            <div className="h-28 w-full text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '10px' }} 
                    cursor={{ fill: 'rgba(244, 63, 94, 0.05)' }}
                  />
                  <Bar dataKey="donors" radius={[2, 2, 0, 0]} barSize={18}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Search & Filtering Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-rose-600 uppercase tracking-wider">
            <Filter className="w-4 h-4" /> Filter Donors Registry
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            {/* Search Input */}
            <div className="lg:col-span-4 space-y-1">
              <label className="text-zinc-450 dark:text-zinc-400 text-xs font-bold">Search Name or Email</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="e.g. Rahim or rahim@example.com"
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-sm outline-none focus:border-rose-500 transition-all text-zinc-850 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Blood Type Filter */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-zinc-450 dark:text-zinc-400 text-xs font-bold">Blood Group</label>
              <select
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-sm outline-none focus:border-rose-500 transition-all text-zinc-850 dark:text-white cursor-pointer"
                value={filterBloodType}
                onChange={(e) => setFilterBloodType(e.target.value)}
              >
                <option value="" className="text-zinc-900 dark:bg-zinc-900">All Groups</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group} className="text-zinc-900 dark:bg-zinc-900">{group}</option>
                ))}
              </select>
            </div>

            {/* Verification status Filter */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-zinc-455 dark:text-zinc-400 text-xs font-bold">Verification</label>
              <select
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-sm outline-none focus:border-rose-500 transition-all text-zinc-850 dark:text-white cursor-pointer"
                value={filterVerification}
                onChange={(e) => setFilterVerification(e.target.value)}
              >
                <option value="" className="text-zinc-900 dark:bg-zinc-900">All Statuses</option>
                <option value="verified" className="text-zinc-900 dark:bg-zinc-900">Verified Only</option>
                <option value="unverified" className="text-zinc-900 dark:bg-zinc-900">Unverified Only</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-zinc-450 dark:text-zinc-400 text-xs font-bold">Availability</label>
              <select
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-sm outline-none focus:border-rose-500 transition-all text-zinc-850 dark:text-white cursor-pointer"
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
              >
                <option value="" className="text-zinc-900 dark:bg-zinc-900">All Available</option>
                <option value="Available" className="text-zinc-900 dark:bg-zinc-900">Available</option>
                <option value="Unavailable" className="text-zinc-900 dark:bg-zinc-900">Unavailable</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="lg:col-span-2">
              <button
                onClick={resetFilters}
                className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Donors Grid Listings */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-rose-600" />
            <span className="text-sm font-medium text-zinc-500">Syncing donor database...</span>
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8">
            <User className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-650" />
            <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">No matching donors found</h3>
            <p className="mt-2 text-sm text-zinc-505 dark:text-zinc-400">
              Try adjusting your search keywords or blood group dropdown filters.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-550 dark:text-zinc-400 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-800/50">
                  <tr>
                    <th className="px-6 py-4">Donor Profile</th>
                    <th className="px-6 py-4">Blood Group</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Status & Verify</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {filteredDonors.map((donor) => (
                    <tr key={donor._id} className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors ${!donor.active ? 'opacity-60 bg-zinc-50/30 dark:bg-zinc-900/20' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                            {donor.name ? donor.name.charAt(0).toUpperCase() : 'D'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                              {donor.name}
                              {donor.verified && (
                                <span className="inline-flex h-4 w-4 bg-emerald-500/10 text-emerald-500 rounded-full items-center justify-center" title="Verified Credibility">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-zinc-450 dark:text-zinc-500">{donor.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 text-xs font-black rounded-lg bg-rose-500/10 text-rose-650 dark:text-rose-455">
                          {donor.bloodType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-700 dark:text-zinc-300">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-zinc-400" /> {donor.location}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-700 dark:text-zinc-300">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200"><Phone className="w-3 h-3 text-zinc-400" /> {donor.contactNumber}</span>
                          <span className="flex items-center gap-1 text-[10px] text-zinc-450"><Mail className="w-3 h-3 text-zinc-400" /> {donor.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          {/* Eligibility Badge */}
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                            donor.status === 'Available' && donor.active !== false ? 'text-emerald-500' : 'text-rose-500'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${donor.status === 'Available' && donor.active !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {donor.status === 'Available' && donor.active !== false ? 'Available Today' : 'Unavailable'}
                          </span>
                          {/* Verification Badge */}
                          <span className={`text-[9px] font-bold tracking-wider uppercase ${
                            donor.verified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {donor.verified ? 'Verified Donor' : 'Unverified Details'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Verify/Approve Toggle Button */}
                          <button
                            disabled={actionLoading === donor._id}
                            onClick={() => handleVerifyToggle(donor._id, donor.verified)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors duration-200 ${
                              donor.verified
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/40 hover:bg-emerald-100'
                                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                            }`}
                            title={donor.verified ? 'Revoke Verification' : 'Verify & Approve Donor Details'}
                          >
                            Verify
                          </button>

                          {/* Block/Deactivate Account Button */}
                          <button
                            disabled={actionLoading === donor._id}
                            onClick={() => handleToggleActive(donor._id, donor.active !== false)}
                            className={`p-2 rounded-lg border-none cursor-pointer transition-colors duration-200 ${
                              donor.active !== false
                                ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white'
                                : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white'
                            }`}
                            title={donor.active !== false ? 'Block/Deactivate Donor' : 'Activate/Unblock Donor'}
                          >
                            {actionLoading === donor._id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-650 border-t-transparent" />
                            ) : donor.active !== false ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </button>

                          {/* Toggle Availability status */}
                          <button
                            disabled={actionLoading === donor._id}
                            onClick={() => handleToggleAvailability(donor._id, donor.status)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-755 dark:text-zinc-200 border border-transparent cursor-pointer"
                            title="Toggle available status"
                          >
                            Toggle Status
                          </button>

                          {/* Delete Donor Registration */}
                          <button
                            disabled={actionLoading === donor._id}
                            onClick={() => handleDeleteDonor(donor._id)}
                            className="p-2 bg-zinc-100 hover:bg-rose-500 dark:bg-zinc-800 dark:hover:bg-rose-600 text-zinc-500 hover:text-white dark:text-zinc-400 rounded-lg transition-colors border-none cursor-pointer"
                            title="Permanently Delete Donor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
