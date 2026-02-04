'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Mail, User, Loader2, Eye, EyeOff, Palette } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'viewer' // 'viewer' or 'artist'
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });
      const data = await res.json();

      if (res.ok) {
        // Send OTP for verification
        const otpRes = await fetch(`${API_BASE_URL}/auth/otp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });

        const otpData = await otpRes.json();

        if (otpRes.ok) {
          setStep('verify');
          setError(''); // Don't show OTP on screen
        } else {
          // If OTP sending fails, still log user in
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('auth-change'));
          router.push('/');
        }
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth-change'));

        // Redirect artists to onboarding page to complete profile
        if (data.user.role === 'artist') {
          router.push('/artist-onboarding');
        } else {
          router.push('/');
        }
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      if (res.ok) {
        alert('OTP resent! Check your email or server console.');
      } else {
        setError('Failed to resend OTP');
      }
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E6E1DC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements matching Tribal Theme */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A24D]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D2691E]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center text-[#2B2B2B]/60 hover:text-[#D2691E] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="text-xs uppercase tracking-widest font-sans">Back to Home</span>
        </Link>

        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold text-[#2B2B2B] mb-2">
            {step === 'register' ? 'Join the Tribe' : 'Verify Your Email'}
          </h1>
          <p className="font-sans text-[#2B2B2B]/60 text-sm tracking-wide">
            {step === 'register' ? 'Start your collection today' : `We sent a code to ${formData.email}`}
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-sm border border-white/60 p-8 shadow-sm">
          {step === 'register' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#E6E1DC]/30 border-b border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B]"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#E6E1DC]/30 border-b border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B]"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#E6E1DC]/30 border-b border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2B2B]/40 hover:text-[#D2691E]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#E6E1DC]/30 border-b border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B]"
                  placeholder="••••••••"
                />
              </div>

              {/* Artist Option */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="role"
                    value="viewer"
                    checked={formData.role === 'viewer'}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#D2691E] focus:ring-[#D2691E]"
                  />
                  <span className="text-sm font-sans text-[#2B2B2B] group-hover:text-[#D2691E] transition-colors">
                    <User className="w-4 h-4 inline mr-1" />
                    Join as a Collector
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="role"
                    value="artist"
                    checked={formData.role === 'artist'}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#D2691E] focus:ring-[#D2691E]"
                  />
                  <span className="text-sm font-sans text-[#2B2B2B] group-hover:text-[#D2691E] transition-colors">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Become an Artist
                  </span>
                </label>
              </div>

              {error && <div className="text-red-500 text-xs text-center border border-red-200 bg-red-50 p-2">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2B2B2B] hover:bg-[#D2691E] text-white font-sans uppercase tracking-widest text-xs py-4 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60">Enter 6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-[#E6E1DC]/30 border-b border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B] text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
              </div>

              {error && <div className="text-red-500 text-xs text-center border border-red-200 bg-red-50 p-2">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2B2B2B] hover:bg-[#D2691E] text-white font-sans uppercase tracking-widest text-xs py-4 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={resendOTP}
                disabled={loading}
                className="w-full text-[#2B2B2B]/60 hover:text-[#D2691E] font-sans text-xs uppercase tracking-widest py-2 transition-colors disabled:opacity-50"
              >
                Resend Code
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-[#2B2B2B]/60">
            Already have an account?{' '}
            <Link href="/login" className="text-[#D2691E] border-b border-[#D2691E] pb-0.5 hover:opacity-80 transition-opacity">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}