'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, authClient } from '@/lib/auth-client';
import { API_URL } from '@/lib/api-config';
import { 
  ShieldAlert, Activity, Users, Award, Heart, Trash2, 
  Settings, RefreshCw, Power, Ban, TrendingUp, UserCheck, 
  MapPin, Mail, Calendar, AlertCircle, FileText, CheckCircle2, ChevronRight, X
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Legend, LineChart, Line, CartesianGrid 
} from 'recharts';

interface UserRecord {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  active?: boolean;
  createdAt?: string;
  image?: string;
}

interface BloodRequestRecord {
  _id: string;
  patientName: string;
  bloodGroup: string;
  hospitalName: string;
  location: string;
  urgencyLevel: string;
  contactNumber: string;
  email: string;
  createdAt?: string;
}

interface AnalyticsData {
  summary: {
    totalRequests: number;
    totalDonors: number;
    totalUsers: number;
    successfulDonations: number;
  };
  requestsByGroup: Array<{ name: string; count: number }>;
  monthlyTrend: Array<{ month: string; donors: number; requests: number }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;

  // Tabs: 'analytics', 'moderation', 'users'
  const [activeTab, setActiveTab] = useState<'analytics' | 'moderation' | 'users'>('analytics');
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [requestsList, setRequestsList] = useState<BloodRequestRecord[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Confirmation Modal State
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [userToPromote, setUserToPromote] = useState<UserRecord | null>(null);

  // Authenticated fetch wrapper
  const adminFetch = async (url: string, options: RequestInit = {}) => {
    let authHeader = {};
    try {
      const tokenRes = await authClient.token();
      if (tokenRes?.data?.token) {
        authHeader = { 'Authorization': `Bearer ${tokenRes.data.token}` };
      }
    } catch (e) {
      console.error('Failed to retrieve authentication token:', e);
    }
    
    // Fallback: search localStorage
    if (Object.keys(authHeader).length === 0 && typeof window !== 'undefined') {
      const localToken = localStorage.getItem('better-auth.session-token') || 
                         localStorage.getItem('better-auth.token');
      if (localToken) {
        authHeader = { 'Authorization': `Bearer ${localToken}` };
      }
    }

    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers,
      }
    });
  };

  const fetchAnalytics = async () => {
    try {
      const res = await adminFetch(`${API_URL}/api/admin/analytics`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setErrorMsg('Error loading dashboard analytics.');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminFetch(`${API_URL}/api/admin/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsersList(data);
    } catch (err) {
      console.error('Users fetch error:', err);
      setErrorMsg('Error loading registered users database.');
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/requests`);
      if (!res.ok) throw new Error('Failed to fetch requests');
      const data = await res.json();
      setRequestsList(data);
    } catch (err) {
      console.error('Requests fetch error:', err);
      setErrorMsg('Error loading active blood requests.');
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    await Promise.all([fetchAnalytics(), fetchUsers(), fetchRequests()]);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAllData();
    }
  }, [user]);

  // Actions
  const handleUpdateRole = async (targetUserId: string, newRole: string) => {
    setActionLoading(targetUserId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await adminFetch(`${API_URL}/api/admin/users/${targetUserId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user role');
      
      setSuccessMsg('User role updated successfully!');
      setUsersList(prev => prev.map(u => (u._id === targetUserId || u.id === targetUserId) ? { ...u, role: newRole } : u));
      fetchAnalytics(); // reload stats
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to update user role.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (targetUserId: string, currentStatus: boolean) => {
    setActionLoading(targetUserId);
    setErrorMsg('');
    setSuccessMsg('');
    const newStatus = !currentStatus;
    try {
      const res = await adminFetch(`${API_URL}/api/admin/users/${targetUserId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ active: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle user status');
      
      setSuccessMsg(`User account ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      setUsersList(prev => prev.map(u => (u._id === targetUserId || u.id === targetUserId) ? { ...u, active: newStatus } : u));
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to change user status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to moderate and permanently delete this blood request?')) {
      return;
    }
    setActionLoading(requestId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_URL}/api/requests/${requestId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete request');

      setSuccessMsg('Request deleted successfully (spam moderated).');
      setRequestsList(prev => prev.filter(r => r._id !== requestId));
      fetchAnalytics(); // reload stats
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to moderate request.');
    } finally {
      setActionLoading(null);
    }
  };

  // Promote User to Admin Handler
  const openPromoteModal = (usr: UserRecord) => {
    setUserToPromote(usr);
    setShowPromoteModal(true);
  };

  const confirmMakeAdmin = async () => {
    if (!userToPromote) return;
    const targetUserId = userToPromote._id || userToPromote.id || '';
    setActionLoading(targetUserId);
    setErrorMsg('');
    setSuccessMsg('');
    setShowPromoteModal(false);
    
    try {
      const res = await adminFetch(`${API_URL}/api/users/make-admin/${targetUserId}`, {
        method: 'PATCH'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to promote user to Admin');
      
      setSuccessMsg(`Successfully promoted ${userToPromote.name} to Admin!`);
      // Update local state (query invalidation simulation)
      setUsersList(prev => prev.map(u => (u._id === targetUserId || u.id === targetUserId) ? { ...u, role: 'admin' } : u));
      fetchAnalytics();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to promote user to Admin.');
    } finally {
      setActionLoading(null);
      setUserToPromote(null);
    }
  };

  // Auth Protection Guard
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-white px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-rose-600" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-white px-4 py-16">
        <div className="max-w-md w-full text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-xl">
          <ShieldAlert className="w-16 h-16 mx-auto text-rose-500 mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Admin Access Restricted</h3>
          <p className="text-sm text-zinc-505 dark:text-zinc-400 mt-2">
            You must login with administrator privileges to access the global operations control center.
          </p>
          <Link
            href="/auth/signin"
            className="mt-6 inline-flex bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3 rounded-2xl transition-all duration-200 shadow-md shadow-rose-500/10 cursor-pointer text-sm"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full relative">
        
        {/* Header Banner */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <Settings className="w-8 h-8 text-rose-600" /> Global Admin Console
            </h1>
            <p className="text-sm text-zinc-505 dark:text-zinc-400 mt-1.5">
              Monitor active platform analytics, moderate spam requests, and administrate system credentials.
            </p>
          </div>
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-5 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Console
          </button>
        </div>

        {/* Success/Error Banners */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-sm flex items-center justify-between gap-2 transition-all">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
            </span>
            <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-rose-500/10 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-between gap-2 transition-all">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
            </span>
            <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-500/10 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Statistics Cards Row */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                <Heart className="w-6 h-6 fill-rose-600/10" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-zinc-400 tracking-wider">Total Requests</span>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5">{analytics.summary.totalRequests}</h3>
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-zinc-400 tracking-wider">Fulfilled Donations</span>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5">{analytics.summary.successfulDonations}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-zinc-400 tracking-wider">Active Donors</span>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5">{analytics.summary.totalDonors}</h3>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden group">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-zinc-400 tracking-wider">Registered Users</span>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5">{analytics.summary.totalUsers}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Tab Selection Headers */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-8 gap-4 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> System Analytics
          </button>
          
          <button
            onClick={() => setActiveTab('moderation')}
            className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <FileText className="w-4 h-4" /> Content Moderation ({requestsList.length})
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <Users className="w-4 h-4" /> User Management ({usersList.length})
          </button>
        </div>

        {/* Main Tab Views */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-rose-600" />
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Syncing console data...</span>
          </div>
        ) : (
          <div>
            {/* 1. Analytics tab */}
            {activeTab === 'analytics' && analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1: Requests by Blood Group */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" /> Blood Requests Demand by Group
                  </h3>
                  <div className="h-80 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.requestsByGroup} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#fff' }} 
                          cursor={{ fill: 'rgba(244, 63, 94, 0.05)' }}
                        />
                        <Bar dataKey="count" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={25} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Monthly Engagement Trend */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" /> Donor Registration & Request Trends (6 Mo)
                  </h3>
                  <div className="h-80 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.monthlyTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200, 200, 200, 0.08)" />
                        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="donors" name="Total Donors" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="requests" name="Blood Requests" stroke="#e11d48" strokeWidth={2.5} activeDot={{ r: 6 }} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Platform Moderation tab */}
            {activeTab === 'moderation' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">All Active Requests</h3>
                  <p className="text-xs text-zinc-450 mt-1">Review active posts and delete outdated or false/spam files.</p>
                </div>
                
                {requestsList.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-650 mx-auto" />
                    <h4 className="font-bold text-zinc-850 dark:text-zinc-200 mt-3">No active request items</h4>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-550 dark:text-zinc-400 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-800/50">
                        <tr>
                          <th className="px-6 py-4">Patient Name</th>
                          <th className="px-6 py-4">Blood Group</th>
                          <th className="px-6 py-4">Hospital & Location</th>
                          <th className="px-6 py-4">Contact coordinates</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                        {requestsList.map((req) => (
                          <tr key={req._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-zinc-900 dark:text-zinc-100">{req.patientName}</td>
                            <td className="px-6 py-4">
                              <span className="inline-block px-2.5 py-1 text-xs font-black rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-455">
                                {req.bloodGroup}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col text-xs max-w-xs truncate">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{req.hospitalName}</span>
                                <span className="text-zinc-450 dark:text-zinc-500 flex items-center gap-0.5 mt-0.5"><MapPin className="w-3 h-3" /> {req.location}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col text-xs">
                                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{req.contactNumber}</span>
                                <span className="text-zinc-450 dark:text-zinc-500 flex items-center gap-0.5 mt-0.5"><Mail className="w-3 h-3" /> {req.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Link 
                                  href={`/requests/${req._id}`}
                                  className="px-3 py-1.5 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                                >
                                  View Page
                                </Link>
                                <button
                                  disabled={actionLoading === req._id}
                                  onClick={() => handleDeleteRequest(req._id)}
                                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 border-none"
                                  title="Delete spam/outdated request"
                                >
                                  {actionLoading === req._id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. User accounts management tab */}
            {activeTab === 'users' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl shadow-sm overflow-hidden animate-fadeIn">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                  <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-100">Registered Accounts ({usersList.length})</h3>
                  <p className="text-xs text-zinc-450 mt-1">Upgrade user levels, suspend accounts, and promote administrative credentials.</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-550 dark:text-zinc-400 font-semibold uppercase text-[10px] tracking-wider border-b border-zinc-100 dark:border-zinc-800/50">
                      <tr>
                        <th className="px-6 py-4">User profile</th>
                        <th className="px-6 py-4">Register date</th>
                        <th className="px-6 py-4">System role</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Account controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                      {usersList.map((usr) => {
                        const targetId = usr._id || usr.id || '';
                        const isSelf = user.id === targetId || user._id === targetId;
                        return (
                          <tr key={targetId} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-md overflow-hidden">
                                  {usr.image ? (
                                    <img src={usr.image} alt={usr.name} className="h-full w-full object-cover" />
                                  ) : (
                                    usr.name ? usr.name.charAt(0).toUpperCase() : 'U'
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1">
                                    {usr.name || 'Anonymous'}
                                    {isSelf && <span className="text-[9px] bg-rose-600/10 text-rose-600 px-1.5 py-0.5 rounded font-black uppercase">You</span>}
                                  </span>
                                  <span className="text-xs text-zinc-455 dark:text-zinc-500">{usr.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                              {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-lg border ${
                                usr.role === 'admin' 
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-455' 
                                  : usr.role === 'creator'
                                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-455'
                                  : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                              }`}>
                                {usr.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                                usr.active !== false ? 'text-emerald-500' : 'text-rose-500'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${usr.active !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                {usr.active !== false ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {/* Role update selection */}
                                <select
                                  disabled={actionLoading === targetId || isSelf}
                                  value={usr.role}
                                  onChange={(e) => handleUpdateRole(targetId, e.target.value)}
                                  className="text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 p-1.5 rounded-lg focus:outline-none focus:border-rose-500 cursor-pointer disabled:opacity-50"
                                >
                                  <option value="user">User</option>
                                  <option value="creator">Creator/Volunteer</option>
                                  <option value="admin">Admin</option>
                                </select>

                                {/* Promoted Admin Button */}
                                {user.role === 'admin' && usr.role !== 'admin' && (
                                  <button
                                    disabled={actionLoading === targetId}
                                    onClick={() => openPromoteModal(usr)}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-all duration-200 disabled:opacity-50 border-none shadow-sm shadow-rose-500/10"
                                  >
                                    Promote Admin
                                  </button>
                                )}

                                {/* Deactivate button */}
                                <button
                                  disabled={actionLoading === targetId || isSelf}
                                  onClick={() => handleToggleStatus(targetId, usr.active !== false)}
                                  className={`p-1.5 rounded-lg border-none cursor-pointer transition-colors duration-200 disabled:opacity-30 ${
                                    usr.active !== false
                                      ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white'
                                      : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white'
                                  }`}
                                  title={isSelf ? 'Cannot suspend self' : usr.active !== false ? 'Deactivate User Account' : 'Activate User Account'}
                                >
                                  {actionLoading === targetId ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-transparent" />
                                  ) : usr.active !== false ? (
                                    <Ban className="w-4 h-4" />
                                  ) : (
                                    <Power className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Promotion Confirmation Modal */}
        {showPromoteModal && userToPromote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm transition-opacity duration-300">
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl animate-scaleUp">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" /> Confirm Admin Promotion
                </h3>
                <button
                  onClick={() => { setShowPromoteModal(false); setUserToPromote(null); }}
                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-lg text-zinc-400 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-3 mb-6">
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Are you sure you want to promote <span className="font-bold text-zinc-900 dark:text-white">{userToPromote.name}</span> (<span className="text-rose-600">{userToPromote.email}</span>) to the <span className="font-black text-rose-600">Admin</span> role?
                </p>
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 text-xs rounded-xl font-medium leading-normal flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Caution:</strong> This grants the user complete administrative power over LifeFlow, including the ability to verify/block users, modify credentials, and moderate active request listings.
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowPromoteModal(false); setUserToPromote(null); }}
                  className="px-4 py-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMakeAdmin}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl cursor-pointer transition-colors border-none shadow-md shadow-rose-500/15"
                >
                  Confirm Promotion
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
