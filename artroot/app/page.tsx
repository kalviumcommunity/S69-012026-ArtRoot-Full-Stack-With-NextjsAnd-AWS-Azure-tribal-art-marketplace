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
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Carousel from '@/components/Carousel';

interface Artwork {
  id: number;
  title: string;
  artistName: string;
  artistId?: number;
  price: number;
  tribe: string;
  medium: string;
  size: string;
  description: string;
  available: boolean;
  verified: boolean;
  stock_quantity: number;
  image?: string;
  artistProfileImage?: string;
}

// User's specific hero image collection (Stored locally for better performance)
const heroImages = [
  '/hero/102messmanos-weaving-829936.jpg',
  '/hero/xuanduongvan87-wicker-baskets-6526674.jpg',
  '/hero/sharonang-art-1219118.jpg',
  '/hero/luboshouska-pottery-1139047.jpg',
  '/hero/hero3.jpg'
];

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userSession = getUserSession();
    if (userSession) {
      setSession(userSession);
    }
  }, []);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/artworks?isAvailable=true`);
        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        if (data.success) {
          const mappedArtworks = data.data.slice(0, 4).map((a: any) => ({
            id: a.id,
            title: a.title,
            artistName: a.artist_name || 'Tribal Artist',
            artistId: a.artist_id,
            price: a.price,
            tribe: a.tribe,
            medium: a.medium,
            size: a.size,
            description: a.description,
            available: a.is_available,
            verified: a.is_verified,
            stock_quantity: a.stock_quantity,
            image: a.image_url,
            artistProfileImage: a.artist_profile_image
          }));
          setArtworks(mappedArtworks);
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

      {/* 1. Hero Section - 3D Stack Carousel */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden bg-[#1A1A1A]">
        {/* Background Texture/glow */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(210,105,30,0.15)_0%,transparent_70%)]" />

        {/* Carousel Container - Responsive Viewport */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="h-[50vh] md:h-[70vh] w-full md:w-[90vw] relative pointer-events-auto">
            <Carousel
              images={heroImages}
              baseWidth={1000}
              autoplay={true}
              autoplayDelay={4000}
              pauseOnHover={true}
              loop={true}
            />
          </div>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-[#C9A24D]/10 rounded-full blur-[100px] z-0" />

        <div className="max-w-7xl mx-auto w-full relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10">
              <div className="w-2 h-2 rounded-full bg-[#D2691E] animate-pulse" />
              <span className="text-xs font-sans uppercase tracking-[0.2em] text-white/90">Curated Tribal Artifacts</span>
            </div>

            <h1 className="font-serif text-6xl md:text-8xl leading-[0.9] font-bold text-white shadow-sm">
              Raw <br />
              <span className="italic text-[#D2691E]">Origins</span> <br />
              Timeless <br />
              Art.
            </h1>

            <p className="font-sans text-xl text-white/90 max-w-md leading-relaxed border-l-2 border-[#D2691E] pl-8">
              Experience the unadulterated beauty of indigenous Indian art. Directly sourced from the hands that tell the oldest stories.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <Link href="/artworks" className="group relative px-10 py-5 bg-white text-[#2B2B2B] overflow-hidden rounded-full font-sans uppercase text-xs tracking-[0.15em] font-bold hover:shadow-2xl transition-all">
                <span className="relative z-10 flex items-center">Start Collecting <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 bg-[#D2691E] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </Link>
              <Link href="#mission" className="px-10 py-5 border border-white/30 text-white rounded-full font-sans uppercase text-xs tracking-[0.15em] hover:bg-white hover:text-[#2B2B2B] transition-all backdrop-blur-md">
                Our Philosophy
              </Link>
            </div>
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
        {session ? (
          <Link href="/dashboard" className="inline-block px-12 py-5 bg-[#D2691E] text-white font-sans uppercase text-sm tracking-widest rounded-full hover:bg-[#b05516] transition-colors">
            Go to Dashboard
          </Link>
        ) : (
          <Link href="/signup" className="inline-block px-12 py-5 bg-[#D2691E] text-white font-sans uppercase text-sm tracking-widest rounded-full hover:bg-[#b05516] transition-colors">
            Join the Application
          </Link>
        )}
      </section>

      <Footer />
    </div>
  );
}
