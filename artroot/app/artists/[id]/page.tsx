'use client';
import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import ProfileCard from '@/components/ProfileCard';
import { useParams } from 'next/navigation';
import { MapPin, Palette } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export default function ArtistProfilePage() {
    const params = useParams();
    // Assuming params.id is the artist ID.
    const artistId = params.id as string;

    // State
    const [artist, setArtist] = useState<any>(null);
    const [artworks, setArtworks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock artists from the Artists Listing Page (Fallback)
    const MOCK_ARTISTS: Record<string, any> = {
        '1': { id: 1, name: 'Jivya Soma Mashe', tribe: 'Warli', location: 'Maharashtra', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop', biography: 'Jivya Soma Mashe was an Indian artist of the Warli style of tribal art. He is widely credited with establishing Warli painting as a viable artistic form. He was Padmashri honoree.', total_artworks: '50+' },
        '2': { id: 2, name: 'Bhajju Shyam', tribe: 'Gond', location: 'Madhya Pradesh', image: 'https://images.unsplash.com/photo-1544211187-542159676767?q=80&w=1974&auto=format&fit=crop', biography: 'Bhajju Shyam is a central Indian Gond artist. He was awarded the Padma Shri, the fourth highest civilian award of India, in 2018.', total_artworks: '25+' },
        '3': { id: 3, name: 'Baua Devi', tribe: 'Madhubani', location: 'Bihar', image: 'https://images.unsplash.com/photo-1560963689-d12c829e0839?q=80&w=2070&auto=format&fit=crop', biography: 'Baua Devi is a Mithila painting artist from Jitwarpur village of Madhubani district in Bihar. She played a key role in popularizing Madhubani art.', total_artworks: '40+' },
    };

    useEffect(() => {
        const fetchArtistData = async () => {
            let foundArtist = null;

            try {
                // 1. Try fetching real artist details from new API endpoint
                if (!isNaN(Number(artistId))) {
                    const res = await fetch(`/api/artists/${artistId}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.success && data.data) {
                            const real = data.data;
                            foundArtist = {
                                id: real.id,
                                name: real.name || 'Traditional Artist', // From users table
                                image: real.profile_image_url, // Official profile image from DB
                                tribe: real.tribe || 'Tribal Art',
                                location: real.location || 'India',
                                biography: real.biography || 'A custodian of ancient tribal art traditions, preserving cultural heritage through mastery of indigenous techniques.',
                                total_artworks: real.total_artworks
                            };
                        }
                    }
                }
            } catch (error) {
                console.log("Could not fetch real artist details, checking fallback.", error);
            }

            // 2. If valid real artist not found, check mock fallback
            if (!foundArtist && MOCK_ARTISTS[artistId]) {
                const mock = MOCK_ARTISTS[artistId];
                foundArtist = {
                    ...mock
                };
            }

            // Set artist state if we found something
            if (foundArtist) {
                setArtist(foundArtist);
            }

            // 3. Fetch artworks for the gallery
            try {
                if (!isNaN(Number(artistId))) {
                    const res = await fetch(`${API_BASE_URL}/artworks?artistId=${artistId}&isVerified=true&isAvailable=true`);
                    const data = await res.json();

                    if (data.success && data.data.length > 0) {
                        setArtworks(data.data);

                        // Logic to help if we still don't have artist details or image
                        if (!foundArtist) {
                            const firstArt = data.data[0];
                            setArtist({
                                id: firstArt.artist_id,
                                name: firstArt.artist_name,
                                image: firstArt.artist_profile_image,
                                tribe: firstArt.tribe,
                                location: 'India',
                                biography: `A master of ${firstArt.tribe} art.`,
                                total_artworks: data.data.length
                            });
                        } else if (foundArtist && !foundArtist.image && data.data[0].artist_profile_image) {
                            // Enhance existing artist with image from artwork if missing
                            setArtist((prev: any) => ({ ...prev, image: data.data[0].artist_profile_image }));
                        }
                    } else if (!foundArtist) {
                        // Final Safe Fallback if absolutely nothing found
                        setArtist({
                            id: artistId,
                            name: 'Traditional Artist',
                            image: '',
                            tribe: 'Tribal Art',
                            location: 'India',
                            biography: 'No biography available.',
                            total_artworks: 0
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching artworks:', error);
            } finally {
                setLoading(false);
            }
        };

        if (artistId) {
            fetchArtistData();
        }
    }, [artistId]);

    if (loading) return <div className="min-h-screen bg-[#E6E1DC] flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#E6E1DC]">
            <Navbar />

            <div className="pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Standard Artist Hero Section */}
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-20 bg-white rounded-3xl p-8 shadow-sm">

                        {/* Artist Info - Left Side */}
                        <div className="space-y-6 order-2 md:order-1">
                            <div>
                                <h1 className="font-serif text-5xl text-[#2B2B2B] mb-2">{artist?.name}</h1>
                                <span className="inline-block px-4 py-2 bg-[#D2691E]/10 text-[#D2691E] rounded-full font-bold text-sm">
                                    {artist?.tribe} Master
                                </span>
                            </div>

                            <p className="text-gray-600 leading-relaxed text-lg">
                                {artist?.biography}
                            </p>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <MapPin className="text-[#D2691E]" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Location</p>
                                        <p className="font-medium text-gray-900">{artist?.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <Palette className="text-[#D2691E]" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider">Published</p>
                                        <p className="font-medium text-gray-900">{artist?.total_artworks || 0} Artworks</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Artist Image - Right Side */}
                        <div className="relative w-full aspect-[3/4] md:aspect-square rounded-2xl overflow-hidden shadow-lg order-1 md:order-2">
                            <ProfileCard
                                className="w-full h-full"
                                name={artist?.name}
                                title={artist?.tribe ? `${artist.tribe} Artist` : 'Tribal Artist'}
                                handle={artist?.name?.replace(/\s+/g, '').toLowerCase() || 'artist'}
                                status="Verified"
                                contactText="Contact"
                                avatarUrl={artist?.image}
                                showUserInfo={false}
                                enableTilt={true}
                                enableMobileTilt={false}
                                behindGlowEnabled={true}
                                behindGlowColor="rgba(125, 190, 255, 0.67)"
                                innerGradient="linear-gradient(145deg, #60496e8c 0%, #71C4FF44 100%)"
                                grainUrl="data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E"
                                iconUrl="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.12a1.65 1.65 0 0 1 1.65-1.66h2c2.97 0 5.4-2.43 5.4-5.4C21.82 6.03 17.37 2 12 2z'/%3E%3Ccircle cx='13.5' cy='6.5' r='.5' fill='currentColor'/%3E%3Ccircle cx='17.5' cy='10.5' r='.5' fill='currentColor'/%3E%3Ccircle cx='8.5' cy='7.5' r='.5' fill='currentColor'/%3E%3Ccircle cx='6.5' cy='12.5' r='.5' fill='currentColor'/%3E%3C/svg%3E"
                            />
                        </div>
                    </div>

                    {/* Artist's Gallery */}
                    <div className="space-y-8">
                        <h2 className="font-serif text-3xl text-[#2B2B2B] border-b border-gray-200 pb-4">
                            Masterpieces by {artist?.name}
                        </h2>

                        {artworks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {artworks.map((artwork) => (
                                    <ProductCard
                                        key={artwork.id}
                                        id={artwork.id}
                                        title={artwork.title}
                                        artist={artwork.artist_name}
                                        artistId={artwork.artist_id}
                                        price={artwork.price}
                                        imageUrl={artwork.image_url}
                                        tribe={artwork.tribe}
                                        stockQuantity={artwork.stock_quantity}
                                        artistProfileImage={artwork.artist_profile_image}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                No artworks currently available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
