'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { Heart, Trash2, Edit, AlertCircle, ArrowLeft, RefreshCw, Landmark, MapPin, Phone, User, Check, X } from 'lucide-react';
import { z } from 'zod';

interface BloodRequest {
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
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit Modal State
  const [editingRequest, setEditingRequest] = useState<BloodRequest | null>(null);
  const [editPatientName, setEditPatientName] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('A+');
  const [editHospitalName, setEditHospitalName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editUrgencyLevel, setEditUrgencyLevel] = useState<'Urgent' | 'Normal'>('Normal');
  const [editContactNumber, setEditContactNumber] = useState('');
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-rose-600" />
      </div>
    );
  }

  const fetchUserRequests = async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/requests?email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      } else {
        setError('Failed to fetch your blood requests.');
      }
    } catch (err) {
      console.error('Error fetching user requests:', err);
      setError('Backend connection error. Please verify the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blood request?')) {
      return;
    }
    setDeletingId(id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/requests/${id}`, {
        method: 'DELETE',
      });
      if (res.ok || res.status === 204) {
        setRequests(requests.filter(req => req._id !== id));
      } else {
        alert('Failed to delete blood request.');
      }
    } catch (err) {
      console.error('Error deleting request:', err);
      alert('Error connecting to backend server.');
    } finally {
      setDeletingId(null);
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/requests/${editingRequest._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setRequests(requests.map(req => 
          req._id === editingRequest._id ? { ...req, ...formData } : req
        ));
        closeEditModal();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update request.');
      }
    } catch (err) {
      console.error('Error updating request:', err);
      alert('Error connecting to backend server.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                <Heart className="w-8 h-8 text-rose-600 fill-rose-600" /> Manage My Requests
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                View, modify, or remove your raised blood donor requests.
              </p>
            </div>
            <button
              onClick={fetchUserRequests}
              className="inline-flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Lists
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        {!user ? (
          <div className="text-center py-24 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-sm">
            <AlertCircle className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-600" />
            <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">Sign In Required</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              You must be logged in to view and manage your blood requests.
            </p>
            <Link
              href="/auth/signin"
              className="mt-6 inline-flex bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-md shadow-rose-500/10 cursor-pointer text-sm"
            >
              Sign In Now
            </Link>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-rose-600" />
            <span className="text-sm font-medium text-zinc-500">Retrieving requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-sm">
            <AlertCircle className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-655" />
            <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">No active requests</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              You haven't posted any blood requests yet.
            </p>
            <Link
              href="/items/add"
              className="mt-6 inline-flex bg-rose-600 hover:bg-rose-505 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-md shadow-rose-500/10 cursor-pointer text-sm"
            >
              Post a Request
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 text-xs font-bold uppercase text-zinc-400 dark:text-zinc-500">
                    <th className="px-6 py-4">Blood Group</th>
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Hospital & Location</th>
                    <th className="px-6 py-4">Urgency</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white font-extrabold text-sm shadow-sm">
                          {request.bloodGroup}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-900 dark:text-white">
                        {request.patientName}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                        <div className="font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                          <Landmark className="w-3.5 h-3.5" /> {request.hospitalName}
                        </div>
                        <div className="text-xs text-zinc-400 dark:text-zinc-505 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {request.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {request.urgencyLevel === 'Urgent' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                            Urgent 🚨
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(request)}
                            className="inline-flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-zinc-200/50 dark:border-zinc-800 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(request._id)}
                            disabled={deletingId === request._id}
                            className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-955/40 text-rose-600 dark:text-rose-400 px-3 py-2 rounded-xl text-xs font-bold transition-all border border-rose-200/30 dark:border-rose-900/20 cursor-pointer disabled:opacity-50"
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer"
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
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
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
                  <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
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
                  <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
                  <input
                    required
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-905 dark:text-white text-sm outline-none focus:border-rose-500 transition-all"
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
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
                  <input
                    required
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-909 dark:text-white text-sm outline-none focus:border-rose-500 transition-all"
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
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
                  <input
                    required
                    type="tel"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-909 dark:text-white text-sm outline-none focus:border-rose-505 transition-all"
                    value={editContactNumber}
                    onChange={(e) => setEditContactNumber(e.target.value)}
                  />
                </div>
                {editErrors.contactNumber && <p className="text-xs text-rose-600 font-bold mt-1">{editErrors.contactNumber}</p>}
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

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-rose-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
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
    </div>
  );
}
