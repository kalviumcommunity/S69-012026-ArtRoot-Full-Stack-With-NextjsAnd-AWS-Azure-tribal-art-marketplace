'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ArtistsPage() {
    // Placeholder data - in real app fetch from API
    const artists = [
        { id: 1, name: 'Jivya Soma Mashe', tribe: 'Warli', location: 'Maharashtra', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop' },
        { id: 2, name: 'Bhajju Shyam', tribe: 'Gond', location: 'Madhya Pradesh', image: 'https://images.unsplash.com/photo-1544211187-542159676767?q=80&w=1974&auto=format&fit=crop' },
        { id: 3, name: 'Baua Devi', tribe: 'Madhubani', location: 'Bihar', image: 'https://images.unsplash.com/photo-1560963689-d12c829e0839?q=80&w=2070&auto=format&fit=crop' },
    ];

    return (
        <div className="min-h-screen bg-[#E6E1DC]">
            <Navbar />
            <div className="pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="font-serif text-5xl text-[#2B2B2B] mb-4">Our Artists</h1>
                    <p className="font-sans text-[#2B2B2B]/60 max-w-2xl mb-16">
                        Meet the custodians of India's indigenous heritage. Each artist brings centuries of tradition to life through their unique perspective.
                    </p>

                    <div className="grid md:grid-cols-3 gap-12">
                        {artists.map(artist => (
                            <Link href={`/artists/${artist.id}`} key={artist.id} className="group cursor-pointer block">
                                <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-[#2B2B2B]/5">
                                    {/* Placeholder Image Div */}
                                    {/* Using simple img tag for demo or Image component if available */}
                                    <img src={artist.image} alt={artist.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                                        <span className="text-[#E6E1DC] font-sans text-xs uppercase tracking-widest">{artist.tribe}</span>
                                    </div>
                                </div>
                                <h3 className="font-serif text-2xl text-[#2B2B2B] group-hover:text-[#D2691E] transition-colors">{artist.name}</h3>
                                <p className="font-sans text-sm text-[#2B2B2B]/50 mt-1">{artist.location}</p>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <Link href="/artist-signup" className="inline-block border border-[#2B2B2B] text-[#2B2B2B] px-8 py-4 font-sans text-xs uppercase tracking-widest hover:bg-[#2B2B2B] hover:text-[#E6E1DC] transition-all">
                            Apply as an Artist
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
