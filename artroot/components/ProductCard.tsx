'use client';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
    id: number;
    title: string;
    artist: string;
    price: number;
    imageUrl: string;
    tribe: string;
}

export default function ProductCard({ id, title, artist, price, imageUrl, tribe }: ProductCardProps) {
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
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
        <Link href={`/artworks/${id}`} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-[#E6E1DC] mb-5">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <img
                    src={imageUrl}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-[1.5s] ease-in-out group-hover:scale-110"
                />

                {/* Quick Add Button (Visible on Hover / Mobile) - Refined */}
                <button
                    onClick={handleAddToCart}
                    className="absolute bottom-6 right-6 p-4 bg-[#E6E1DC] text-[#2B2B2B] rounded-full shadow-2xl opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out hover:bg-[#D2691E] hover:text-[#E6E1DC] z-20"
                    aria-label="Add to cart"
                >
                    <ShoppingBag className="w-5 h-5" />
                </button>

                {/* Tribe Badge - Minimalist Tag */}
                <span className="absolute top-6 left-6 text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-[#E6E1DC] mix-blend-difference z-20">
                    {tribe}
                </span>
            </div>

            <div className="space-y-1 text-center md:text-left">
                <h3 className="font-serif text-lg text-[#2B2B2B] group-hover:text-[#D2691E] transition-colors line-clamp-1">
                    {title}
                </h3>
                <p className="font-sans text-xs text-[#2B2B2B]/60 uppercase tracking-wide">
                    {artist}
                </p>
                <p className="font-sans text-sm font-medium text-[#2B2B2B] pt-1">
                    ₹{price.toLocaleString('en-IN')}
                </p>
            </div>
        </Link>
    );
}
