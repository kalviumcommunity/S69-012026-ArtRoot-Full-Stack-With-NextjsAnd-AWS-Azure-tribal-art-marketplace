'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Palette } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import Link from 'next/link';

export default function ArtistOnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        tribe: '',
        location: '',
        biography: '',
        specialties: '',
        yearsActive: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/artists/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    yearsActive: formData.yearsActive ? parseInt(formData.yearsActive) : undefined
                })
            });

            const data = await res.json();

            if (res.ok) {
                // Update token if new one is provided (role changed from viewer to artist)
                if (data.token) {
                    localStorage.setItem('token', data.token);

                    // Update user object with new artist role
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const updatedUser = { ...currentUser, role: 'artist' };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
                window.dispatchEvent(new Event('auth-change'));
                router.push('/dashboard');
            } else {
                setError(data.error || 'Failed to create artist profile');
            }
        } catch (err) {
            setError('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const tribes = [
        'Warli', 'Gond', 'Madhubani', 'Pattachitra', 'Tanjore',
        'Kalamkari', 'Pichwai', 'Miniature', 'Tribal', 'Folk', 'Other'
    ];

    return (
        <div className="min-h-screen bg-[#E6E1DC] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A24D]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D2691E]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

            <div className="w-full max-w-2xl relative z-10">
                <Link href="/" className="inline-flex items-center text-[#2B2B2B]/60 hover:text-[#D2691E] mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="text-xs uppercase tracking-widest font-sans">Back to Home</span>
                </Link>

                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <div className="bg-[#D2691E] p-4 rounded-full">
                            <Palette className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-[#2B2B2B] mb-2">
                        Complete Your Artist Profile
                    </h1>
                    <p className="font-sans text-[#2B2B2B]/60 text-sm tracking-wide">
                        Tell us about your art and heritage
                    </p>
                </div>

                <div className="bg-white/50 backdrop-blur-sm border border-white/60 p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Tribe */}
                        <div className="space-y-1">
                            <label className="text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60">
                                Tribal Art Form *
                            </label>
                            <select
                                name="tribe"
                                required
                                value={formData.tribe}
                                onChange={(e) => setFormData({ ...formData, tribe: e.target.value })}
                                className="w-full px-4 py-3 bg-[#E6E1DC]/30 border-b border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B]"
                            >
                                <option value="">Select your art tradition</option>
                                {tribes.map(tribe => (
                                    <option key={tribe} value={tribe}>{tribe}</option>
                                ))}
                            </select>
                        </div>

                        {/* Location */}
                        <div className="space-y-1">
                            <label className="text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#E6E1DC]/30 border-b border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B]"
                                placeholder="City, State"
                            />
                        </div>

                        {/* Biography */}
                        <div className="space-y-1">
                            <label className="text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60">
                                About Your Art
                            </label>
                            <textarea
                                name="biography"
                                value={formData.biography}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 bg-[#E6E1DC]/30 border border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B] resize-none"
                                placeholder="Share your artistic journey and the stories behind your work..."
                            />
                        </div>

                        {/* Specialties */}
                        <div className="space-y-1">
                            <label className="text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60">
                                Specialties
                            </label>
                            <input
                                type="text"
                                name="specialties"
                                value={formData.specialties}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-[#E6E1DC]/30 border-b border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B]"
                                placeholder="e.g., Warli painting, Natural dyes, Village scenes"
                            />
                        </div>

                        {/* Years Active */}
                        <div className="space-y-1">
                            <label className="text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/60">
                                Years of Experience
                            </label>
                            <input
                                type="number"
                                name="yearsActive"
                                value={formData.yearsActive}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                className="w-full px-4 py-3 bg-[#E6E1DC]/30 border-b border-[#2B2B2B]/20 outline-none focus:border-[#D2691E] transition-colors font-sans text-[#2B2B2B]"
                                placeholder="10"
                            />
                        </div>

                        {error && <div className="text-red-500 text-xs text-center border border-red-200 bg-red-50 p-2">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#2B2B2B] hover:bg-[#D2691E] text-white font-sans uppercase tracking-widest text-xs py-4 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Profile & Continue'}
                        </button>
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-[#2B2B2B]/60">
                        You can update your profile anytime from your dashboard
                    </p>
                </div>
            </div>
        </div>
    );
}
