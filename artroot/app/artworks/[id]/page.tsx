'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { Check, ShoppingBag, Truck, Shield } from 'lucide-react';

interface Artwork {
  id: number;
  title: string;
  price: number;
  description: string;
  image_url: string;
  artist_name: string;
  tribe: string;
  category: string;
  dimensions?: string;
}

export default function ArtworkDetail() {
  const params = useParams();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (params.id) fetchArtwork(params.id as string);
  }, [params.id]);

  const fetchArtwork = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/artworks/${id}`);
      const data = await res.json();
      if (data.success) {
        setArtwork(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch artwork', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!artwork) return;
    addToCart({
      artworkId: artwork.id,
      title: artwork.title,
      price: artwork.price,
      image: artwork.image_url,
      artistName: artwork.artist_name,
      tribe: artwork.tribe,
      available: true
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E6E1DC] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-[#D2691E]/20 rounded-full mb-4" />
          <p className="font-sans text-[#2B2B2B]/50 uppercase tracking-widest text-xs">Loading Masterpiece...</p>
        </div>
      </div>
    );
  }

  if (!artwork) return <div className="min-h-screen bg-[#E6E1DC] pt-32 text-center text-[#2B2B2B]">Artwork not found.</div>;

  return (
    <div className="min-h-screen bg-[#E6E1DC]">
      <Navbar />

      {/* Product Split Layout */}
      <div className="pt-24 pb-16 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

          {/* Left: Image Gallery (Simple for now) */}
          <div className="px-6 lg:pl-12">
            <div className="bg-gray-200 aspect-[3/4] overflow-hidden sticky top-32">
              <img
                src={artwork.image_url}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="px-6 lg:pr-12 lg:pt-8 flex flex-col justify-center">

            {/* Breadcrumbs / Tags */}
            <div className="flex items-center space-x-2 text-xs font-sans uppercase tracking-widest text-[#2B2B2B]/40 mb-6">
              <Link href="/artworks" className="hover:text-[#D2691E]">Shop</Link>
              <span>/</span>
              <Link href={`/artworks?tribe=${artwork.tribe.toLowerCase()}`} className="hover:text-[#D2691E]">{artwork.tribe}</Link>
            </div>

            <h1 className="font-serif text-4xl md:text-5xl text-[#2B2B2B] leading-tight mb-2">
              {artwork.title}
            </h1>

            <Link href={`/artists/${artwork.artist_name}`} className="font-sans text-[#D2691E] text-sm uppercase tracking-wide mb-8 hover:text-[#C9A24D] transition-colors w-fit">
              By {artwork.artist_name}
            </Link>

            <p className="font-sans text-2xl text-[#2B2B2B] font-medium mb-8">
              ₹{artwork.price.toLocaleString('en-IN')}
            </p>

            <div className="prose prose-sm font-sans text-[#2B2B2B]/70 leading-relaxed mb-12 max-w-md">
              <p>{artwork.description}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-4 max-w-sm mb-12">
              <button
                onClick={handleAddToCart}
                className={`w-full py-4 text-center font-sans uppercase tracking-widest text-sm transition-all duration-300 ${added
                  ? 'bg-green-600 text-white'
                  : 'bg-[#2B2B2B] text-white hover:bg-[#D2691E]'
                  }`}
              >
                {added ? 'Added to Cart' : 'Add to Collection'}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-[#2B2B2B]/10 max-w-sm">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-[#C9A24D]" />
                <div>
                  <h4 className="font-serif text-sm text-[#2B2B2B]">Authentic</h4>
                  <p className="font-sans text-xs text-[#2B2B2B]/50 mt-1">Directly from verified tribal artists.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Truck className="w-5 h-5 text-[#C9A24D]" />
                <div>
                  <h4 className="font-serif text-sm text-[#2B2B2B]">Secure Shipping</h4>
                  <p className="font-sans text-xs text-[#2B2B2B]/50 mt-1">Insured delivery worldwide.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
