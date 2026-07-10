"use client";
import { authClient } from "@/lib/auth-client";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, User, Mail, Lock, Image as ImageIcon } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Sign Up | PromptForge";
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [role, setRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const userData = {
      name: name,
      email: email,
      password: password,
      image: image || "",
      role: role,
      plan: "free",
    };

    console.log("Submitting User Data to Better-Auth:", userData);

    try {
      const response = await authClient.signUp.email(userData);

      if (response?.error) {
        console.error("Signup failed response error:", response.error);
        setErrorMessage(response.error.message || "Signup failed. Please try again.");
      } else {
        console.log("Signup Successful!", response);
        router.push("/");
      }
    } catch (error) {
      console.error("Signup Failed with Error:", error);
      setErrorMessage("Something went wrong. Please check your terminal or connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMessage("");
    setIsLoading(true);
    const demoCredentials = {
      email: "recruiter@lifeflow.com",
      password: "Password123!",
    };

    try {
      let response = await authClient.signIn.email(demoCredentials);
      if (response?.error) {
        console.log("Demo user not found, signing up...");
        const signUpResponse = await authClient.signUp.email({
          email: demoCredentials.email,
          password: demoCredentials.password,
          name: "Demo Recruiter",
        });
        if (signUpResponse?.error) {
          setErrorMessage(signUpResponse.error.message || "Demo login failed.");
        } else {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Demo login error:", error);
      setErrorMessage("Something went wrong with the demo login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
        additionalData: {
          role: role,
        },
      });
    } catch (error) {
      console.error("Google Signup Failed with Error:", error);
      setErrorMessage("Google signup failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#030014] text-zinc-900 dark:text-white px-4 py-28 relative transition-colors duration-300">
      {/* Background neon blur glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/5 rounded-2xl p-8 shadow-sm dark:shadow-2xl z-10 transition-colors">
        <div className="text-center mb-6">
          <h2 className="text-zinc-900 dark:text-white text-2xl font-bold tracking-tight">Create Account</h2>
          <p className="text-zinc-555 dark:text-zinc-400 text-xs mt-1">Join LifeFlow Platform</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 text-xs rounded-xl bg-red-500/15 border border-red-500/20 text-red-650 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSignupSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="space-y-1 text-left">
            <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
              <input
                required
                type="text"
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-transparent text-zinc-900 dark:text-white text-sm outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-all placeholder-zinc-400 dark:placeholder-zinc-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1 text-left">
            <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
              <input
                required
                type="email"
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-transparent text-zinc-905 dark:text-white text-sm outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-all placeholder-zinc-400 dark:placeholder-zinc-500"
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

          {/* Image URL Input (Optional) */}
          <div className="space-y-1 text-left">
            <label className="text-zinc-550 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Image URL (Optional)</label>
            <div className="relative">
              <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-505" />
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-transparent text-zinc-905 dark:text-white text-sm outline-none focus:border-rose-500 dark:focus:border-rose-500 transition-all placeholder-zinc-400 dark:placeholder-zinc-500"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>
          </div>

          {/* Role Radio Selector */}
          <div className="space-y-2 pt-1 text-left">
            <label className="text-zinc-555 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider block">Signup As</label>
            <div className="flex gap-6 text-sm text-zinc-800 dark:text-white font-medium">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === "user"}
                  onChange={() => setRole("user")}
                  className="accent-rose-500 h-4 w-4 cursor-pointer"
                />
                Regular User
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="role"
                  value="creator"
                  checked={role === "creator"}
                  onChange={() => setRole("creator")}
                  className="accent-rose-500 h-4 w-4 cursor-pointer"
                />
                Volunteer/Creator
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            isPending={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl py-6 mt-4 shadow-md transition-transform active:scale-[0.99] cursor-pointer"
          >
            Sign Up
          </Button>

          {/* Demo Login Button */}
          <Button
            type="button"
            onClick={handleDemoLogin}
            isPending={isLoading}
            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:hover:bg-rose-955/40 dark:text-rose-400 font-bold rounded-xl py-6 border border-rose-200/50 dark:border-rose-900/30 transition-transform active:scale-[0.99] cursor-pointer"
          >
            Demo Login (Recruiter Access)
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#09090b] px-2 text-zinc-555 dark:text-zinc-400">
              Or sign up with
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignUp}
          isPending={isLoading}
          className="w-full bg-transparent border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-909 dark:text-white font-semibold rounded-xl py-6 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300"
        >
          <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.28c1.92,-1.78 3.02,-4.4 3.02,-7.4c0,-0.68 -0.06,-1.33 -0.17,-2z" fill="#4285F4" />
              <path d="M12,20.6c2.6,0 4.78,-0.86 6.38,-2.3l-3.28,-2.6c-0.9,0.6 -2.06,0.97 -3.1,0.97 -2.39,0 -4.41,-1.61 -5.14,-3.78H3.34v2.68C4.94,18.73 8.24,20.6 12,20.6z" fill="#34A853" />
              <path d="M6.86,12.89c-0.18,-0.55 -0.29,-1.13 -0.29,-1.74s0.1,-1.19 0.29,-1.74V6.73H3.34C2.7,8.01 2.33,9.46 2.33,11s0.37,2.99 1.01,4.27l3.52,-2.74z" fill="#FBBC05" />
              <path d="M12,5.7c1.41,0 2.68,0.49 3.68,1.44l2.76,-2.76C16.78,2.78 14.6,1.9 12,1.9 8.24,1.9 4.94,3.77 3.34,6.73l3.52,2.74C7.59,7.31 9.61,5.7 12,5.7z" fill="#EA4335" />
            </g>
          </svg>
          Google
        </Button>

        <p className="text-center text-xs text-zinc-550 dark:text-zinc-400 mt-5">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-[#38BDF8] hover:underline font-bold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
