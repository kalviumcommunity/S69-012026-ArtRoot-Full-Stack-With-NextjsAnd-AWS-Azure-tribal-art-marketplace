'use client';
import { useCart } from '@/contexts/CartContext';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
    const router = useRouter();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#E6E1DC]">
                <Navbar />
                <div className="pt-32 pb-16 flex items-center justify-center min-h-[60vh]">
                    <div className="max-w-7xl mx-auto px-6 text-center animate-in fade-in duration-700">
                        <ShoppingBag className="w-16 h-16 text-[#2B2B2B]/20 mx-auto mb-6" />
                        <h2 className="font-serif text-3xl text-[#2B2B2B] mb-4">Your collection is empty</h2>
                        <p className="font-sans text-[#2B2B2B]/60 mb-8 max-w-md mx-auto">
                            The canvas is blank. Discover authentic tribal masterpieces to fill it.
                        </p>
                        <Link
                            href="/artworks"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-[#D2691E] hover:bg-[#C9A24D] text-[#E6E1DC] font-sans text-sm uppercase tracking-widest transition-all duration-300"
                        >
                            Explore Gallery
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E6E1DC]">
            <Navbar />
            <div className="pt-32 pb-24">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <h1 className="font-serif text-4xl text-[#2B2B2B] mb-12">Your Collection</h1>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {cart.map((item) => (
                                <div key={item.artworkId} className="bg-white/40 backdrop-blur-sm p-6 flex gap-6 border border-[#2B2B2B]/5 transition-all hover:bg-white/60">
                                    {/* Image */}
                                    <div className="relative w-24 h-32 flex-shrink-0 bg-[#2B2B2B]/5 overflow-hidden">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center font-sans text-xs text-[#2B2B2B]/40 uppercase">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-sans text-[10px] font-bold text-[#D2691E] uppercase tracking-widest">
                                                    {item.tribe}
                                                </span>
                                                <h3 className="font-serif text-xl text-[#2B2B2B] mt-1">{item.title}</h3>
                                                <p className="font-sans text-xs text-[#2B2B2B]/60 mt-1">By {item.artistName}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.artworkId)}
                                                className="text-[#2B2B2B]/40 hover:text-red-500 transition-colors p-2"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-4">
                                            {/* Quantity (Minimal) */}
                                            <div className="flex items-center gap-4 bg-[#E6E1DC] px-3 py-1">
                                                <button
                                                    onClick={() => updateQuantity(item.artworkId, item.quantity - 1)}
                                                    className="text-[#2B2B2B]/60 hover:text-[#D2691E] transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="font-sans text-sm font-medium text-[#2B2B2B] w-4 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.artworkId, item.quantity + 1)}
                                                    className="text-[#2B2B2B]/60 hover:text-[#D2691E] transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <p className="font-sans text-lg font-medium text-[#2B2B2B]">
                                                    ₹{(item.price * item.quantity).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#2B2B2B] text-[#E6E1DC] p-8 md:sticky md:top-32">
                                <h2 className="font-serif text-2xl mb-8">Summary</h2>

                                <div className="space-y-4 mb-8 font-sans text-sm">
                                    <div className="flex justify-between text-[#E6E1DC]/60">
                                        <span>Items ({getCartCount()})</span>
                                        <span>₹{getCartTotal().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-[#E6E1DC]/60">
                                        <span>Shipping</span>
                                        <span className="text-[#C9A24D]">Complimentary</span>
                                    </div>
                                    <div className="border-t border-[#E6E1DC]/10 pt-4 mt-4">
                                        <div className="flex justify-between items-center text-lg">
                                            <span>Total</span>
                                            <span className="text-[#C9A24D]">
                                                ₹{getCartTotal().toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push('/checkout')}
                                    className="w-full bg-[#D2691E] hover:bg-[#C9A24D] text-[#E6E1DC] py-4 font-sans text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                <p className="mt-4 text-center font-sans text-[10px] text-[#E6E1DC]/40 uppercase tracking-widest">
                                    Secure Encryption
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
