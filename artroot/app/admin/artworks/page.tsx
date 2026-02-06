'use client';
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, ShieldCheck, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Artwork {
    id: number;
    title: string;
    artist_name: string;
    tribe: string;
    price: string;
    image_url: string;
    is_verified: boolean;
    created_at: string;
}

export default function AdminArtworksPage() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchArtworks = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/admin/artworks', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setArtworks(data.data);
            }
        } catch (error) {
            console.error('Failed to load artworks', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArtworks();
    }, []);

    const toggleVerification = async (artworkId: number, currentStatus: boolean) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/artworks', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ artworkId, isVerified: !currentStatus })
            });

            if (res.ok) {
                setArtworks(prev => prev.map(a => a.id === artworkId ? { ...a, is_verified: !currentStatus } : a));
            }
        } catch (error) {
            console.error('Failed to update verification', error);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div>
            <h2 className="font-serif text-3xl text-[#2B2B2B] mb-8">Artwork Verification</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map(art => (
                    <div key={art.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="relative h-48 w-full bg-gray-100">
                            {art.image_url ? (
                                <Image src={art.image_url} alt={art.title} fill className="object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                            )}
                            <div className="absolute top-2 right-2">
                                {art.is_verified ? (
                                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
                                        <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                                    </span>
                                ) : (
                                    <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                        Pending
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="font-serif text-lg font-medium text-[#2B2B2B]">{art.title}</h3>
                            <p className="text-sm text-gray-500 mb-2">by {art.artist_name} ({art.tribe})</p>
                            <p className="font-medium text-[#D2691E] mt-auto">₹{parseFloat(art.price).toLocaleString()}</p>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center gap-2">
                                <Link href={`/artworks/${art.id}`} target="_blank" className="text-xs text-gray-500 hover:text-[#D2691E] flex items-center">
                                    View Details <ExternalLink className="w-3 h-3 ml-1" />
                                </Link>
                                <button
                                    onClick={() => toggleVerification(art.id, art.is_verified)}
                                    className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${art.is_verified
                                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                >
                                    {art.is_verified ? 'Revoke Verification' : 'Verify Artwork'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
