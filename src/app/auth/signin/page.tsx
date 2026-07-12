"use client";
import { authClient } from "@/lib/auth-client";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Sign In | LifeFlow";
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleDemoSignIn = async (emailVal: string, passwordVal: string, nameVal: string, roleVal: string) => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      console.log(`Ensuring demo user exists for ${emailVal}...`);
      await authClient.signUp.email({
        email: emailVal,
        password: passwordVal,
        name: nameVal,
        role: roleVal,
        bloodGroup: "O+",
        contactNumber: "+1234567890",
        lastDonationDate: "",
        medicalEligibility: true,
      } as any);
    } catch (e) {
      console.log("Demo user registration skipped/failed (may already exist).");
    }

    try {
      const response = await authClient.signIn.email({
        email: emailVal,
        password: passwordVal,
      });

      if (response?.error) {
        console.error("Demo login failed error:", response.error);
        setErrorMessage(response.error.message || "Demo login failed.");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Demo login error:", error);
      setErrorMessage("Something went wrong during demo login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSigninSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const credentials = {
      email: cleanEmail,
      password: password,
    };

    console.log("Attempting sign-in with credentials:", { email: cleanEmail });

    try {
      let response = await authClient.signIn.email(credentials);

      if (response?.error) {
        // Fallback for demo users: if they don't exist in the database yet, register them and retry login
        if (cleanEmail === "john@staynest.com" || cleanEmail === "admin@staynest.com") {
          console.log(`Auto-registering demo account for ${cleanEmail}...`);
          try {
            const signupRes = await authClient.signUp.email({
              email: cleanEmail,
              password,
              name: cleanEmail === "john@staynest.com" ? "John Doe" : "Admin User",
              role: cleanEmail === "john@staynest.com" ? "user" : "admin",
              bloodGroup: "O+",
              contactNumber: "+1234567890",
              lastDonationDate: "",
              medicalEligibility: true,
            } as any);

            if (signupRes?.error) {
              console.error("Auto-registration API returned error:", signupRes.error);
            } else {
              console.log("Auto-registration API succeeded!");
            }

            // Retry sign-in
            response = await authClient.signIn.email(credentials);
          } catch (signUpErr) {
            console.error("Auto-registration fallback failed:", signUpErr);
          }
        }
      }

      if (response?.error) {
        console.error("Signin failed response error:", response.error);
        setErrorMessage(response.error.message || "Invalid email or password.");
      } else {
        console.log("Signin Successful!", response);
        router.push("/");
      }
    } catch (error) {
      console.error("Signin unexpected error:", error);
      setErrorMessage("Something went wrong. Please check your backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      console.error("Google Signin Failed with Error:", error);
      setErrorMessage("Google sign-in failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#030014] text-zinc-900 dark:text-white px-4 py-28 relative transition-colors duration-300">
      {/* Background neon blur glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/5 rounded-2xl p-8 shadow-sm dark:shadow-2xl z-10 transition-colors">
        <div className="text-center mb-6">
          <h2 className="text-zinc-900 dark:text-white text-2xl font-bold tracking-tight">Sign In</h2>
          <p className="text-zinc-550 dark:text-zinc-400 text-xs mt-1">Access LifeFlow Platform</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 text-xs rounded-xl bg-red-500/15 border border-red-500/20 text-red-655 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSigninSubmit} className="space-y-4">
          {/* Email Input */}
          <div className="space-y-1 text-left">
            <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
              <input
                required
                type="email"
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-all placeholder-zinc-400 dark:placeholder-zinc-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1 text-left">
            <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-all placeholder-zinc-400 dark:placeholder-zinc-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none cursor-pointer"
                type="button"
                onClick={toggleShowPassword}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-zinc-400 dark:text-zinc-505" />
                ) : (
                  <Eye className="w-4 h-4 text-zinc-400 dark:text-zinc-505" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            isPending={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl py-6 mt-4 shadow-md transition-transform active:scale-[0.99] cursor-pointer"
          >
            Sign In
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#09090b] px-2 text-zinc-550 dark:text-zinc-400">
              Or sign in with
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignIn}
          isPending={isLoading}
          className="w-full bg-transparent border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-900 dark:text-white font-semibold rounded-xl py-6 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
        >
          <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.28c1.92,-1.78 3.02,-4.4 3.02,-7.4c0,-0.68 -0.06,-1.33 -0.17,-2z" fill="#4285F4" />
              <path d="M12,20.6c2.6,0 4.78,-0.86 6.38,-2.3l-3.28,-2.6c-0.9,0.6 -2.06,0.97 -3.1,0.97 -2.39,0 -4.41,-1.61 -5.14,-3.78H3.34v2.68C4.94,18.73 8.24,20.6 12,20.6z" fill="#34A853" />
              <path d="M6.86,12.89c-0.18,-0.55 -0.29,-1.13 -0.29,-1.74s0.1,-1.19 0.29,-1.74V6.73H3.34C2.7,8.01 2.33,9.46 2.33,11s0.37,2.99 1.01,4.27l3.52,-2.74z" fill="#FBBC05" />
              <path d="M12,5.7c1.41,0 2.68,0.49 3.68,1.44l2.76,-2.76C16.78,2.78 14.6,1.9 12,1.9 8.24,1.9 4.94,3.77 3.34,6.73l3.52,2.74C7.59,7.31 9.61,5.7 12,5.7z" fill="#EA4335" />
            </g>
          </svg>
          <span className="text-zinc-900 dark:text-zinc-100 font-bold">Google</span>
        </Button>

        <p className="text-center text-xs text-zinc-550 dark:text-zinc-400 mt-5">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-[#38BDF8] hover:underline font-bold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
