/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff, User, Sparkles, Palette } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import {toast} from "react-hot-toast";

const ArtistLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast("Fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/artists/login`,
        {
          email,
          password,
        }
      );

      const artist = res.data.user;
      localStorage.setItem("token", res.data.token);

      // MAIN LOGIC
      if (artist.status === "approved") {
        navigate("/artist/dashboard");
      } else {
        toast("Your account is not approved yet");
      }

    } catch (error: any) {
      console.error("LOGIN ERROR:", error);

      toast(
        error?.response?.data?.message || "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-[#83261D]/5">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-md mx-auto">

          {/* Header with Animation */}
          <div className="text-center my-8 sm:my-8 animate-fadeInDown">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-full shadow-lg transform transition-transform hover:scale-110 duration-300">
                <Palette size={32} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mt-4 bg-gradient-to-r from-[#83261D] to-[#B45F4A] bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-sm sm:text-base text-gray-500 mt-2">
              Sign in to your artist dashboard
            </p>
          </div>

          {/* Login Form Card */}
          <div className="relative animate-slideUp">
            <div className="absolute inset-0 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-2xl blur-xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 md:p-10">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#83261D]/5 to-transparent rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tl from-[#B45F4A]/5 to-transparent rounded-bl-2xl"></div>
              
              <div className="space-y-5 sm:space-y-6">
                {/* Email Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#83261D] transition-colors" size={18} />
                    <input
                      type="email"
                      placeholder="artist@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm bg-white/50"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#83261D] transition-colors" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm bg-white/50"
                    />
                    {/* <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#83261D] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />} 
                    </button> */}
                  </div>
                </div>

                {/* Forgot Password Link */}
                {/* <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#83261D] hover:text-[#6e1f17] font-medium transition-all hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div> */}

                {/* Login Button */}
                <button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${
                    isLoading
                      ? "opacity-70 cursor-not-allowed"
                      : "hover:shadow-2xl hover:scale-[1.02] active:scale-98"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">New to Unearthify?</span>
                  </div>
                </div>

                {/* Signup Link */}
                <div className="text-center">
                  <Link
                    to="/artist-signup"
                    className="inline-flex items-center gap-2 text-[#83261D] font-semibold hover:text-[#6e1f17] transition-all group"
                  >
                    <User size={16} />
                    <span>Create an Account</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ArtistLogin;