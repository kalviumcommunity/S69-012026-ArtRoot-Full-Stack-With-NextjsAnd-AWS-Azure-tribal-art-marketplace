'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArtworkCard from '@/components/ArtworkCard';
import { API_BASE_URL } from '@/lib/api';
import { ArrowRight, Sparkles, Globe, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

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
}

export default function Home() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/artworks`);
        const data = await response.json();
        if (data.success) {
          setArtworks(data.data.slice(0, 3)); // Show top 3 featured artworks
        }
      } catch (error) {
        console.error('Failed to fetch artworks', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1564399579883-451a5d44e78e?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-amber-500/20 backdrop-blur-md border border-amber-500/30 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="w-4 h-4 text-amber-400 mr-2" />
            <span className="text-amber-100 font-medium text-sm tracking-wide uppercase">Introducing ArtRoot</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Discover the Soul of <span className="text-amber-500">Tribal Art</span>
          </h1>

          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Directly connect with rural artists. Own authentic masterpieces. Preserve cultural heritage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="#artworks" className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-amber-600/30 flex items-center">
              Explore Gallery
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/signup" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md rounded-full font-bold text-lg transition-all">
              Join as Artist
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-24 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why ArtRoot?</h2>
            <div className="w-20 h-1 bg-amber-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Direct to Artist</h3>
              <p className="text-gray-600 leading-relaxed">
                Eliminating middlemen to ensure 100% of the fair value goes directly to the creators and their communities.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Authentic & Verified</h3>
              <p className="text-gray-600 leading-relaxed">
                Every artwork is verified for authenticity, ensuring you receive genuine traditional masterpieces.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cultural Preservation</h3>
              <p className="text-gray-600 leading-relaxed">
                Supporting these art forms helps preserve ancient traditions and stories for future generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artworks Section */}
      <section id="artworks" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Masterpieces</h2>
              <p className="text-gray-600">Handpicked selections from across India</p>
            </div>
            <Link href="/artworks" className="hidden md:flex items-center text-amber-600 font-semibold hover:text-amber-700">
              View All <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Link href="/artworks" className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50">
              View All Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-amber-600/20" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to start your collection?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of art lovers and support tribal communities directly.
          </p>
          <Link href="/signup" className="inline-block px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors">
            Get Started Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
