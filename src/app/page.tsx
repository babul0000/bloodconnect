'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, login, logout } = useAuth();

  // Mock property data
  const properties = [
    {
      id: 1,
      title: 'Serene Forest Cabin',
      location: 'Asheville, North Carolina',
      price: '$145 / night',
      rating: '4.95',
      image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 2,
      title: 'Modern Beachfront Villa',
      location: 'Malibu, California',
      price: '$380 / night',
      rating: '4.89',
      image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 3,
      title: 'Cosy Alpine Chalet',
      location: 'Zermatt, Switzerland',
      price: '$260 / night',
      rating: '4.98',
      image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 4,
      title: 'Charming Desert Oasis',
      location: 'Palm Springs, California',
      price: '$190 / night',
      rating: '4.76',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 5,
      title: 'Luxury Penthouse Suite',
      location: 'Manhattan, New York',
      price: '$450 / night',
      rating: '4.92',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 6,
      title: 'Peaceful Lakehouse Retreat',
      location: 'Lake Tahoe, Nevada',
      price: '$210 / night',
      rating: '4.88',
      image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=600',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Hero Section */}
      <header className="relative bg-emerald-950 text-white overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 z-0 opacity-25">
          <Image
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1600"
            alt="Hero background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
              Introducing StayNest
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Find your next home away from home.
            </h1>
            <p className="mt-6 text-lg text-emerald-100 max-w-xl">
              Discover unique cabins, beachfront villas, alpine chalets, and cosy urban apartments tailored to your dream vacation.
            </p>
            
            {/* Mock Search Bar */}
            <div className="mt-10 flex flex-col sm:flex-row gap-3 max-w-xl bg-white dark:bg-zinc-900 p-2.5 rounded-2xl shadow-xl border border-zinc-200/20">
              <div className="flex-1 px-4 py-2 flex flex-col justify-center text-left">
                <span className="text-xs font-semibold uppercase text-zinc-400 dark:text-zinc-500">Where</span>
                <input 
                  type="text" 
                  placeholder="Search destinations..." 
                  className="bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-50 border-none outline-none placeholder-zinc-400 mt-0.5"
                  disabled
                />
              </div>
              <div className="w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
              <div className="flex-1 px-4 py-2 flex flex-col justify-center text-left">
                <span className="text-xs font-semibold uppercase text-zinc-400 dark:text-zinc-500">Dates</span>
                <span className="text-sm font-medium text-zinc-400 mt-0.5">Add dates</span>
              </div>
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 shrink-0 shadow-lg shadow-emerald-600/20">
                Search
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Interactive Simulation Dashboard (Highlights the navbar functionality) */}
        <section className="mb-16 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Navbar & Auth Simulation Console
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                StayNest requirements state that the Navbar layout must dynamically update based on the user's authentication state. Use this console to simulate logged in and logged out states.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {user ? (
                <button
                  onClick={logout}
                  className="rounded-2xl border border-rose-200 hover:border-rose-300 dark:border-rose-900/30 dark:hover:border-rose-950 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 px-5 py-3 text-sm font-bold transition-all duration-200"
                >
                  Logout (Simulate Logged Out)
                </button>
              ) : (
                <button
                  onClick={() => login('John Doe', 'john@staynest.com')}
                  className="rounded-2xl border border-emerald-200 hover:border-emerald-300 dark:border-emerald-900/30 dark:hover:border-emerald-950 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-5 py-3 text-sm font-bold transition-all duration-200"
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
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${user ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}></span>
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
                  ? 'Home • Explore • Add Property • Manage Properties • Profile • Logout'
                  : 'Home • Explore • About • Contact • Login • Register'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Property Grid Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Featured Destinations
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Explore our handpicked properties from around the globe.
              </p>
            </div>
            <Link 
              href="/explore" 
              className="text-sm font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors duration-200"
            >
              View all explore listings &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {properties.map((property) => (
              <div key={property.id} className="group relative flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Image Container */}
                <div className="aspect-[4/3] w-full bg-zinc-200 overflow-hidden relative">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-sm flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 fill-amber-400 stroke-none" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                    </svg>
                    {property.rating}
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col p-6">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                    Listing #{property.id}00
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                    <Link href={`/property/${property.id}`} onClick={(e) => e.preventDefault()}>
                      <span className="absolute inset-0" />
                      {property.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {property.location}
                  </p>
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                    <span className="text-lg font-extrabold text-zinc-900 dark:text-zinc-50">
                      {property.price}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                      Free Cancellation
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200/60 dark:border-zinc-800/60 py-12 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>&copy; {new Date().getFullYear()} StayNest Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
