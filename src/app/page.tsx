'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Heart, Search, MapPin, Phone, Award, Shield, User, Landmark, AlertCircle } from 'lucide-react';

interface BloodRequest {
  _id: string;
  patientName: string;
  bloodGroup: string;
  hospitalName: string;
  location: string;
  urgencyLevel: string; // 'Urgent' | 'Normal'
  contactNumber: string;
  email: string;
  createdAt?: string;
}

export default function Home() {
  const { user, login, logout } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [searchBloodType, setSearchBloodType] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch requests from backend
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/requests`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
        setFilteredRequests(data);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let result = requests;

    if (searchBloodType) {
      result = result.filter(req => 
        req.bloodGroup.toLowerCase() === searchBloodType.toLowerCase()
      );
    }

    if (searchLocation) {
      result = result.filter(req => 
        req.location.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    setFilteredRequests(result);
  };

  const handleReset = () => {
    setSearchBloodType('');
    setSearchLocation('');
    setFilteredRequests(requests);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-955 transition-colors duration-300">
      {/* Hero Section */}
      <header className="relative bg-rose-950 text-white overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=1600"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 ring-1 ring-inset ring-rose-500/30">
              Introducing LifeFlow
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Be a Hero. Save a Life.
            </h1>
            <p className="mt-6 text-lg text-rose-100 max-w-xl">
              Connect directly with critical blood request requirements in your area or raise a request to summon help instantly.
            </p>

            {/* Blood Request Search Bar */}
            <form onSubmit={handleSearch} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl bg-white dark:bg-zinc-900 p-2.5 rounded-2xl shadow-xl border border-zinc-200/20">
              <div className="flex-1 px-4 py-2 flex flex-col justify-center text-left">
                <span className="text-xs font-semibold uppercase text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Blood Group
                </span>
                <select
                  value={searchBloodType}
                  onChange={(e) => setSearchBloodType(e.target.value)}
                  className="bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-50 border-none outline-none mt-1 cursor-pointer w-full"
                >
                  <option value="" className="text-zinc-900 dark:bg-zinc-900">All Groups</option>
                  <option value="A+" className="text-zinc-900 dark:bg-zinc-900">A+</option>
                  <option value="A-" className="text-zinc-900 dark:bg-zinc-900">A-</option>
                  <option value="B+" className="text-zinc-900 dark:bg-zinc-900">B+</option>
                  <option value="B-" className="text-zinc-900 dark:bg-zinc-900">B-</option>
                  <option value="O+" className="text-zinc-900 dark:bg-zinc-900">O+</option>
                  <option value="O-" className="text-zinc-900 dark:bg-zinc-900">O-</option>
                  <option value="AB+" className="text-zinc-900 dark:bg-zinc-900">AB+</option>
                  <option value="AB-" className="text-zinc-900 dark:bg-zinc-900">AB-</option>
                </select>
              </div>
              <div className="w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
              <div className="flex-1 px-4 py-2 flex flex-col justify-center text-left">
                <span className="text-xs font-semibold uppercase text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" /> Location
                </span>
                <input
                  type="text"
                  placeholder="e.g. Hospital name, City..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-50 border-none outline-none placeholder-zinc-400 mt-1 w-full"
                />
              </div>
              <div className="flex gap-2 shrink-0 items-center justify-end p-1">
                {(searchBloodType || searchLocation) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 font-semibold text-sm h-11 px-4 rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm h-11 px-6 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
                >
                  <Search className="w-4 h-4" /> Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full">

        {/* Authentication Simulation Console */}
        <section className="mb-16 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Shield className="w-6 h-6 text-rose-600" /> Navbar & Auth Simulation Console
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                LifeFlow requirements state that the Navbar layout must dynamically update based on the user's authentication state. Use this console to simulate logged in and logged out states to test restricted routes like "Become a Donor" and "Manage Donors".
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {user ? (
                <button
                  onClick={logout}
                  className="rounded-2xl border border-rose-200 hover:border-rose-300 dark:border-rose-900/30 dark:hover:border-rose-955 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 px-5 py-3 text-sm font-bold transition-all duration-200 cursor-pointer"
                >
                  Logout (Simulate Logged Out)
                </button>
              ) : (
                <button
                  onClick={() => login('John Doe', 'john@staynest.com')}
                  className="rounded-2xl border border-rose-200 hover:border-rose-300 dark:border-rose-900/30 dark:hover:border-rose-955 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 px-5 py-3 text-sm font-bold transition-all duration-200 cursor-pointer"
                >
                  Login (Simulate Logged In)
                </button>
              )}
            </div>
          </div>

          {/* Current State Detail Display */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Current Auth Status
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${user ? 'bg-rose-500 animate-pulse' : 'bg-zinc-400'}`}></span>
                <span className="text-base font-semibold text-zinc-800 dark:text-zinc-200">
                  {user ? 'Logged In' : 'Logged Out'}
                </span>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Expected Navbar Items
              </span>
              <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {user
                  ? 'Home • Explore Requests • Add Request • Manage Requests • Profile • Logout'
                  : 'Home • Explore Requests • About • Contact • Login • Register'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Requests Grid Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Heart className="w-6 h-6 text-rose-600 fill-rose-600 animate-pulse" /> Active Blood Requests
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Help someone today by donating blood for these urgent requirements.
              </p>
            </div>
            <Link
              href="/explore"
              className="text-sm font-bold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300 transition-colors duration-200"
            >
              View all explore listings &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-rose-600" />
              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading active requests...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8">
              <AlertCircle className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600" />
              <h3 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-50">No blood requests found</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                There are no pending blood requests matching your search.
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
                      <span className="absolute top-4 right-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 bg-rose-500 rounded-full animate-ping"></span> Urgent
                      </span>
                    ) : (
                      <span className="absolute top-4 right-4 bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                        Normal
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Patient: {request.patientName}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-550 flex items-center gap-1.5">
                      <Landmark className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span className="truncate">{request.hospitalName}</span>
                    </h3>
                    <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-zinc-400" /> {request.location}
                    </p>
                    
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                      <a
                        href={`tel:${request.contactNumber}`}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-rose-600 shadow-md shadow-rose-500/10 text-center"
                      >
                        <Phone className="w-4 h-4" /> Call: {request.contactNumber}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200/60 dark:border-zinc-800/60 py-12 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>&copy; {new Date().getFullYear()} LifeFlow Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
