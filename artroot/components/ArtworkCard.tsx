import { Share2, Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';

interface ArtworkProps {
    artwork: {
        id: number;
        title: string;
        artistName: string;
        price: number;
        tribe: string;
        medium: string;
        size: string;
        description: string;
        available: boolean;
        image?: string;
    };
}

export default function ArtworkCard({ artwork }: ArtworkProps) {
    const { addToCart } = useCart();
    const [isAddedToCart, setIsAddedToCart] = useState(false);

    const handleAddToCart = () => {
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

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
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
                    <button className="p-2 bg-white/90 backdrop-blur rounded-full text-gray-700 hover:text-amber-600 shadow-sm">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
                {artwork.available && (
                    <span className="absolute top-3 left-3 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                        Available
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
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <span className="text-sm font-medium text-gray-700 truncate">{artwork.artistName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {artwork.available && (
                            <button
                                onClick={handleAddToCart}
                                className={`p-2 rounded-full transition-all ${isAddedToCart ? 'bg-green-500 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
                                title="Add to cart"
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </button>
                        )}
                        <Link href={`/artworks/${artwork.id}`} className="text-amber-600 text-sm font-semibold hover:text-amber-700">
                            View
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
