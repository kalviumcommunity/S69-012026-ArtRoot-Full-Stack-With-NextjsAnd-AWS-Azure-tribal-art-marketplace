'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, LogIn, UserPlus, Palette, LogOut, ShoppingCart, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { getUserSession } from '@/lib/auth';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isArtist, setIsArtist] = useState(false);
    const router = useRouter();
    const { getCartCount } = useCart();
    const [session, setSession] = useState<ReturnType<typeof getUserSession> | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const updateSession = () => {
            const currentSession = getUserSession();
            setSession(currentSession);
            setIsArtist(currentSession?.role === 'artist');
        };

        updateSession();

        const handleStorage = (event: StorageEvent) => {
            if (event.key === 'token' || event.key === 'user') {
                updateSession();
            }
        };

        // Custom event for immediate updates within same window
        window.addEventListener('auth-change', updateSession);
        window.addEventListener('storage', handleStorage);

        return () => {
            window.removeEventListener('auth-change', updateSession);
            window.removeEventListener('storage', handleStorage);
        };
    }, [isMounted]);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Dispatch event for other components
        window.dispatchEvent(new Event('auth-change'));
        setSession(null);
        setIsArtist(false);
        router.push('/');
        setIsOpen(false);
    };

    const isAuthenticated = !!session;

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#E6E1DC]/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="bg-[#D2691E] p-2 rounded-lg group-hover:bg-[#b05516] transition-colors">
                            <Palette className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-serif font-bold text-[#2B2B2B]">
                            ArtRoot
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="font-sans font-medium transition-colors text-[#2B2B2B]/70 hover:text-[#D2691E]">
                            Home
                        </Link>
                        <Link href="/artworks" className="font-sans font-medium transition-colors text-[#2B2B2B]/70 hover:text-[#D2691E]">
                            Gallery
                        </Link>
                        <Link href="/#mission" className="font-sans font-medium transition-colors text-[#2B2B2B]/70 hover:text-[#D2691E]">
                            Mission
                        </Link>

                        <div className="flex items-center space-x-4 pl-4 border-l border-[#2B2B2B]/10">
                            {/* Cart Icon */}
                            <Link href="/cart" className="relative p-2 rounded-full transition-colors hover:bg-[#2B2B2B]/5">
                                <ShoppingCart className="w-5 h-5 text-[#2B2B2B]" />
                                {getCartCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[#D2691E] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {getCartCount()}
                                    </span>
                                )}
                            </Link>

                            {!isMounted ? (
                                // Loading/Hydration state
                                <div className="w-20 h-8"></div>
                            ) : isAuthenticated ? (
                                <>
                                    <Link href="/dashboard" className="p-2 rounded-full transition-colors hover:bg-[#2B2B2B]/5">
                                        <User className="w-5 h-5 text-[#2B2B2B]" />
                                    </Link>
                                    {isArtist && (
                                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#D2691E]/10 text-[#D2691E]">
                                            Artist
                                        </span>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center px-4 py-2 rounded-full font-medium transition-all text-[#2B2B2B] hover:text-[#D2691E] hover:bg-[#D2691E]/5"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="flex items-center px-4 py-2 rounded-full font-medium transition-all text-[#2B2B2B] hover:text-[#D2691E]">
                                        <LogIn className="w-4 h-4 mr-2" />
                                        Login
                                    </Link>
                                    <Link href="/signup" className="flex items-center px-4 py-2 rounded-full font-medium transition-all bg-[#D2691E] text-white hover:bg-[#b05516] shadow-lg shadow-[#D2691E]/20">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg text-[#2B2B2B]">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4 px-4 flex flex-col space-y-4">
                    <Link href="/" className="text-gray-700 font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                        Home
                    </Link>
                    <Link href="/artworks" className="text-gray-700 font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                        Gallery
                    </Link>
                    <Link href="/cart" className="text-gray-700 font-medium py-2 border-b border-gray-100 flex items-center justify-between" onClick={() => setIsOpen(false)}>
                        <span>Cart</span>
                        {getCartCount() > 0 && (
                            <span className="bg-amber-600 text-white text-xs font-bold rounded-full px-2 py-1">
                                {getCartCount()}
                            </span>
                        )}
                    </Link>
                    <Link href="/#mission" className="text-gray-700 font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                        Mission
                    </Link>
                    {!isMounted ? (
                        <div className="h-8"></div>
                    ) : isAuthenticated ? (
                        <>
                            <Link href="/dashboard" className="flex items-center text-gray-700 font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                                <User className="w-4 h-4 mr-2" />
                                Dashboard
                            </Link>
                            {isArtist && (
                                <div className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full w-fit">
                                    Artist
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center bg-red-50 text-red-600 font-medium py-2 rounded-lg"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="flex items-center text-gray-700 font-medium py-2" onClick={() => setIsOpen(false)}>
                                <LogIn className="w-4 h-4 mr-2" />
                                Login
                            </Link>
                            <Link href="/signup" className="flex items-center justify-center bg-amber-600 text-white font-medium py-2 rounded-lg" onClick={() => setIsOpen(false)}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
