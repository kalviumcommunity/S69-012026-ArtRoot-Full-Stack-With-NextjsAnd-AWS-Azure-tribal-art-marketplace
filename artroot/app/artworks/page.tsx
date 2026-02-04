'use client';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { API_BASE_URL } from '@/lib/api';
import { Filter } from 'lucide-react';

interface Artwork {
  id: number;
  title: string;
  price: number;
  image_url: string;
  artist_name: string;
  tribe: string;
}

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTribe, setSelectedTribe] = useState<string | null>(null);

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/artworks`);
      const data = await res.json();
      if (data.success) {
        setArtworks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch artworks', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtworks = selectedTribe
    ? artworks.filter(a => a.tribe.toLowerCase() === selectedTribe.toLowerCase())
    : artworks;

  const tribes = ['Warli', 'Gond', 'Bhil', 'Madhubani']; // Simplify for MVP

  return (
    <div className="min-h-screen bg-[#E6E1DC]">
      {/* Spacer for Fixed Navbar */}
      <div className="h-24 bg-[#E6E1DC]" />

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-12 py-12">
        {/* Sidebar Filter */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
          <div className="flex items-center gap-2 pb-4 border-b border-[#2B2B2B]/10">
            <Filter className="w-4 h-4 text-[#C9A24D]" />
            <h2 className="font-serif text-lg text-[#2B2B2B]">Filters</h2>
          </div>

          <div className="space-y-4">
            <h3 className="font-sans text-xs uppercase tracking-widest text-[#2B2B2B]/50">Tribes</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setSelectedTribe(null)}
                  className={`font-sans text-sm transition-colors ${!selectedTribe ? 'text-[#D2691E] font-medium' : 'text-[#2B2B2B] hover:text-[#D2691E]'}`}
                >
                  All Tribes
                </button>
              </li>
              {tribes.map(tribe => (
                <li key={tribe}>
                  <button
                    onClick={() => setSelectedTribe(tribe)}
                    className={`font-sans text-sm transition-colors ${selectedTribe === tribe ? 'text-[#D2691E] font-medium' : 'text-[#2B2B2B] hover:text-[#D2691E]'}`}
                  >
                    {tribe}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <p className="font-sans text-xs text-[#2B2B2B]/50 uppercase tracking-widest">
              Showing {filteredArtworks.length} Masterpieces
            </p>
            {/* Simple Sort (Placeholder) */}
            <select className="bg-transparent font-sans text-sm text-[#2B2B2B] border-b border-[#2B2B2B]/20 pb-1 focus:outline-none focus:border-[#D2691E]">
              <option>Newest First</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="bg-[#2B2B2B]/10 aspect-[3/4] mb-4" />
                  <div className="h-4 bg-[#2B2B2B]/10 w-3/4 mb-2" />
                  <div className="h-3 bg-[#2B2B2B]/10 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 animate-in fade-in duration-700">
              {filteredArtworks.map(artwork => (
                <ProductCard
                  key={artwork.id}
                  id={artwork.id}
                  title={artwork.title}
                  artist={artwork.artist_name}
                  price={artwork.price}
                  imageUrl={artwork.image_url}
                  tribe={artwork.tribe}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
