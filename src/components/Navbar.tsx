'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, authClient } from '@/lib/auth-client';
import { ChevronDown, User, Activity, LogOut, ShieldCheck, Settings } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isProfileDropdownOpen) return;
    const closeDropdown = () => setIsProfileDropdownOpen(false);
    document.addEventListener('click', closeDropdown);
    return () => document.removeEventListener('click', closeDropdown);
  }, [isProfileDropdownOpen]);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    }
  };

  // Common links for both states
  const commonLinks = [
    { label: 'Home', href: '/' },
    { label: 'Explore Requests', href: '/explore' },
  ];

  // Links specific to logged-out state
  const loggedOutLinks = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  // Links specific to logged-in state
  const loggedInLinks = [
    { label: 'Add Request', href: '/items/add' },
    { label: 'Manage Requests', href: '/items/manage' },
    { label: 'Profile', href: '/profile' },
  ];

  if (user?.role === 'admin') {
    loggedInLinks.push({ label: 'Admin Dashboard', href: '/admin' });
    loggedInLinks.push({ label: 'Manage Donors', href: '/manage-donors' });
  } else if (user?.role === 'creator') {
    loggedInLinks.push({ label: 'Manage Donors', href: '/manage-donors' });
  }

  // Dynamic lists based on authentication state
  const mainLinks = user 
    ? [...commonLinks, ...loggedInLinks] 
    : [...commonLinks, ...loggedOutLinks];

  // Trigger simulated actions
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await authClient.signOut();
      setIsMobileMenuOpen(false);
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const isLinkActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/60 bg-white/80 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/80 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-500/20 group-hover:bg-rose-500 transition-colors duration-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-white"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Life<span className="text-rose-600">Flow</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              {mainLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-sm font-medium transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400 ${
                      active
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                aria-label="Toggle theme"
              >
                {mounted && theme === 'dark' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-amber-500"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M22 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-zinc-600"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                )}
              </button>
              {isPending ? (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-rose-600" />
              ) : user ? (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-3 focus:outline-none cursor-pointer group p-1.5 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-200 border-none bg-transparent"
                  >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-rose-500/25 border border-rose-400 group-hover:scale-105 transition-transform duration-200 overflow-hidden">
                      {user.image ? (
                        <img src={user.image} alt={user.name || 'User'} className="h-full w-full object-cover" />
                      ) : (
                        user.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight group-hover:text-rose-600 dark:group-hover:text-rose-455 transition-colors">
                        {user.name}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-450 dark:text-zinc-500 leading-none mt-0.5">
                        LifeFlow Member
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-650 dark:group-hover:text-zinc-300 transition-colors" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-955 p-4 shadow-xl animate-scale-up z-50">
                      <div className="flex items-center gap-3 pb-3 border-b border-zinc-150 dark:border-zinc-850">
                        <div className="h-10 w-10 rounded-xl bg-rose-505/10 text-rose-655 dark:text-rose-450 flex items-center justify-center font-bold text-base shadow-inner overflow-hidden">
                          {user.image ? (
                            <img src={user.image} alt={user.name || 'User'} className="h-full w-full object-cover" />
                          ) : (
                            user.name ? user.name.charAt(0).toUpperCase() : 'U'
                          )}
                        </div>
                        <div className="flex flex-col text-left overflow-hidden">
                          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{user.name}</span>
                          <span className="text-[10px] text-zinc-455 dark:text-zinc-500 truncate">{user.email}</span>
                        </div>
                      </div>

                      <div className="py-2 space-y-1">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-rose-600 dark:hover:text-rose-450 transition-all duration-150"
                        >
                          <User className="w-4 h-4 text-zinc-450" /> My Profile
                        </Link>
                        <Link
                          href="/items/manage"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-rose-600 dark:hover:text-rose-450 transition-all duration-150"
                        >
                          <Activity className="w-4 h-4 text-zinc-455" /> Manage Requests
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-rose-600 dark:hover:text-rose-450 transition-all duration-150"
                          >
                            <Settings className="w-4 h-4 text-zinc-455" /> Admin Console
                          </Link>
                        )}
                        {(user?.role === 'admin' || user?.role === 'creator') && (
                          <Link
                            href="/manage-donors"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-rose-600 dark:hover:text-rose-450 transition-all duration-150"
                          >
                            <ShieldCheck className="w-4 h-4 text-zinc-455" /> Manage Donors
                          </Link>
                        )}
                      </div>

                      <div className="pt-2 border-t border-zinc-150 dark:border-zinc-850">
                        <button
                          onClick={(e) => {
                            setIsProfileDropdownOpen(false);
                            handleLogout(e);
                          }}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-400 py-2.5 text-xs font-bold transition-colors duration-200 border-none cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/signin"
                    className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-rose-600 dark:hover:text-rose-400 px-3 py-2 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="rounded-full bg-rose-600 hover:bg-rose-500 px-4 h-10 flex items-center justify-center text-sm font-semibold text-white shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 transition-all duration-200"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="rounded-xl p-2 text-zinc-550 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-all duration-200 focus:outline-none cursor-pointer"
                aria-label="Toggle theme"
              >
                {mounted && theme === 'dark' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-amber-500"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M22 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="inline-flex items-center justify-center rounded-xl p-2.5 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 transition-colors duration-200"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer (Sidebar) */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop overlay */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar Container */}
        <div
          className={`fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white dark:bg-zinc-950 p-6 shadow-2xl transition-transform duration-300 ease-out border-l border-zinc-200 dark:border-zinc-800 ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-4">
            <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-600 text-white shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4.5 w-4.5 text-white"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Life<span className="text-rose-600">Flow</span>
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors duration-200"
            >
              <span className="sr-only">Close menu</span>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links list */}
          <div className="mt-6 flex flex-col gap-1">
            {mainLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center rounded-xl px-4 py-3 text-base font-medium transition-colors duration-200 ${
                    active
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 font-semibold'
                      : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User profile & Auth Buttons at bottom */}
          <div className="absolute bottom-6 left-6 right-6 border-t border-zinc-100 dark:border-zinc-900 pt-6">
            {isPending ? (
              <div className="flex justify-center py-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-200 border-t-rose-600" />
              </div>
            ) : user ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{user.name}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 py-3 text-base font-semibold text-zinc-800 dark:text-zinc-200 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 py-3 text-base font-semibold text-zinc-800 dark:text-zinc-200 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-500 py-3 text-base font-semibold text-white shadow-md shadow-rose-500/10 transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
