'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Search, Users, Shield, Activity, Sparkles, Clock, ArrowLeft, ArrowRight, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { fetchAllDonors } from '@/lib/get/donors';
import { fetchAllRequests } from '@/lib/get/requests';

export default function AboutPage() {
  const [totalDonors, setTotalDonors] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [urgentRequestsCount, setUrgentRequestsCount] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [donors, requests] = await Promise.all([
          fetchAllDonors(),
          fetchAllRequests()
        ]);
        setTotalDonors(donors.length);
        setTotalRequests(requests.length);
        setUrgentRequestsCount(requests.filter(r => r.urgencyLevel === 'Urgent').length);
      } catch (err) {
        console.error('Error loading stats for About page:', err);
      }
    };
    loadStats();
  }, []);
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors duration-300 relative py-16 md:py-24 overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-rose-400/5 dark:bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Navigation Back */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-450 dark:hover:text-rose-350 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Hero Section */}
        <header className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-650 dark:text-rose-400">
              <Heart className="w-3.5 h-3.5 fill-rose-600" /> About LifeFlow
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-905 dark:text-white">
              Saving Lives, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-500">
                One Drop at a Time
              </span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              LifeFlow is a secure, efficient, and community-driven digital platform dedicated to making blood donation simple, fast, and accessible. We believe that connection saves lives.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/auth/signup"
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-rose-500/20 active:scale-[0.99] flex items-center gap-2 cursor-pointer"
              >
                Join Our Community <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/explore"
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2 cursor-pointer"
              >
                Find a Donor
              </Link>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-red-500/5 rounded-3xl blur-2xl group-hover:scale-105 transition-transform duration-500 pointer-events-none" />
            <div className="relative border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl bg-white dark:bg-zinc-900 flex items-center justify-center p-6 group-hover:border-rose-500/35 transition-all duration-300">
              <Image
                src="/blood_donation_community.png"
                alt="Blood Donation Community Care"
                width={500}
                height={375}
                className="object-contain w-full h-full rounded-2xl group-hover:scale-[1.01] transition-transform duration-500"
                priority
              />
            </div>
          </div>
        </header>

        {/* Mission and Vision Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {/* Mission Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-md hover:border-rose-500/20 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
            <div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p className="text-sm sm:text-base text-zinc-605 dark:text-zinc-400 leading-relaxed">
              "To bridge the gap between blood donors and patients in critical need through a secure, efficient, and community-driven digital platform." We aim to streamline the process of finding and requesting blood to reduce response times in emergencies.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-md hover:border-rose-500/20 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
            <div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-4">
              Our Vision
            </h2>
            <p className="text-sm sm:text-base text-zinc-605 dark:text-zinc-400 leading-relaxed">
              "To ensure that no life is lost due to the lack of blood availability by creating a reliable network of donors and recipients." We envision a world where a safe supply of blood is immediately available to every patient, anywhere, at any time.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-24 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-sm sm:text-base text-zinc-550 dark:text-zinc-400 mt-3 leading-relaxed">
              LifeFlow simplifies the connection between donors and recipients into three easy steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center">
              <div className="h-16 w-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-md text-rose-650 dark:text-rose-400 text-2xl font-black mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Register</h3>
              <p className="text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed max-w-xs">
                Users sign up in less than a minute to join our life-saving community as a potential donor or requester.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center">
              <div className="h-16 w-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-md text-rose-655 dark:text-rose-400 text-2xl font-black mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Search / Post</h3>
              <p className="text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed max-w-xs">
                Patients post urgent requests or search local donors. Donors browse the active feeds for opportunities to give.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center">
              <div className="h-16 w-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-md text-rose-650 dark:text-rose-400 text-2xl font-black mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Connect</h3>
              <p className="text-sm text-zinc-555 dark:text-zinc-400 leading-relaxed max-w-xs">
                Users coordinate details directly through secure phone numbers and transparent hospital location maps.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-24">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-3xl font-bold text-zinc-905 dark:text-white tracking-tight">
              Why Choose Us
            </h2>
            <p className="text-sm sm:text-base text-zinc-550 dark:text-zinc-400 mt-3 leading-relaxed">
              We leverage modern technology to provide a highly secure, reliable, and user-centric network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 text-left">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Verified Network</h3>
              <p className="text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed">
                We are committed to maintaining a high-quality database of active, reliable, and verified blood donors.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 text-left">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-455 flex items-center justify-center mb-6">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Emergency Alerts</h3>
              <p className="text-sm text-zinc-555 dark:text-zinc-400 leading-relaxed">
                Our platform highlights critical "Urgent" blood requests at the top of the grid to grab immediate user attention.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 text-left">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-450 flex items-center justify-center mb-6">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">User Privacy</h3>
              <p className="text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed">
                Security is our priority. User data, profiles, and contact details are handled securely under strict guidelines.
              </p>
            </div>
          </div>
        </section>

        {/* Impact & Statistics */}
        <section className="bg-gradient-to-br from-rose-600 to-red-600 rounded-3xl p-8 md:p-12 text-white shadow-xl mb-24 relative overflow-hidden">
          {/* Decorative glowing blobs inside stats card */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
            {/* Stat 1 */}
            <div className="py-6 md:py-0 md:px-6">
              <span className="text-4xl sm:text-5xl font-black block tracking-tight">{totalDonors}</span>
              <span className="text-sm font-bold uppercase tracking-wider text-rose-100 mt-2 block">
                Total Registered Donors
              </span>
            </div>

            {/* Stat 2 */}
            <div className="py-6 md:py-0 md:px-6">
              <span className="text-4xl sm:text-5xl font-black block tracking-tight">{totalRequests}</span>
              <span className="text-sm font-bold uppercase tracking-wider text-rose-100 mt-2 block">
                Blood Requests Raised
              </span>
            </div>

            {/* Stat 3 */}
            <div className="py-6 md:py-0 md:px-6">
              <span className="text-4xl sm:text-5xl font-black block tracking-tight">{urgentRequestsCount}</span>
              <span className="text-sm font-bold uppercase tracking-wider text-rose-100 mt-2 block">
                Active Urgent Requests
              </span>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-24">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Meet Our Team
            </h2>
            <p className="text-sm sm:text-base text-zinc-550 dark:text-zinc-400 mt-3 leading-relaxed">
              The passionate developer team behind LifeFlow working to support community health and social welfare.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {/* Developer 1 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-rose-100 dark:bg-rose-955 flex items-center justify-center text-rose-600 dark:text-rose-400 text-3xl font-black mb-4">
                JD
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">John Doe</h3>
              <p className="text-xs text-rose-600 dark:text-rose-455 font-semibold mt-1">Lead Developer</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
                Passionate about social welfare and building highly accessible software systems for healthcare.
              </p>
            </div>

            {/* Developer 2 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-rose-100 dark:bg-rose-955 flex items-center justify-center text-rose-600 dark:text-rose-400 text-3xl font-black mb-4">
                AS
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Alex Smith</h3>
              <p className="text-xs text-rose-600 dark:text-rose-455 font-semibold mt-1">UI/UX Designer</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
                Focuses on making complex user flows simple and beautiful to improve conversion rates in emergencies.
              </p>
            </div>

            {/* Developer 3 */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center mx-auto sm:mx-0 sm:col-span-2 lg:col-span-1 sm:max-w-sm sm:w-full lg:max-w-none">
              <div className="h-20 w-20 rounded-full bg-rose-100 dark:bg-rose-955 flex items-center justify-center text-rose-600 dark:text-rose-400 text-3xl font-black mb-4">
                SM
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Sarah Miller</h3>
              <p className="text-xs text-rose-600 dark:text-rose-455 font-semibold mt-1">Community Relations</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
                Maintains relationship with local hospitals and blood banks to expand our network coverage.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-8 md:p-12 shadow-sm text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 to-red-500/5 pointer-events-none" />
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl font-bold text-zinc-905 dark:text-white tracking-tight">
              Ready to Make a Difference?
            </h2>
            <p className="text-sm sm:text-base text-zinc-550 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Every single registration counts. Your decision to join today can be the reason a family gets their loved one back tomorrow.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/auth/signup"
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all duration-200 shadow-lg shadow-rose-500/20 active:scale-[0.99] cursor-pointer"
              >
                Join Our Community
              </Link>
              <Link
                href="/explore"
                className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all duration-200 cursor-pointer border-none"
              >
                Find a Donor
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
