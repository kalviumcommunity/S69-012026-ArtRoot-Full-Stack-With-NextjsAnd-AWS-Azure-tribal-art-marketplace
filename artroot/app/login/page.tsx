'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, Loader2, Eye, EyeOff, LogIn } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [loginType, setLoginType] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth-change'));
        router.push('/');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      if (res.ok) {
        setStep('otp');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Connection failed.');
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
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth-change'));
        router.push('/');
      } else {
        setError(data.error || 'Invalid Code');
      }
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E6E1DC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements matching Tribal Theme */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#C9A24D]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D2691E]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-[#2B2B2B] mb-2">
            ART<span className="text-[#D2691E]">ROOT</span>
          </h1>
          <p className="font-sans text-[#2B2B2B]/60 text-sm tracking-widest uppercase">
            {loginType === 'password' ? 'Member Login' : 'Magic Link Access'}
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-sm border border-white/60 p-8 shadow-sm">
          {/* Toggle */}
          <div className="flex border-b border-[#2B2B2B]/10 mb-8">
            <button
              onClick={() => { setLoginType('password'); setError(''); }}
              className={`flex-1 pb-4 text-xs font-sans uppercase tracking-widest transition-colors ${loginType === 'password' ? 'text-[#D2691E] border-b-2 border-[#D2691E]' : 'text-[#2B2B2B]/40 hover:text-[#2B2B2B]'}`}
            >
              Password
            </button>
            <button
              onClick={() => { setLoginType('otp'); setError(''); setStep('email'); }}
              className={`flex-1 pb-4 text-xs font-sans uppercase tracking-widest transition-colors ${loginType === 'otp' ? 'text-[#D2691E] border-b-2 border-[#D2691E]' : 'text-[#2B2B2B]/40 hover:text-[#2B2B2B]'}`}
            >
              One-Time Code
            </button>
          </div>

          {loginType === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#E6E1DC]/30 border-b border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B] placeholder-[#2B2B2B]/30"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#E6E1DC]/30 border-b border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B] placeholder-[#2B2B2B]/30"
                      placeholder="Enter your password"
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
              </div>

              {error && <div className="text-red-500 text-xs text-center border border-red-200 bg-red-50 p-2">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2B2B2B] hover:bg-[#D2691E] text-white font-sans uppercase tracking-widest text-xs py-4 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log In'}
              </button>
            </form>
          ) : (
            step === 'email' ? (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label className="block text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60 mb-2">Email for Code</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#E6E1DC]/30 border-b border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B] placeholder-[#2B2B2B]/30"
                    placeholder="name@example.com"
                  />
                </div>
                {error && <div className="text-red-500 text-xs text-center border border-red-200 bg-red-50 p-2">{error}</div>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2B2B2B] hover:bg-[#D2691E] text-white font-sans uppercase tracking-widest text-xs py-4 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60">Enter Code</label>
                    <button type="button" onClick={() => setStep('email')} className="text-[10px] text-[#D2691E] hover:underline">Change Email</button>
                  </div>
                  <input
                    type="text"
                    name="otp"
                    required
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    className="w-full px-4 py-3 bg-[#E6E1DC]/30 border-b border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B] text-center tracking-[0.5em] text-lg"
                    placeholder="000000"
                  />
                </div>
                {error && <div className="text-red-500 text-xs text-center border border-red-200 bg-red-50 p-2">{error}</div>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2B2B2B] hover:bg-[#D2691E] text-white font-sans uppercase tracking-widest text-xs py-4 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'verify & enter'}
                </button>
              </form>
            )
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-[#2B2B2B]/60">
            New to ArtRoot?{' '}
            <Link href="/signup" className="text-[#D2691E] border-b border-[#D2691E] pb-0.5 hover:opacity-80 transition-opacity">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}