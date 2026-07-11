'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Heart, Search, MapPin, Phone, Award, Shield, User, Landmark, AlertCircle, X, Image as ImageIcon } from 'lucide-react';

import { BloodRequest } from '@/lib/types';
import { fetchAllRequests } from '@/lib/get/requests';
import { fetchAllDonors } from '@/lib/get/donors';

export default function Home() {
  const { user, login, logout } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [searchBloodType, setSearchBloodType] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const [totalDonors, setTotalDonors] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [citiesCount, setCitiesCount] = useState(0);

  const fetchStats = async (requestsData: BloodRequest[]) => {
    try {
      const donorsData = await fetchAllDonors();
      setTotalDonors(donorsData.length);
      setTotalRequests(requestsData.length);
      
      const uniqueCities = new Set<string>();
      requestsData.forEach(r => {
        if (r.location) {
          const parts = r.location.split(',');
          const city = parts[parts.length - 1].trim();
          if (city) uniqueCities.add(city.toLowerCase());
        }
      });
      donorsData.forEach(d => {
        if (d.location) {
          const parts = d.location.split(',');
          const city = parts[parts.length - 1].trim();
          if (city) uniqueCities.add(city.toLowerCase());
        }
      });
      
      setCitiesCount(uniqueCities.size || 3);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch requests from backend using our lib API helper
  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllRequests();
      setRequests(data);
      setFilteredRequests(data);
      await fetchStats(data);
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

        {/* Categories / Blood Groups Quick Filter */}
        <section className="mb-16">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 text-left">Quick Search by Blood Group</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((group) => (
              <button
                key={group}
                onClick={() => {
                  setSearchBloodType(group);
                  // Scroll to grid
                  document.getElementById('requests-grid')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`py-3 rounded-2xl text-sm font-bold border transition-all cursor-pointer ${
                  searchBloodType === group
                    ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-500/20 scale-105'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-rose-500'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </section>

        {/* Requests Grid Section */}
        <section id="requests-grid">
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

        {/* How It Works */}
        <section className="mb-24 py-12 border-t border-zinc-100 dark:border-zinc-800/50 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Simple 3-Step Process
            </h2>
            <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-2 leading-relaxed">
              LifeFlow makes blood donation seamless and accessible in critical moments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-455 flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                1
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Register</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                Join our network as a donor or patient to begin sharing requests and saving lives.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-455 flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                2
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Search or Post</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                Patients post urgent requirements or find local donors. Donors browse the active list.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-955/20 text-rose-600 dark:text-rose-455 flex items-center justify-center font-bold text-lg mb-4 shadow-sm">
                3
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">Connect</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                Get in touch directly through phone lines and coordinate details immediately.
              </p>
            </div>
          </div>
        </section>

        {/* Statistics / Impact Dashboard */}
        <section className="mb-24 py-12 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Our Community Impact
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              LifeFlow's growing community statistics and successful connection charts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Stats list */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-6">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm flex items-center gap-4 text-left">
                <div className="h-12 w-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 fill-rose-600/10" />
                </div>
                <div>
                  <span className="text-2xl font-black text-zinc-900 dark:text-white block">{totalRequests}</span>
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Blood Requests Raised</span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm flex items-center gap-4 text-left">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-black text-zinc-900 dark:text-white block">{totalDonors}</span>
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Active Registered Donors</span>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 shadow-sm flex items-center gap-4 text-left">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-450 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-2xl font-black text-zinc-900 dark:text-white block">{citiesCount} Cities</span>
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Active Cities Covered</span>
                </div>
              </div>
            </div>

            {/* Premium Custom SVG Dashboard Chart */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm text-left relative overflow-hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-405 dark:text-zinc-500 mb-4 block">Monthly Successful Connections (Monthly Trend)</span>
              
              <div className="relative h-64 w-full">
                <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-zinc-800/60" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-zinc-800/60" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" className="dark:stroke-zinc-800/60" />
                  
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e11d48" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <path
                    d="M 0 180 Q 80 140 160 110 T 320 80 T 420 50 L 500 30 L 500 200 L 0 200 Z"
                    fill="url(#chartGrad)"
                  />
                  
                  <path
                    d="M 0 180 Q 80 140 160 110 T 320 80 T 420 50 L 500 30"
                    fill="none"
                    stroke="#e11d48"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  
                  <circle cx="160" cy="110" r="5.5" fill="#e11d48" stroke="#ffffff" strokeWidth="2.5" className="dark:stroke-zinc-900" />
                  <circle cx="320" cy="80" r="5.5" fill="#e11d48" stroke="#ffffff" strokeWidth="2.5" className="dark:stroke-zinc-900" />
                  <circle cx="420" cy="50" r="5.5" fill="#e11d48" stroke="#ffffff" strokeWidth="2.5" className="dark:stroke-zinc-900" />
                </svg>
              </div>
              
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 mt-2 px-1">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials / Success Stories */}
        <section className="mb-24 py-12 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Donor Success Stories
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              Read how LifeFlow helped connect donors to critical cases in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 md:p-8 shadow-sm text-left relative">
              <span className="text-4xl text-rose-500/10 font-serif absolute top-4 left-6">“</span>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 relative z-10 leading-relaxed font-medium">
                My father needed B- blood urgently at Dhaka Medical. I posted a request here, and within 15 minutes, two donors got in touch. One came immediately. It was a true lifesaver.
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-955 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
                  RH
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Rahim Hasan</h4>
                  <p className="text-[10px] font-bold text-zinc-400 block uppercase">Recipient Son, Dhaka</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 md:p-8 shadow-sm text-left relative">
              <span className="text-4xl text-rose-500/10 font-serif absolute top-4 left-6">“</span>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 relative z-10 leading-relaxed font-medium">
                I was always hesitant to register, but LifeFlow made it extremely simple. Registering as a donor was quick, and I have already made one successful blood donation last month. Highly recommended!
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-955 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
                  AS
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Anika Sen</h4>
                  <p className="text-[10px] font-bold text-zinc-400 block uppercase">Registered Donor, Sylhet</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-24 py-12 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              Quick answers to basic queries about donation eligibility and safety.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4 text-left">
            <details className="group bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 cursor-pointer outline-none">
              <summary className="flex items-center justify-between font-bold text-zinc-800 dark:text-zinc-200 text-sm md:text-base select-none list-none [&::-webkit-details-marker]:hidden">
                Who is eligible to donate blood?
                <span className="text-zinc-450 transition group-open:rotate-180 font-bold">&#9662;</span>
              </summary>
              <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-3 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
                Generally, individuals between 18 and 65 years of age, weighing at least 45kg, and in good health are eligible to donate. Some medical conditions or travel histories may temporarily defer eligibility.
              </p>
            </details>

            <details className="group bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 cursor-pointer outline-none">
              <summary className="flex items-center justify-between font-bold text-zinc-800 dark:text-zinc-200 text-sm md:text-base select-none list-none [&::-webkit-details-marker]:hidden">
                How often can I donate blood?
                <span className="text-zinc-450 transition group-open:rotate-180 font-bold">&#9662;</span>
              </summary>
              <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-3 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
                Healthy donors can safely donate whole blood every 3 months (90 days). This interval allows the body's iron stores and red blood cells to fully replenish.
              </p>
            </details>

            <details className="group bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl p-6 cursor-pointer outline-none">
              <summary className="flex items-center justify-between font-bold text-zinc-800 dark:text-zinc-200 text-sm md:text-base select-none list-none [&::-webkit-details-marker]:hidden">
                Is blood donation safe?
                <span className="text-zinc-450 transition group-open:rotate-180 font-bold">&#9662;</span>
              </summary>
              <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-3 leading-relaxed border-t border-zinc-100 dark:border-zinc-800 pt-3">
                Yes, absolutely. Blood donation is conducted in sterile environments by trained healthcare professionals using new, disposable single-use needles. There is no risk of contracting blood-borne infections.
              </p>
            </details>
          </div>
        </section>

        {/* Newsletter/Call to Action */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-205/60 dark:border-zinc-800/60 rounded-3xl p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 to-red-500/5 pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Get Emergency Alerts
            </h2>
            <p className="text-sm text-zinc-555 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Subscribe to receive instant updates when a critical, urgent blood request is raised in your local city or neighborhood.
            </p>
            
            {subscribed ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 rounded-2xl text-sm font-bold animate-scale-up">
                🎉 Thank you for subscribing! We will notify you in case of local emergencies.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newsletterEmail) {
                    setSubscribed(true);
                    setNewsletterEmail('');
                  }
                }}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2"
              >
                <input
                  required
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-505 transition-all"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all duration-200 shadow-md shadow-rose-500/10 active:scale-[0.99] cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200/60 dark:border-zinc-800/60 py-12 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-8 pb-8 border-b border-zinc-105 dark:border-zinc-900">
            <div>
              <span className="text-base font-bold text-zinc-900 dark:text-white block mb-3">Life<span className="text-rose-600">Flow</span></span>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                To bridge the gap between blood donors and patients in critical need through a secure, efficient, and community-driven digital platform.
              </p>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-405 dark:text-zinc-500 block mb-3">Quick Links</span>
              <div className="flex flex-col gap-2">
                <Link href="/about" className="text-xs text-zinc-550 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-455 transition-colors font-medium">About Mission</Link>
                <Link href="/contact" className="text-xs text-zinc-550 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-455 transition-colors font-medium">Contact & Support</Link>
                <Link href="/explore" className="text-xs text-zinc-550 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-455 transition-colors font-medium">Find Donors</Link>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-405 dark:text-zinc-500 block mb-3">Legal & Terms</span>
              <div className="flex flex-col gap-2">
                <Link href="#" className="text-xs text-zinc-550 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-455 transition-colors font-medium">Privacy Policy</Link>
                <Link href="#" className="text-xs text-zinc-550 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-455 transition-colors font-medium">Terms of Service</Link>
              </div>
            </div>
          </div>
          <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            <p>&copy; {new Date().getFullYear()} LifeFlow Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
                    <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
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
