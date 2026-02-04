'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArtworkCard from '@/components/ArtworkCard';
import { API_BASE_URL } from '@/lib/api';
import { ArrowRight, Sparkles, Globe, ShieldCheck, Palette, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserSession } from '@/lib/auth';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Artwork {
  id: number;
  title: string;
  artistName: string;
  price: number;
  tribe: string;
  medium: string;
  size: string;
  description: string;
  available: boolean;
  verified: boolean;
  image?: string;
}

export default function Home() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  // Parallax ref removed to fix hydration error


  useEffect(() => {
    const session = getUserSession();
    if (session) {
      // Optional: Redirect or just show home
    }
  }, [router]);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/artworks`);
        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        if (data.success) {
          // Add sample images if missing
          const artWithImages = data.data.slice(0, 4).map((a: Artwork, i: number) => ({
            ...a,
            image: a.image || [
              'https://images.unsplash.com/photo-1628194481358-034870c97800?q=80&w=2940&auto=format&fit=crop', // Warli
              'https://images.unsplash.com/photo-1596521575012-7067882200dc?q=80&w=2940&auto=format&fit=crop', // Gond
              'https://images.unsplash.com/photo-1605330364372-74cda112701d?q=80&w=2940&auto=format&fit=crop', // Madhubani
              'https://images.unsplash.com/photo-1549887552-93f8efb4133f?q=80&w=2940&auto=format&fit=crop'
            ][i]
          }));
          setArtworks(artWithImages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtworks();
  }, []);

  return (
    <div className="min-h-screen bg-[#E6E1DC] text-[#2B2B2B] overflow-x-hidden selection:bg-[#D2691E] selection:text-white">
      <Navbar />

      {/* 1. Hero Section - Minimalist & Bold */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-[#C9A24D]/10 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D2691E]/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2B2B2B]/10 bg-white/30 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-[#D2691E]" />
              <span className="text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/70">Curated Tribal Marketplace</span>
            </div>

            <h1 className="font-serif text-6xl md:text-8xl leading-[0.9] font-bold text-[#2B2B2B]">
              Raw <br />
              <span className="italic text-[#D2691E]">Origins</span> <br />
              Timeless <br />
              Art.
            </h1>

            <p className="font-sans text-lg text-[#2B2B2B]/70 max-w-md leading-relaxed border-l-2 border-[#D2691E] pl-6">
              Experience the unadulterated beauty of indigenous Indian art. Directly sourced from the hands that tell the oldest stories.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/artworks" className="group relative px-8 py-4 bg-[#2B2B2B] text-white overflow-hidden rounded-full font-sans uppercase text-sm tracking-widest hover:shadow-xl transition-all">
                <span className="relative z-10 flex items-center">Start Collecting <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 bg-[#D2691E] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </Link>
              <Link href="#mission" className="px-8 py-4 border border-[#2B2B2B]/20 rounded-full font-sans uppercase text-sm tracking-widest hover:bg-[#2B2B2B] hover:text-white transition-all">
                Our Philosophy
              </Link>
            </div>
          </motion.div>

          {/* Hero Image / Collage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[600px] w-full hidden lg:block"
          >
            <div className="absolute top-10 right-10 w-80 h-[500px] bg-white p-2 shadow-2xl rotate-3 z-20">
              <img src="https://images.unsplash.com/photo-1628194481358-034870c97800?q=80&w=2940&auto=format&fit=crop" alt="Warli Art" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="absolute top-20 left-20 w-80 h-[450px] bg-white p-2 shadow-xl -rotate-6 z-10">
              <img src="https://images.unsplash.com/photo-1596521575012-7067882200dc?q=80&w=2940&auto=format&fit=crop" alt="Gond Art" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#D2691E] rounded-full mix-blend-multiply blur-2xl animate-pulse" />
          </motion.div>

        </div>
      </section>

      {/* 2. Scrolling Marquee / Manifesto */}
      <div className="bg-[#2B2B2B] py-8 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee">
          <span className="text-4xl md:text-6xl font-serif text-[#E6E1DC] mx-8 italic opacity-50">Preserving Culture</span>
          <span className="text-4xl md:text-6xl font-serif text-[#E6E1DC] mx-8">•</span>
          <span className="text-4xl md:text-6xl font-serif text-[#E6E1DC] mx-8 italic opacity-50">Empowering Artists</span>
          <span className="text-4xl md:text-6xl font-serif text-[#E6E1DC] mx-8">•</span>
          <span className="text-4xl md:text-6xl font-serif text-[#E6E1DC] mx-8 italic opacity-50">Authentic & Verified</span>
          <span className="text-4xl md:text-6xl font-serif text-[#E6E1DC] mx-8">•</span>
          <span className="text-4xl md:text-6xl font-serif text-[#E6E1DC] mx-8 italic opacity-50">Preserving Culture</span>
          <span className="text-4xl md:text-6xl font-serif text-[#E6E1DC] mx-8">•</span>
          <span className="text-4xl md:text-6xl font-serif text-[#E6E1DC] mx-8 italic opacity-50">Empowering Artists</span>
        </div>
      </div>

      {/* 3. Featured Collection */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h3 className="font-sans text-xs uppercase tracking-widest text-[#D2691E] mb-2">Curated Selection</h3>
            <h2 className="font-serif text-4xl md:text-5xl text-[#2B2B2B]">Featured Masterpieces</h2>
          </div>
          <Link href="/artworks" className="group flex items-center font-sans uppercase text-xs tracking-widest border-b border-[#2B2B2B] pb-1 hover:text-[#D2691E] hover:border-[#D2691E] transition-colors">
            View All Collection <ArrowRight className="ml-2 w-4 h-4 group-hover:ml-3 transition-all" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-96 bg-[#2B2B2B]/5 animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {artworks.map((artwork, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={artwork.id}
              >
                <ArtworkCard artwork={artwork} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Why We Exist (Values) */}
      <section id="mission" className="py-24 bg-[#Dcd7d2] px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 p-8 border border-[#2B2B2B]/5 hover:border-[#D2691E]/50 transition-colors bg-[#E6E1DC]">
            <Users className="w-10 h-10 text-[#D2691E]" />
            <h3 className="font-serif text-2xl">Artist First</h3>
            <p className="font-sans text-[#2B2B2B]/70 leading-relaxed text-sm">
              We eliminate middlemen. You buy directly from authenticated tribal artists, ensuring 100% fair compensation.
            </p>
          </div>
          <div className="space-y-4 p-8 border border-[#2B2B2B]/5 hover:border-[#D2691E]/50 transition-colors bg-[#E6E1DC]">
            <ShieldCheck className="w-10 h-10 text-[#D2691E]" />
            <h3 className="font-serif text-2xl">Verified Authenticity</h3>
            <p className="font-sans text-[#2B2B2B]/70 leading-relaxed text-sm">
              Every piece comes with a blockchain-verified certificate of authenticity, tracking its origin back to the village.
            </p>
          </div>
          <div className="space-y-4 p-8 border border-[#2B2B2B]/5 hover:border-[#D2691E]/50 transition-colors bg-[#E6E1DC]">
            <Globe className="w-10 h-10 text-[#D2691E]" />
            <h3 className="font-serif text-2xl">Global Heritage</h3>
            <p className="font-sans text-[#2B2B2B]/70 leading-relaxed text-sm">
              Preserving dying art forms by giving them a global platform. Your purchase helps sustain ancient traditions.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Minimal CTA */}
      <section className="py-32 text-center px-6">
        <h2 className="font-serif text-5xl md:text-7xl text-[#2B2B2B] mb-8">
          Own a piece of <br /> <span className="italic text-[#D2691E]">History.</span>
        </h2>
        <Link href="/signup" className="inline-block px-12 py-5 bg-[#D2691E] text-white font-sans uppercase text-sm tracking-widest rounded-full hover:bg-[#b05516] transition-colors">
          Join the Application
        </Link>
      </section>

      <Footer />
    </div>
  );
}
