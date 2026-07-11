'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Search, MapPin, Phone, Award, Landmark, AlertCircle, ArrowLeft, ShieldAlert, X, Image as ImageIcon } from 'lucide-react';

import { BloodRequest } from '@/lib/types';
import { fetchAllRequests } from '@/lib/get/requests';

// Custom simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ExplorePage() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');

  // Debounced search term (400ms delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Track if search is typing/pending debounce
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsDebouncing(true);
    } else {
      setIsDebouncing(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllRequests();
      setRequests(data);
      setFilteredRequests(data);
    } catch (err) {
      console.error('Error fetching explore requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter effect listening to debouncedSearchTerm and dropdown filters
  useEffect(() => {
    let results = requests;

    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase();
      results = results.filter(
        req =>
          req.patientName.toLowerCase().includes(term) ||
          req.hospitalName.toLowerCase().includes(term) ||
          req.location.toLowerCase().includes(term)
      );
    }

    if (selectedBloodGroup) {
      results = results.filter(
        req => req.bloodGroup.toLowerCase() === selectedBloodGroup.toLowerCase()
      );
    }

    if (selectedUrgency) {
      results = results.filter(
        req => req.urgencyLevel.toLowerCase() === selectedUrgency.toLowerCase()
      );
    }

    setFilteredRequests(results);
  }, [debouncedSearchTerm, selectedBloodGroup, selectedUrgency, requests]);

  const handleReset = () => {
    setSearchTerm('');
    setSelectedBloodGroup('');
    setSelectedUrgency('');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-350 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Search className="w-8 h-8 text-rose-600" /> Explore Blood Requests
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Search active requirements and filters to find blood donation requests by Group, City, or Urgency.
          </p>
        </div>

        {/* Search & Filters Controls */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 md:p-8 shadow-sm mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Search Input with Debounce Status */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Search Input (Debounced 400ms)
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
                <input
                  type="text"
                  placeholder="Type Name, Hospital or Location..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all placeholder-zinc-450"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1.5 min-h-[16px] px-1">
                {isDebouncing ? (
                  <span className="text-[10px] text-amber-505 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span> Debounce typing...
                  </span>
                ) : debouncedSearchTerm ? (
                  <span className="text-[10px] text-emerald-500 font-semibold">
                    ✓ Filter synchronized
                  </span>
                ) : null}
              </div>
            </div>

            {/* Blood Group Select */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Blood Group Filter
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all cursor-pointer"
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
              >
                <option value="">All Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* Urgency select */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Urgency Level
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all cursor-pointer"
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
              >
                <option value="">All Urgency Levels</option>
                <option value="Urgent">Urgent Only 🚨</option>
                <option value="Normal">Normal Urgency</option>
              </select>
            </div>
          </div>

          {(searchTerm || selectedBloodGroup || selectedUrgency) && (
            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={handleReset}
                className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </section>

        {/* Results Listings Grid */}
        <section>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-rose-600" />
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading requests...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8">
              <AlertCircle className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-650" />
              <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">No search results found</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Adjust your debounced search terms or drop down selections.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
              {filteredRequests.map((request) => (
                <div key={request._id} className="group relative flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  
                  {/* Decorative Blood Type Badge Circle */}
                  <div className="aspect-[4/2] w-full bg-gradient-to-br from-rose-50 to-red-100/50 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center relative border-b border-zinc-100 dark:border-zinc-800">
                    <div className="h-20 w-20 rounded-full bg-rose-600 text-white flex flex-col items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform duration-300">
                      <span className="text-3xl font-black tracking-tight">{request.bloodGroup}</span>
                    </div>
                    {request.urgencyLevel === 'Urgent' ? (
                      <span className="absolute top-4 right-4 bg-rose-500/10 text-rose-650 dark:text-rose-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping"></span> Urgent
                      </span>
                    ) : (
                      <span className="absolute top-4 right-4 bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                        Normal
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-455 uppercase tracking-wide flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Patient: {request.patientName}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span className="truncate">{request.hospitalName}</span>
                    </h3>
                    <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-zinc-400" /> {request.location}
                    </p>
                    
                    <div className="mt-6 flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-850 dark:text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer text-center"
                      >
                        View Details
                      </button>
                      <a
                        href={`tel:${request.contactNumber}`}
                        className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border border-rose-600 shadow-md shadow-rose-500/10 text-center"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-left transition-all">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-full p-2 transition-colors cursor-pointer border-none"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-14 w-14 rounded-full bg-rose-600 text-white flex flex-col items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
                <span className="text-2xl font-black">{selectedRequest.bloodGroup}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Required Blood Group: {selectedRequest.bloodGroup}
                </h3>
                <div className="flex gap-2 mt-1">
                  {selectedRequest.urgencyLevel === 'Urgent' ? (
                    <span className="bg-rose-500/10 text-rose-600 dark:text-rose-455 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping"></span> Urgent
                    </span>
                  ) : (
                    <span className="bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      Normal
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Case Image */}
            {selectedRequest.imageUrl ? (
              <div className="mb-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-video bg-zinc-50 dark:bg-zinc-955 flex items-center justify-center">
                <img
                  src={selectedRequest.imageUrl}
                  alt={`${selectedRequest.patientName}'s Case`}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="mb-6 rounded-2xl p-6 border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col items-center justify-center text-center">
                <ImageIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-2" />
                <p className="text-xs text-zinc-450 dark:text-zinc-500">No medical case image uploaded by requester</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-505">Patient Name</span>
                  <p className="mt-1 text-sm font-bold text-zinc-850 dark:text-zinc-200">{selectedRequest.patientName}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-505">Contact Number</span>
                  <p className="mt-1 text-sm font-bold text-zinc-850 dark:text-zinc-200">{selectedRequest.contactNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-505">Hospital</span>
                  <p className="mt-1 text-sm font-bold text-zinc-850 dark:text-zinc-200">{selectedRequest.hospitalName}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-505">Location</span>
                  <p className="mt-1 text-sm font-bold text-zinc-850 dark:text-zinc-200">{selectedRequest.location}</p>
                </div>
              </div>

              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-505">Requester Email</span>
                <p className="mt-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">{selectedRequest.email}</p>
              </div>

              {selectedRequest.createdAt && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-505">Posted On</span>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer border-none"
              >
                Close
              </button>
              <a
                href={`tel:${selectedRequest.contactNumber}`}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/20 text-center"
              >
                <Phone className="w-4 h-4" /> Call Coordinator
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
