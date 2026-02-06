'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
    id: number;
    title: string;
    artist: string;
    price: number;
    imageUrl: string;
    tribe: string;
    stockQuantity?: number;
    artistProfileImage?: string;
}

export default function ProductCard({ id, title, artist, price, imageUrl, tribe, stockQuantity = 1, artistProfileImage }: ProductCardProps) {
    const { addToCart } = useCart();
    const router = useRouter();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
            artworkId: id,
            title,
            price,
            image: imageUrl,
            artistName: artist,
            tribe,
            available: true
        });
    };

    return (
        <div
            onClick={() => router.push(`/artworks/${id}`)}
            className="group block cursor-pointer"
        >
            <div className="relative aspect-[3/4] overflow-hidden bg-[#E6E1DC] mb-5">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img
                    src={imageUrl}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110"
                />

                {/* Sold Out Overlay */}
                {stockQuantity !== undefined && stockQuantity !== null && Number(stockQuantity) <= 0 && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-30 flex items-center justify-center">
                        <span className="font-sans text-xs uppercase tracking-widest text-white border border-white px-4 py-2">Sold Out</span>
                    </div>
                )}

                {/* Quick Add Button (Visible on Hover / Mobile) - Refined */}
                <button
                    onClick={handleAddToCart}
                    disabled={stockQuantity !== undefined && stockQuantity !== null && Number(stockQuantity) <= 0}
                    className={`absolute bottom-6 right-6 p-4 rounded-full shadow-2xl opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out z-20 ${stockQuantity !== undefined && stockQuantity !== null && Number(stockQuantity) <= 0
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-0'
                        : 'bg-[#E6E1DC] text-[#2B2B2B] hover:bg-[#D2691E] hover:text-[#E6E1DC]'
                        }`}
                    aria-label="Add to cart"
                >
                    <ShoppingBag className="w-5 h-5" />
                </button>

                {/* Tribe Badge - Minimalist Tag */}
                <span className="absolute top-6 left-6 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#E6E1DC] mix-blend-difference z-20">
                    {tribe}
                </span>
            </div>

            <div className="space-y-1 text-center md:text-left flex items-start gap-3">
                {artistProfileImage ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 flex-shrink-0 mt-1">
                        <img src={artistProfileImage} alt={artist} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-full bg-[#E6E1DC] flex items-center justify-center text-[10px] font-bold text-[#2B2B2B]/40 flex-shrink-0 mt-1 uppercase">
                        {artist.substring(0, 2)}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg text-[#2B2B2B] group-hover:text-[#D2691E] transition-colors line-clamp-1">
                        {title}
                    </h3>
                    <p className="font-sans text-xs text-[#2B2B2B]/60 uppercase tracking-wide truncate">
                        {artist}
                    </p>
                    <p className="font-sans text-sm font-medium text-[#2B2B2B] pt-1">
                        ₹{price.toLocaleString('en-IN')}
                    </p>
                </div>
            </div>
        </div>
    );
}
