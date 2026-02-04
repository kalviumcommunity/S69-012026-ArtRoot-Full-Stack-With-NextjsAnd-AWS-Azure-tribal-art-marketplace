'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#2B2B2B]">
            {/* Background Image / Texture */}
            <div
                className="absolute inset-0 opacity-50 mix-blend-overlay transition-opacity duration-1000 ease-out"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=2690&auto=format&fit=crop')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            {/* Overlay Gradient - Refined for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#2B2B2B]/30 via-[#2B2B2B]/20 to-[#2B2B2B]" />

            <div className="relative z-10 text-center px-4 max-w-5xl mx-auto space-y-10">
                <p className="font-sans text-[#C9A24D] tracking-[0.3em] uppercase text-xs md:text-sm font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    The Soul of Heritage
                </p>

                <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-[#E6E1DC] leading-none tracking-tight animate-in fade-in zoom-in-95 duration-1000 delay-300">
                    Indian <span className="italic font-light text-[#D2691E]">Tribal</span> Art
                </h1>

                <p className="font-sans text-[#E6E1DC]/90 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed tracking-wide animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    Curated masterpieces from the heart of India's indigenous communities. <br className="hidden md:block" />
                    Authentic, timeless, and ethically sourced.
                </p>

                <div className="pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
                    <Link
                        href="/artworks"
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-[#D2691E] text-white font-sans tracking-widest text-sm uppercase hover:bg-[#C9A24D] transition-all duration-300"
                    >
                        Explore Collection
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce opacity-50">
                <div className="w-px h-16 bg-[#E6E1DC]" />
            </div>
        </section>
    );
}
