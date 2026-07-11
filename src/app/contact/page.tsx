'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, HelpCircle, ArrowLeft, Check, AlertCircle, MessageSquare } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setShowToast(false);

    const formData = { name, email, subject, message };

    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof FormValues] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    // Simulate sending message to backend
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setShowToast(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How do I register as a blood donor?',
      a: 'Simulate logging in using the simulator console on the homepage, then navigate to "Become a Donor" to submit your registration details.'
    },
    {
      q: 'How is the contact information verified?',
      a: 'We encourage all coordinators to verify donor phone numbers. Our team actively updates status flags to ensure database integrity.'
    },
    {
      q: 'Is my personal information kept secure?',
      a: 'Yes, donor contact details are only shared to connect patients in emergency situations and are processed securely.'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-white transition-colors duration-300 relative py-16 md:py-24 overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] bg-rose-400/5 dark:bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-emerald-600 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-3 animate-slide-in border border-emerald-500">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
            <p className="text-xs text-emerald-100 mt-0.5">Thank you for reaching out; we will get back to you shortly.</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Navigation back */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-450 dark:hover:text-rose-350 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Header */}
        <header className="max-w-3xl mb-16 text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-650 dark:text-rose-400">
            <MessageSquare className="w-3.5 h-3.5 fill-rose-600/10" /> Get In Touch
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-905 dark:text-white mt-3">
            We are Here to Help
          </h1>
          <p className="text-base sm:text-lg text-zinc-550 dark:text-zinc-400 mt-3 leading-relaxed">
            Need urgent support, have a question, or want to collaborate? Contact the LifeFlow team.
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          
          {/* Contact Details & Info (Left) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Info Cards */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Contact Information</h2>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-655 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 block uppercase">Email Support</span>
                    <a href="mailto:support@lifeflow.org" className="text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-rose-600 transition-colors">
                      support@lifeflow.org
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-655 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-505 block uppercase">Phone Number</span>
                    <a href="tel:+8801952860053" className="text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-rose-600 transition-colors">
                      +880 195-286-0053
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-655 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-505 block uppercase">Office Address</span>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      123 LifeFlow Plaza, Dhanmondi, Dhaka, Bangladesh
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Media Link */}
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-405 dark:text-zinc-505 block mb-3 uppercase">Connect with us</span>
                <div className="flex gap-3">
                  <a href="#" className="h-10 w-10 rounded-xl bg-zinc-100 hover:bg-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-600 text-zinc-600 hover:text-white dark:text-zinc-400 transition-all flex items-center justify-center cursor-pointer border-none">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="h-10 w-10 rounded-xl bg-zinc-100 hover:bg-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-600 text-zinc-600 hover:text-white dark:text-zinc-400 transition-all flex items-center justify-center cursor-pointer border-none">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="#" className="h-10 w-10 rounded-xl bg-zinc-100 hover:bg-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-600 text-zinc-600 hover:text-white dark:text-zinc-400 transition-all flex items-center justify-center cursor-pointer border-none">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.71.054 1.139.052 1.9.24 2.502.475a4.822 4.822 0 011.66 1.086 4.7 4.7 0 011.085 1.66c.237.6.425 1.362.477 2.502.044.93.054 1.284.054 3.71 0 2.43-.01 2.784-.054 3.71-.052 1.14-.24 1.9-.475 2.502a4.822 4.822 0 01-1.086 1.66 4.7 4.7 0 01-1.66 1.085c-.6.237-1.363.425-2.502.477-.93.044-1.284.054-3.71.054-2.43 0-2.784-.01-3.71-.054-1.139-.052-1.9-.24-2.502-.475a4.822 4.822 0 01-1.66-1.086 4.7 4.7 0 01-1.085-1.66c-.237-.6-.425-1.363-.477-2.502-.044-.93-.054-1.284-.054-3.71 0-2.43.01-2.784.054-3.71.052-1.14.24-1.9.475-2.502a4.822 4.822 0 011.086-1.66 4.7 4.7 0 011.66-1.085c.6-.237 1.363-.42 2.502-.477.93-.044 1.284-.054 3.71-.054zM12 5.76a6.24 6.24 0 100 12.48 6.24 6.24 0 000-12.48zm0 10.28a4.04 4.04 0 110-8.08 4.04 4.04 0 010 8.08zm5.72-10.2a1.08 1.08 0 100 2.16 1.08 1.08 0 000-2.16z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="h-10 w-10 rounded-xl bg-zinc-100 hover:bg-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-600 text-zinc-600 hover:text-white dark:text-zinc-400 transition-all flex items-center justify-center cursor-pointer border-none">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Support Accordeon / FAQ Quick Links */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 md:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
                <HelpCircle className="w-5 h-5 text-rose-600" /> FAQ Quick Answers
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="pb-4 border-b border-zinc-100 dark:border-zinc-800/80 last:border-0 last:pb-0 text-left">
                    <h4 className="text-sm font-bold text-zinc-850 dark:text-zinc-200">{faq.q}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form (Right) */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 text-left">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name */}
              <div className="space-y-1 text-left">
                <label className="text-zinc-500 dark:text-zinc-405 text-xs font-bold uppercase tracking-wider block">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. John Doe"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 transition-all ${
                    errors.name ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && <p className="text-xs text-rose-600 font-bold mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1 text-left">
                <label className="text-zinc-500 dark:text-zinc-405 text-xs font-bold uppercase tracking-wider block">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="e.g. john@example.com"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-transparent text-zinc-905 dark:text-white text-sm outline-none focus:border-rose-500 transition-all ${
                    errors.email ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-xs text-rose-600 font-bold mt-1">{errors.email}</p>}
              </div>

              {/* Subject */}
              <div className="space-y-1 text-left">
                <label className="text-zinc-500 dark:text-zinc-405 text-xs font-bold uppercase tracking-wider block">Subject</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Question about donation process"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-transparent text-zinc-905 dark:text-white text-sm outline-none focus:border-rose-500 transition-all ${
                    errors.subject ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                {errors.subject && <p className="text-xs text-rose-600 font-bold mt-1">{errors.subject}</p>}
              </div>

              {/* Message */}
              <div className="space-y-1 text-left">
                <label className="text-zinc-500 dark:text-zinc-405 text-xs font-bold uppercase tracking-wider block">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you need help with..."
                  className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50 dark:bg-transparent text-zinc-905 dark:text-white text-sm outline-none focus:border-rose-500 transition-all resize-none ${
                    errors.message ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {errors.message && <p className="text-xs text-rose-600 font-bold mt-1">{errors.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl py-3.5 transition-all duration-200 shadow-lg shadow-rose-500/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-white" />
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Mockup Map Embed (Added Credibility) */}
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-4 shadow-sm overflow-hidden h-96 relative group">
          <div className="absolute inset-0 bg-zinc-200/30 dark:bg-zinc-950/20 pointer-events-none z-10" />
          <iframe
            title="Google Map mockup for LifeFlow"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3652.2274488812604!2d90.37213897607759!3d23.7392618892182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b33c892fb7%3A0x2774a7065732c58b!2sDhanmondi%20Lake!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'grayscale(0.3) contrast(1.1)' }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-2xl transition-all duration-500 group-hover:scale-[1.005]"
          />
        </section>
      </div>
    </div>
  );
}
