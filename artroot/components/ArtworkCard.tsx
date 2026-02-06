import { Share2, Heart, ShoppingCart, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface ArtworkProps {
    artwork: {
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
        stock_quantity: number;
        image?: string;
        artistProfileImage?: string;
    };
}

export default function ArtworkCard({ artwork }: ArtworkProps) {
    const { addToCart } = useCart();
    const router = useRouter();
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart({
            artworkId: artwork.id,
            title: artwork.title,
            artistName: artwork.artistName,
            price: artwork.price,
            image: artwork.image,
            tribe: artwork.tribe,
            available: artwork.available
        });
        setIsAddedToCart(true);
        setTimeout(() => setIsAddedToCart(false), 2000);
    };

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/artworks/${artwork.id}`;
        navigator.clipboard.writeText(url).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div
            onClick={() => router.push(`/artworks/${artwork.id}`)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
        >
            <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                {/* Image display */}
                {artwork.image ? (
                    <Image
                        src={artwork.image}
                        alt={artwork.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={false}
                    />
                ) : (
                    <div className="absolute inset-0 bg-amber-50 flex items-center justify-center text-amber-900/20 font-serif text-4xl">
                        {artwork.tribe} Art
                    </div>
                )}
                <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                                const token = localStorage.getItem('token');
                                if (!token) {
                                    alert('Please login to favorite artworks');
                                    return;
                                }
                                await fetch('/api/favorites', {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ artworkId: artwork.id })
                                });
                                alert('Added to favorites!');
                            } catch (err) {
                                console.error('Failed to favorite:', err);
                            }
                        }}
                        className="p-2 bg-white/90 backdrop-blur rounded-full text-gray-700 hover:text-amber-600 shadow-sm"
                    >
                        <Heart className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleShare}
                        className={`p-2 bg-white/90 backdrop-blur rounded-full shadow-sm transition-colors ${isCopied ? 'text-green-600' : 'text-gray-700 hover:text-amber-600'}`}
                        title="Copy Link"
                    >
                        {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    </button>
                </div>
                {(artwork.stock_quantity !== undefined && artwork.stock_quantity !== null && Number(artwork.stock_quantity) > 0) ? (
                    <span className="absolute top-3 left-3 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                        Available
                    </span>
                ) : (
                    <span className="absolute top-3 left-3 bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                        Sold Out
                    </span>
                )}
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{artwork.tribe}</span>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight mt-1">{artwork.title}</h3>
                    </div>
                    <span className="text-lg font-bold text-gray-900">₹{artwork.price.toLocaleString()}</span>
                </div>

                <p className="text-sm text-gray-500 mb-4">{artwork.medium} • {artwork.size}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-2">
                    <div
                        className={`flex items-center space-x-2 flex-1 min-w-0 ${artwork.artistId ? 'cursor-pointer hover:opacity-80' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (artwork.artistId && !isNaN(Number(artwork.artistId))) {
                                router.push(`/artists/${artwork.artistId}`);
                            }
                        }}
                    >
                        {artwork.artistProfileImage ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 animate-in fade-in duration-500">
                                <img src={artwork.artistProfileImage} alt={artwork.artistName} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 bg-[#E6E1DC] rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#2B2B2B]/30 uppercase">
                                {artwork.artistName.substring(0, 1)}
                            </div>
                        )}
                        <span className="text-sm font-medium text-gray-700 truncate">{artwork.artistName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {(artwork.stock_quantity !== undefined && artwork.stock_quantity !== null && Number(artwork.stock_quantity) > 0) && (
                            <button
                                onClick={handleAddToCart}
                                className={`p-2 rounded-full transition-all ${isAddedToCart ? 'bg-green-500 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
                                title="Add to cart"
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </button>
                        )}
                        <span className="text-amber-600 text-sm font-semibold hover:text-amber-700">
                            View
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
