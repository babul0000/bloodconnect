'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { 
  Heart, Trash2, Edit, AlertCircle, ArrowLeft, RefreshCw, 
  Landmark, MapPin, Phone, User, Check, X, Image as ImageIcon,
  Search, Filter, CheckCircle2, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { z } from 'zod';

import { BloodRequest } from '@/lib/types';
import { fetchUserRequests as fetchUserRequestsLib } from '@/lib/get/requests';
import { updateRequest, deleteRequest } from '@/lib/post/requests';
import { uploadImageToImgBB } from '@/lib/upload';
import { API_URL } from '@/lib/api-config';

// Zod schema for editing
const requestSchema = z.object({
  patientName: z.string().min(2, 'Patient name must be at least 2 characters'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
  hospitalName: z.string().min(3, 'Hospital name must be at least 3 characters'),
  location: z.string().min(3, 'Location details must be at least 3 characters'),
  urgencyLevel: z.enum(['Urgent', 'Normal']),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 digits'),
});

export default function ManageRequestsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user as any;

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Search & Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Edit Modal State
  const [editingRequest, setEditingRequest] = useState<BloodRequest | null>(null);
  const [editPatientName, setEditPatientName] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('A+');
  const [editHospitalName, setEditHospitalName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editUrgencyLevel, setEditUrgencyLevel] = useState<'Urgent' | 'Normal'>('Normal');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('Pending');
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Action Loading tracking (for status switches)
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      let data: BloodRequest[] = [];
      if (user.role === 'admin') {
        // Admins fetch ALL active blood requests globally
        const res = await fetch(`${API_URL}/api/requests`);
        if (!res.ok) throw new Error('Failed to fetch global request directory');
        data = await res.json();
      } else {
        // General users fetch only their own blood requests
        data = await fetchUserRequestsLib(user.email);
      }
      // Sort: latest requests first
      data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setRequests(data);
      setFilteredRequests(data);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      setError(err.message || 'Backend connection error. Please verify the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  // Filtering Logic
  useEffect(() => {
    let results = requests;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        r =>
          r.patientName.toLowerCase().includes(term) ||
          r.hospitalName.toLowerCase().includes(term) ||
          r.location.toLowerCase().includes(term) ||
          r.email.toLowerCase().includes(term)
      );
    }

    if (filterBloodGroup) {
      results = results.filter(r => r.bloodGroup === filterBloodGroup);
    }

    if (filterUrgency) {
      results = results.filter(r => r.urgencyLevel === filterUrgency);
    }

    if (filterStatus) {
      const targetStatus = filterStatus.toLowerCase();
      results = results.filter(r => {
        const currentStatus = (r.status || 'Pending').toLowerCase();
        return currentStatus === targetStatus;
      });
    }

    setFilteredRequests(results);
  }, [searchTerm, filterBloodGroup, filterUrgency, filterStatus, requests]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError('');
    setSuccessMsg('');
    try {
      await deleteRequest(id);
      setRequests(prev => prev.filter(req => req._id !== id));
      setSuccessMsg('Blood request successfully moderated and deleted.');
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting request:', err);
      setError('Failed to delete request.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setStatusLoadingId(id);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_URL}/api/requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update request status');

      setSuccessMsg(`Blood request status updated to ${newStatus}!`);
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update status.');
    } finally {
      setStatusLoadingId(null);
    }
  };

  const openEditModal = (req: BloodRequest) => {
    setEditingRequest(req);
    setEditPatientName(req.patientName);
    setEditBloodGroup(req.bloodGroup);
    setEditHospitalName(req.hospitalName);
    setEditLocation(req.location);
    setEditUrgencyLevel(req.urgencyLevel as any);
    setEditContactNumber(req.contactNumber);
    setEditImageUrl(req.imageUrl || '');
    setEditImagePreview(req.imageUrl || null);
    setEditStatus(req.status || 'Pending');
    setEditImageFile(null);
    setEditErrors({});
  };

  const closeEditModal = () => {
    setEditingRequest(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    setEditErrors({});
    setIsUpdating(true);
    setError('');
    setSuccessMsg('');

    const formData = {
      patientName: editPatientName,
      bloodGroup: editBloodGroup as any,
      hospitalName: editHospitalName,
      location: editLocation,
      urgencyLevel: editUrgencyLevel,
      contactNumber: editContactNumber,
    };

    const validation = requestSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setEditErrors(fieldErrors);
      setIsUpdating(false);
      return;
    }

    try {
      let finalImageUrl = editImageUrl;
      if (editImageFile) {
        finalImageUrl = await uploadImageToImgBB(editImageFile);
      }

      const updateData = {
        ...formData,
        imageUrl: finalImageUrl,
        status: editStatus,
      };

      await updateRequest(editingRequest._id, updateData);
      setRequests(prev => prev.map(req => 
        req._id === editingRequest._id ? { ...req, ...updateData } : req
      ));
      setSuccessMsg('Blood request details updated successfully.');
      closeEditModal();
    } catch (err: any) {
      console.error('Error updating request:', err);
      setError(err.message || 'Failed to update request.');
    } finally {
      setIsUpdating(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterBloodGroup('');
    setFilterUrgency('');
    setFilterStatus('');
  };

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isPending && !user) {
      router.push('/auth/signin');
    }
  }, [user, isPending, router]);

  // Auth check
  if (isPending || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-white px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-rose-600" />
      </div>
    );
  }

  const isUserAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-350 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                {isUserAdmin ? (
                  <><ShieldCheck className="w-8 h-8 text-rose-600" /> Admin Operations Control</>
                ) : (
                  <><Heart className="w-8 h-8 text-rose-600 fill-rose-600/10" /> Manage My Requests</>
                )}
              </h1>
              <p className="text-sm text-zinc-505 dark:text-zinc-400 mt-1.5">
                {isUserAdmin 
                  ? 'Overview of all global requests active on the platform. Review files, update statuses, or moderate posts.' 
                  : 'View, edit, or delete the blood donation requests you have created.'}
              </p>
            </div>
            <button
              onClick={fetchRequests}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-5 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Registry
            </button>
          </div>
        </div>

        {/* Action Banners */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 font-bold text-sm flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" /> {error}
            </span>
            <button onClick={() => setError('')} className="p-1 hover:bg-rose-500/10 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-455 font-bold text-sm flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
            </span>
            <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-500/10 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Search & Advanced Filters Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-rose-600 uppercase tracking-wider">
            <Filter className="w-4 h-4" /> Filter Requests Registry
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            
            {/* Search Input */}
            <div className="lg:col-span-4 space-y-1">
              <label className="text-zinc-450 dark:text-zinc-400 text-xs font-bold">Search Keywords</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Patient, hospital, location, or creator..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-sm outline-none focus:border-rose-500 transition-all text-zinc-850 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Blood Type Filter */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-zinc-455 dark:text-zinc-400 text-xs font-bold">Blood Group</label>
              <select
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-sm outline-none focus:border-rose-500 transition-all text-zinc-850 dark:text-white cursor-pointer"
                value={filterBloodGroup}
                onChange={(e) => setFilterBloodGroup(e.target.value)}
              >
                <option value="" className="text-zinc-900 dark:bg-zinc-900">All Groups</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(group => (
                  <option key={group} value={group} className="text-zinc-900 dark:bg-zinc-900">{group}</option>
                ))}
              </select>
            </div>

            {/* Urgency Filter */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-zinc-450 dark:text-zinc-400 text-xs font-bold">Urgency</label>
              <select
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-sm outline-none focus:border-rose-500 transition-all text-zinc-850 dark:text-white cursor-pointer"
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
              >
                <option value="" className="text-zinc-900 dark:bg-zinc-900">All Urgency</option>
                <option value="Urgent" className="text-zinc-900 dark:bg-zinc-900">Urgent</option>
                <option value="Normal" className="text-zinc-900 dark:bg-zinc-900">Normal</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="lg:col-span-2 space-y-1">
              <label className="text-zinc-450 dark:text-zinc-400 text-xs font-bold">Status</label>
              <select
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-sm outline-none focus:border-rose-500 transition-all text-zinc-850 dark:text-white cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="" className="text-zinc-900 dark:bg-zinc-900">All Statuses</option>
                <option value="Pending" className="text-zinc-900 dark:bg-zinc-900">Pending</option>
                <option value="Fulfilled" className="text-zinc-900 dark:bg-zinc-900">Fulfilled</option>
              </select>
            </div>

            {/* Reset filters */}
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

        {/* Requests Table Listings */}
        {isLoading ? (
          /* Premium Skeleton Loader */
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-48 bg-zinc-100 dark:bg-zinc-850 rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                  <div className="h-8 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          /* Empty state UI */
          <div className="text-center py-20 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-sm">
            <Heart className="w-16 h-16 mx-auto text-zinc-350 dark:text-zinc-650 mb-4 fill-zinc-350/5" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No blood requests found</h3>
            <p className="mt-2 text-sm text-zinc-505 dark:text-zinc-400 max-w-sm mx-auto">
              {isUserAdmin 
                ? 'There are no active requests in the database matching your filters.' 
                : "You haven't posted any blood requests on LifeFlow yet."}
            </p>
            {!isUserAdmin && (
              <Link
                href="/items/add"
                className="mt-6 inline-flex bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3 rounded-2xl transition-all duration-200 shadow-md shadow-rose-500/10 cursor-pointer text-sm"
              >
                Post a New Request
              </Link>
            )}
          </div>
        ) : (
          /* Responsive Table Layout */
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl overflow-hidden shadow-sm">
            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-extrabold uppercase text-zinc-455 tracking-wider">
                    <th className="px-6 py-4">Blood Group</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Hospital Details</th>
                    <th className="px-6 py-4">Urgency</th>
                    <th className="px-6 py-4">Status</th>
                    {isUserAdmin && <th className="px-6 py-4">Creator</th>}
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                  {filteredRequests.map((request) => {
                    const reqStatus = request.status || 'Pending';
                    return (
                      <tr key={request._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white font-black text-sm shadow-sm select-none">
                            {request.bloodGroup}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">
                          {request.patientName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 truncate max-w-xs">
                            <Landmark className="w-3.5 h-3.5 text-zinc-400" /> {request.hospitalName}
                          </div>
                          <div className="text-xs text-zinc-450 dark:text-zinc-500 mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {request.location}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {request.urgencyLevel === 'Urgent' ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 px-2.5 py-0.5 text-xs font-black text-rose-600 dark:text-rose-455">
                              Urgent 🚨
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {isUserAdmin ? (
                            /* Admins can change status inline */
                            <select
                              disabled={statusLoadingId === request._id}
                              value={reqStatus}
                              onChange={(e) => handleStatusChange(request._id, e.target.value)}
                              className="text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-850 dark:text-zinc-100 p-1.5 rounded-lg focus:outline-none focus:border-rose-500 cursor-pointer disabled:opacity-50"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Fulfilled">Fulfilled</option>
                            </select>
                          ) : (
                            /* General users see read-only badge */
                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                              reqStatus === 'Fulfilled' ? 'text-emerald-500' : 'text-amber-500'
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${reqStatus === 'Fulfilled' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {reqStatus}
                            </span>
                          )}
                        </td>
                        {isUserAdmin && (
                          <td className="px-6 py-4 text-xs text-zinc-450">
                            {request.email}
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(request)}
                              className="inline-flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-3 py-2 rounded-xl text-xs font-bold border border-transparent cursor-pointer transition-all"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(request._id)}
                              disabled={deletingId === request._id}
                              className="inline-flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white px-3 py-2 rounded-xl text-xs font-bold border border-transparent cursor-pointer disabled:opacity-50 transition-all"
                              title="Moderate/delete request"
                            >
                              {deletingId === request._id ? (
                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout - Hidden on Desktop */}
            <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredRequests.map((request) => {
                const reqStatus = request.status || 'Pending';
                return (
                  <div key={request._id} className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white font-black text-sm shadow-sm select-none">
                          {request.bloodGroup}
                        </span>
                        <div>
                          <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{request.patientName}</h4>
                          <span className="text-[10px] text-zinc-450 dark:text-zinc-500">
                            {request.email}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {request.urgencyLevel === 'Urgent' ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 px-2 py-0.5 text-[10px] font-black text-rose-600">
                            Urgent 🚨
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                            Normal
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{request.hospitalName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                        <span className="truncate">{request.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                        <span>{request.contactNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80 gap-4">
                      <div>
                        {isUserAdmin ? (
                          <select
                            disabled={statusLoadingId === request._id}
                            value={reqStatus}
                            onChange={(e) => handleStatusChange(request._id, e.target.value)}
                            className="text-xs font-bold border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-850 p-1.5 rounded-lg cursor-pointer"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Fulfilled">Fulfilled</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                            reqStatus === 'Fulfilled' ? 'text-emerald-500' : 'text-amber-500'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${reqStatus === 'Fulfilled' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {reqStatus}
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(request)}
                          className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 rounded-lg text-xs font-bold cursor-pointer border-none"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(request._id)}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg text-xs font-bold cursor-pointer border-none"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer border-none bg-transparent"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <Edit className="w-5 h-5 text-rose-600" /> Edit Blood Request
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Patient Name */}
              <div className="space-y-1 text-left">
                <label className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Patient Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    required
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all"
                    value={editPatientName}
                    onChange={(e) => setEditPatientName(e.target.value)}
                  />
                </div>
                {editErrors.patientName && <p className="text-xs text-rose-600 font-bold mt-1">{editErrors.patientName}</p>}
              </div>

              {/* Blood Group */}
              <div className="space-y-1 text-left">
                <label className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Required Blood Group</label>
                <div className="relative">
                  <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <select
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all cursor-pointer appearance-none"
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
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
                  <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    required
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all"
                    value={editHospitalName}
                    onChange={(e) => setEditHospitalName(e.target.value)}
                  />
                </div>
                {editErrors.hospitalName && <p className="text-xs text-rose-600 font-bold mt-1">{editErrors.hospitalName}</p>}
              </div>

              {/* Location */}
              <div className="space-y-1 text-left">
                <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Hospital Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    required
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                  />
                </div>
                {editErrors.location && <p className="text-xs text-rose-600 font-bold mt-1">{editErrors.location}</p>}
              </div>

              {/* Contact Number */}
              <div className="space-y-1 text-left">
                <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    required
                    type="tel"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all"
                    value={editContactNumber}
                    onChange={(e) => setEditContactNumber(e.target.value)}
                  />
                </div>
                {editErrors.contactNumber && <p className="text-xs text-rose-600 font-bold mt-1">{editErrors.contactNumber}</p>}
              </div>

              {/* Case Image */}
              <div className="space-y-1 text-left">
                <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Patient / Case Image</label>
                <div className="relative flex flex-col gap-2">
                  <div className={`w-full border border-dashed rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-50 dark:bg-transparent ${
                    editImagePreview ? 'border-rose-500/50' : 'border-zinc-200 dark:border-zinc-800'
                  }`}>
                    {editImagePreview ? (
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                        <img src={editImagePreview} alt="Preview" className="h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => {
                            setEditImageFile(null);
                            setEditImageUrl('');
                            setEditImagePreview(null);
                          }}
                          className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1 shadow-md transition-colors cursor-pointer border-none"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer py-4 w-full">
                        <ImageIcon className="w-8 h-8 text-zinc-400 mb-2" />
                        <span className="text-xs text-zinc-550 dark:text-zinc-400 font-semibold">Click to upload new image (Optional)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEditImageFile(file);
                              setEditImagePreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Urgency Level */}
              <div className="space-y-2 text-left pt-1">
                <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Urgency Level</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setEditUrgencyLevel('Normal')}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      editUrgencyLevel === 'Normal'
                        ? 'bg-zinc-100 border-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:border-zinc-700'
                        : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditUrgencyLevel('Urgent')}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                      editUrgencyLevel === 'Urgent'
                        ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-955/20 dark:border-rose-900/30'
                        : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Urgent 🚨
                  </button>
                </div>
              </div>

              {/* Status Update (Visible to all, but edit status is handy) */}
              <div className="space-y-1 text-left">
                <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Status</label>
                <select
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all cursor-pointer appearance-none"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Fulfilled">Fulfilled</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-rose-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer border-none flex items-center justify-center gap-1.5"
                >
                  {isUpdating ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-white" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 mb-4 animate-bounce">
              <AlertCircle className="h-6 w-6" />
            </div>
            
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              Confirm Deletion
            </h3>
            
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              Are you sure you want to delete this blood request? This action is permanent and cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-850 dark:text-white font-bold py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deletingId === deleteConfirmId}
                className="flex-1 bg-rose-600 hover:bg-rose-505 text-white font-bold py-2.5 rounded-xl text-sm transition-all duration-200 shadow-md shadow-rose-500/20 active:scale-[0.99] cursor-pointer border-none flex items-center justify-center gap-1.5"
              >
                {deletingId === deleteConfirmId ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-200 border-t-transparent" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
