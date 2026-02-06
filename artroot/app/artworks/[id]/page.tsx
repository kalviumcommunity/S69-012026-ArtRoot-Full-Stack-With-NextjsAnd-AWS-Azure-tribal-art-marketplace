'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { Check, ShoppingBag, Truck, Shield, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Artwork {
  id: number;
  title: string;
  price: number;
  description: string;
  image_url: string;
  additional_images?: string[];
  artist_name: string;
  tribe: string;
  category: string;
  dimensions?: string;
  stock_quantity: number;
}

export default function ArtworkDetail() {
  const params = useParams();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  const images = artwork ? [artwork.image_url, ...(artwork.additional_images || [])] : [];

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
      <div className="pt-24 pb-16 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[4.5fr_5.5fr] gap-12 lg:gap-20 items-start">

          {/* Left: Image Gallery (Manual Carousel) */}
          <div className="px-6 lg:pl-12">
            <div className="sticky top-32 space-y-6 max-w-lg mx-auto lg:ml-auto">
              <div className="relative bg-white aspect-[4/5] overflow-hidden group rounded-2xl shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    src={images[currentImageIdx]}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Manual Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIdx((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 backdrop-blur-sm text-[#2B2B2B] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIdx((prev) => (prev + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 backdrop-blur-sm text-[#2B2B2B] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIdx(idx)}
                      className={`relative flex-shrink-0 w-20 aspect-square rounded-xl overflow-hidden border-2 transition-all ${currentImageIdx === idx ? 'border-[#D2691E] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="px-6 lg:pr-12 lg:pt-0 flex flex-col">

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

            {/* Stock Info */}
            <div className="mb-8 flex items-center gap-3">
              {(artwork.stock_quantity !== undefined && artwork.stock_quantity !== null && Number(artwork.stock_quantity) > 0) ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-sans text-xs uppercase tracking-widest text-green-600 font-bold">
                    In Stock ({artwork.stock_quantity})
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="font-sans text-xs uppercase tracking-widest text-red-500 font-bold">
                    Currently Sold Out
                  </span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-4 max-w-sm mb-12">
              <button
                onClick={handleAddToCart}
                disabled={(artwork.stock_quantity !== undefined && artwork.stock_quantity !== null && Number(artwork.stock_quantity) <= 0) || added}
                className={`w-full py-4 text-center font-sans uppercase tracking-widest text-sm transition-all duration-300 ${added
                  ? 'bg-green-600 text-white cursor-default'
                  : (artwork.stock_quantity !== undefined && artwork.stock_quantity !== null && Number(artwork.stock_quantity) <= 0)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#2B2B2B] text-white hover:bg-[#D2691E]'
                  }`}
              >
                {(artwork.stock_quantity !== undefined && artwork.stock_quantity !== null && Number(artwork.stock_quantity) <= 0) ? 'Out of Stock' : added ? 'Added to Cart' : 'Add to Collection'}
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
