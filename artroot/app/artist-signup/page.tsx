'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, Palette, Globe, DollarSign } from 'lucide-react';

export default function ArtistSignupHelperPage() {
    return (
        <div className="min-h-screen bg-[#E6E1DC]">
            <Navbar />
            <div className="pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-6">

                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h1 className="font-serif text-5xl text-[#2B2B2B] mb-6">Join the Collective</h1>
                        <p className="font-sans text-[#2B2B2B]/60 text-lg">
                            We empower authentic tribal artists by providing a global platform, fair pricing, and logistical support. Share your heritage with the world.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 mb-20">
                        <div className="bg-white/40 p-10 border border-[#2B2B2B]/5 text-center">
                            <Globe className="w-10 h-10 text-[#D2691E] mx-auto mb-6" />
                            <h3 className="font-serif text-xl text-[#2B2B2B] mb-4">Global Reach</h3>
                            <p className="font-sans text-sm text-[#2B2B2B]/60">Your art will be exhibited to collectors in New York, London, and Tokyo without you leaving your studio.</p>
                        </div>
                        <div className="bg-white/40 p-10 border border-[#2B2B2B]/5 text-center">
                            <DollarSign className="w-10 h-10 text-[#D2691E] mx-auto mb-6" />
                            <h3 className="font-serif text-xl text-[#2B2B2B] mb-4">Fair Earnings</h3>
                            <p className="font-sans text-sm text-[#2B2B2B]/60">We take a minimal commission. You set your prices, and you get paid directly upon sale confirmation.</p>
                        </div>
                        <div className="bg-white/40 p-10 border border-[#2B2B2B]/5 text-center">
                            <Palette className="w-10 h-10 text-[#D2691E] mx-auto mb-6" />
                            <h3 className="font-serif text-xl text-[#2B2B2B] mb-4">Curatorial Support</h3>
                            <p className="font-sans text-sm text-[#2B2B2B]/60">Our team helps with photography, storytelling, and verifying authenticity to increase value.</p>
                        </div>
                    </div>

                    <div className="bg-[#2B2B2B] text-[#E6E1DC] p-12 md:p-20 text-center">
                        <h2 className="font-serif text-3xl mb-6">Ready to showcase your art?</h2>
                        <div className="flex justify-center gap-6">
                            <Link href="/signup?role=artist" className="bg-[#D2691E] hover:bg-[#C9A24D] text-white px-8 py-4 font-sans text-xs uppercase tracking-widest transition-all inline-flex items-center">
                                Create Artist Account <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </div>
                        <p className="mt-6 text-xs font-sans text-[#E6E1DC]/40 uppercase tracking-widest">
                            Verification required. Please have your portfolio ready.
                        </p>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}
