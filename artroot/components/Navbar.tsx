'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, LogIn, UserPlus, Palette } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="bg-amber-600 p-2 rounded-lg group-hover:bg-amber-700 transition-colors">
                            <Palette className="w-6 h-6 text-white" />
                        </div>
                        <span className={`text-2xl font-bold ${!scrolled ? 'text-white' : 'text-amber-700'}`}>
                            ArtRoot
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className={`font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-amber-600' : 'text-white/90 hover:text-white'}`}>
                            Home
                        </Link>
                        <Link href="#artworks" className={`font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-amber-600' : 'text-white/90 hover:text-white'}`}>
                            Artworks
                        </Link>
                        <Link href="#mission" className={`font-medium transition-colors ${scrolled ? 'text-gray-700 hover:text-amber-600' : 'text-white/90 hover:text-white'}`}>
                            Mission
                        </Link>

                        <div className="flex items-center space-x-4 pl-4 border-l border-gray-200/20">
                            <Link href="/login" className={`flex items-center px-4 py-2 rounded-full font-medium transition-all ${scrolled ? 'text-gray-700 hover:text-amber-600 hover:bg-amber-50' : 'text-white hover:bg-white/10'}`}>
                                <LogIn className="w-4 h-4 mr-2" />
                                Login
                            </Link>
                            <Link href="/signup" className={`flex items-center px-4 py-2 rounded-full font-medium transition-all shadow-lg shadow-amber-600/20 ${scrolled ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-white text-amber-900 hover:bg-amber-50'}`}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Sign Up
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className={`p-2 rounded-lg ${scrolled ? 'text-gray-700' : 'text-white'}`}>
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
                    <Link href="#artworks" className="text-gray-700 font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                        Artworks
                    </Link>
                    <Link href="#mission" className="text-gray-700 font-medium py-2 border-b border-gray-100" onClick={() => setIsOpen(false)}>
                        Mission
                    </Link>
                    <Link href="/login" className="flex items-center text-gray-700 font-medium py-2" onClick={() => setIsOpen(false)}>
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                    </Link>
                    <Link href="/signup" className="flex items-center justify-center bg-amber-600 text-white font-medium py-2 rounded-lg" onClick={() => setIsOpen(false)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Sign Up
                    </Link>
                </div>
            )}
        </nav>
    );
}
