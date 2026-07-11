'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone, MapPin, Heart, ArrowLeft, Calendar, Shield, Activity, User, Building, ExternalLink, ZoomIn, X } from 'lucide-react';
import { fetchRequestById } from '@/lib/get/requests';
import { BloodRequest } from '@/lib/types';

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadRequest = async () => {
      setIsLoading(true);
      try {
        const data = await fetchRequestById(id);
        setRequest(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load blood request details. It may have been deleted or the ID is invalid.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRequest();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-rose-600" />
        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 animate-pulse">Loading case file...</span>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-955 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center shadow-2xl">
          <Shield className="w-14 h-14 mx-auto text-rose-500 mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Request Not Found</h3>
          <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-2 leading-relaxed">
            {error || 'The requested blood donation record does not exist.'}
          </p>
          <button
            onClick={() => router.push('/explore')}
            className="mt-6 w-full bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl py-3.5 text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-rose-500/20"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300 relative py-12 md:py-20 overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-rose-400/5 dark:bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Navigation Bar */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-450 transition-colors border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="text-xs font-semibold text-zinc-405 dark:text-zinc-500">
            Case ID: <span className="font-mono text-zinc-500 dark:text-zinc-400">{request._id}</span>
          </div>
        </div>

        {/* Outer Premium Card Grid */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
          
          {/* Header Hero Banner Section */}
          <div className="relative bg-gradient-to-r from-rose-50/50 to-zinc-50/50 dark:from-zinc-900/60 dark:to-zinc-900/40 border-b border-zinc-150 dark:border-zinc-800/80 p-6 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl bg-rose-600 text-white flex flex-col items-center justify-center font-black text-3xl shadow-xl shadow-rose-500/30 border border-rose-500 shrink-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-100/80 mb-0.5">Group</span>
                {request.bloodGroup}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/5 dark:bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/10">
                    Emergency Blood File
                  </span>
                  {request.urgencyLevel === 'Urgent' ? (
                    <span className="bg-rose-600 text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                      <span className="inline-block h-1.5 w-1.5 bg-white rounded-full animate-ping"></span> URGENT CASE
                    </span>
                  ) : (
                    <span className="bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                      Normal Status
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white mt-2 tracking-tight">
                  Patient: {request.patientName}
                </h1>
              </div>
            </div>
            
            {/* Direct Call Button in Header */}
            <div className="shrink-0">
              <a
                href={`tel:${request.contactNumber}`}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-550 text-white font-bold px-6 py-3.5 rounded-2xl transition-all duration-205 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/30 border border-rose-600 hover:scale-[1.02]"
              >
                <Phone className="w-4 h-4 fill-white/10" /> Call Coordinator Now
              </a>
            </div>
          </div>

          {/* Details Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Column: Attachment / Document Frame (5 cols) */}
            <div className="lg:col-span-5 p-6 md:p-8 bg-zinc-50/50 dark:bg-zinc-900/30 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-500" /> Medical Case Attachment
                </h3>
                
                {request.imageUrl ? (
                  <div className="space-y-4">
                    {/* Visual Card Frame */}
                    <div 
                      onClick={() => setIsLightboxOpen(true)}
                      className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 shadow-md hover:shadow-xl transition-all duration-300 cursor-zoom-in group/img"
                    >
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative">
                        <img
                          src={request.imageUrl}
                          alt={`${request.patientName}'s Case Document`}
                          className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover/img:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center">
                          <span className="opacity-0 group-hover/img:opacity-100 text-xs font-bold text-white bg-black/75 px-3.5 py-2 rounded-xl backdrop-blur-md transition-all duration-300 flex items-center gap-1.5 shadow-lg">
                            <ZoomIn className="w-3.5 h-3.5" /> Click to Zoom
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-center text-xs text-zinc-400 dark:text-zinc-550 font-medium">
                      Click the attachment above to inspect the high-resolution file.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-955/20 p-8 flex flex-col items-center justify-center text-center space-y-4 py-16">
                    <div className="h-16 w-16 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center shadow-inner">
                      <Heart className="w-8 h-8 fill-rose-600/10 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-805 dark:text-zinc-250">No Document Attached</h4>
                      <p className="text-xs text-zinc-400 dark:text-zinc-505 mt-1 max-w-[240px] leading-relaxed mx-auto font-medium">
                        The requester did not upload any verification documents. Contact coordinator to verify details.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Banner */}
              <div className="mt-8 rounded-2xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">LifeFlow Verification</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-450 mt-0.5 leading-relaxed font-medium">
                    Always request verification files before donating blood. Report requests containing suspicious info immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Case Summary Tiles (7 cols) */}
            <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-6">
                  Case Metadata & Overview
                </h3>

                {/* Styled Grid of Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Patient Name Tile */}
                  <div className="bg-zinc-50/60 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-800/60 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-805 text-rose-600 dark:text-rose-450 flex items-center justify-center shrink-0 shadow-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Patient Name</span>
                      <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">{request.patientName}</p>
                    </div>
                  </div>

                  {/* Contact Number Tile */}
                  <div className="bg-zinc-50/60 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-800/60 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-rose-600 dark:text-rose-455 flex items-center justify-center shrink-0 shadow-sm">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-505">Contact Phone</span>
                      <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">{request.contactNumber}</p>
                    </div>
                  </div>

                  {/* Hospital Name Tile */}
                  <div className="bg-zinc-50/60 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-800/60 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-rose-600 dark:text-rose-455 flex items-center justify-center shrink-0 shadow-sm">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Hospital</span>
                      <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">{request.hospitalName}</p>
                    </div>
                  </div>

                  {/* Location Tile */}
                  <div className="bg-zinc-50/60 dark:bg-zinc-950/20 border border-zinc-150 dark:border-zinc-800/60 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-rose-600 dark:text-rose-455 flex items-center justify-center shrink-0 shadow-sm">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Location</span>
                      <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 mt-0.5">{request.location}</p>
                    </div>
                  </div>

                  {/* Requester Email Tile */}
                  <div className="bg-zinc-50/60 dark:bg-zinc-955/20 border border-zinc-150 dark:border-zinc-800/60 rounded-2xl p-4 flex items-center gap-3.5 md:col-span-2">
                    <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-rose-600 dark:text-rose-455 flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Requester Email</span>
                      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5 break-all">{request.email}</p>
                    </div>
                  </div>

                  {/* Posted Date Tile */}
                  {request.createdAt && (
                    <div className="bg-zinc-50/60 dark:bg-zinc-955/20 border border-zinc-150 dark:border-zinc-800/60 rounded-2xl p-4 flex items-center gap-3.5 md:col-span-2">
                      <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-rose-600 dark:text-rose-455 flex items-center justify-center shrink-0 shadow-sm">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Posted On</span>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-semibold">
                          {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800/80">
                <button
                  onClick={() => router.push('/explore')}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-800 dark:text-white font-bold py-4 rounded-2xl text-xs transition-all duration-200 cursor-pointer border-none flex items-center justify-center gap-1.5"
                >
                  Return to Feed
                </button>
                <a
                  href={`tel:${request.contactNumber}`}
                  className="flex-1 bg-rose-600 hover:bg-rose-550 text-white font-bold py-4 rounded-2xl text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-500/20 text-center border border-rose-600"
                >
                  <Phone className="w-4 h-4" /> Call Case Coordinator
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && request && request.imageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-300"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center animate-scale-up" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 z-55 bg-white/20 hover:bg-white/30 text-white rounded-full p-2.5 transition-colors cursor-pointer border-none"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={request.imageUrl}
              alt="High Resolution Patient Case File"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
