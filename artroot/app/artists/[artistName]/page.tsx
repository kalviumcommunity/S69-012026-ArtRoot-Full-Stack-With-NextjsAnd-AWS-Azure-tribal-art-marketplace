'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { API_BASE_URL } from '@/lib/api';
import { Palette, MapPin, Calendar, Award } from 'lucide-react';

interface Artist {
    id: number;
    name: string;
    email: string;
    tribe: string;
    location?: string;
    biography?: string;
    profile_image_url?: string;
    years_active?: number;
    specialties?: string;
    total_artworks: number;
    available_artworks: number;
}

interface Artwork {
    id: number;
    title: string;
    price: number;
    image_url: string;
    tribe: string;
    artist_name: string;
    stock_quantity: number;
    artist_profile_image?: string;
}

export default function ArtistProfilePage() {
    const params = useParams();
    const artistName = params.artistName as string;
    const [artist, setArtist] = useState<Artist | null>(null);
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (artistName) {
            fetchArtistData();
        }
    }, [artistName]);

    const fetchArtistData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all artworks and filter by artist name
            const artworksResponse = await fetch(`${API_BASE_URL}/artworks`);
            const artworksData = await artworksResponse.json();

            if (artworksData.success) {
                const artistArtworks = artworksData.data.filter(
                    (artwork: Artwork) => artwork.artist_name === decodeURIComponent(artistName)
                );
                setArtworks(artistArtworks);

                // Get artist info from the first artwork
                if (artistArtworks.length > 0) {
                    setArtist({
                        id: 0, // We don't have artist ID from artworks
                        name: artistArtworks[0].artist_name,
                        email: '',
                        tribe: artistArtworks[0].tribe,
                        location: '',
                        biography: '',
                        profile_image_url: artistArtworks[0].artist_profile_image,
                        years_active: 0,
                        specialties: '',
                        total_artworks: artistArtworks.length,
                        available_artworks: artistArtworks.filter((a: Artwork) => a.stock_quantity > 0).length
                    });
                } else {
                    setError('Artist not found');
                }
            }
        } catch (err) {
            console.error('Error fetching artist data:', err);
            setError('Failed to load artist profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAF9F6]">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !artist) {
        return (
            <div className="min-h-screen bg-[#FAF9F6]">
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                    <h1 className="text-4xl font-serif text-gray-900 mb-4">Artist Not Found</h1>
                    <p className="text-gray-600 mb-8">{error || 'The artist you are looking for does not exist.'}</p>
                    <a href="/artists" className="text-amber-600 hover:text-amber-700 underline">
                        View All Artists
                    </a>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            <Navbar />

            {/* Artist Header */}
            <div className="bg-gradient-to-b from-amber-50 to-[#FAF9F6] border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Profile Image */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0 bg-gray-200">
                            {artist.profile_image_url ? (
                                <img
                                    src={artist.profile_image_url}
                                    alt={artist.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-gray-400">
                                    {artist.name[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Artist Info */}
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-4">
                                {artist.name}
                            </h1>

                            <div className="flex flex-wrap gap-4 mb-6">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Palette className="w-5 h-5 text-amber-600" />
                                    <span className="text-sm font-sans uppercase tracking-wide">{artist.tribe}</span>
                                </div>
                                {artist.location && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-5 h-5 text-amber-600" />
                                        <span className="text-sm">{artist.location}</span>
                                    </div>
                                )}
                                {artist.years_active && artist.years_active > 0 && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Calendar className="w-5 h-5 text-amber-600" />
                                        <span className="text-sm">{artist.years_active} years active</span>
                                    </div>
                                )}
                                {artist.specialties && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Award className="w-5 h-5 text-amber-600" />
                                        <span className="text-sm">{artist.specialties}</span>
                                    </div>
                                )}
                            </div>

                            {artist.biography && (
                                <p className="text-gray-700 leading-relaxed max-w-3xl">
                                    {artist.biography}
                                </p>
                            )}

                            <div className="flex gap-6 mt-6 pt-6 border-t border-gray-200">
                                <div>
                                    <div className="text-3xl font-bold text-amber-600">{artist.total_artworks}</div>
                                    <div className="text-sm text-gray-600 uppercase tracking-wide">Total Artworks</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-green-600">{artist.available_artworks}</div>
                                    <div className="text-sm text-gray-600 uppercase tracking-wide">Available</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Artworks Grid */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <h2 className="text-3xl font-serif text-gray-900 mb-8">Artworks by {artist.name}</h2>

                {artworks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {artworks.map((artwork) => (
                            <ProductCard
                                key={artwork.id}
                                id={artwork.id}
                                title={artwork.title}
                                artist={artwork.artist_name}
                                price={artwork.price}
                                imageUrl={artwork.image_url}
                                tribe={artwork.tribe}
                                stockQuantity={artwork.stock_quantity}
                                artistProfileImage={artwork.artist_profile_image}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600">No artworks available at the moment.</p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
