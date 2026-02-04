'use client';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-[#2B2B2B] text-[#E6E1DC] py-20 border-t border-[#C9A24D]/20">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-24">

                {/* Brand Column */}
                <div className="space-y-6">
                    <h2 className="font-serif text-2xl tracking-widest font-bold">
                        ART<span className="text-[#D2691E]">ROOT</span>
                    </h2>
                    <p className="font-sans text-sm text-[#E6E1DC]/60 leading-relaxed">
                        Preserving indigenous heritage through modern commerce. Every purchase supports tribal artists directly.
                    </p>
                </div>

                {/* Links Column 1 */}
                <div className="space-y-6">
                    <h4 className="font-sans text-[#C9A24D] text-xs uppercase tracking-widest">Shop</h4>
                    <ul className="space-y-4 font-sans text-sm text-[#E6E1DC]/80">
                        <li><Link href="/artworks" className="hover:text-[#D2691E] transition-colors">All Artworks</Link></li>
                        <li><Link href="/artworks?tag=new" className="hover:text-[#D2691E] transition-colors">New Arrivals</Link></li>
                        <li><Link href="/artworks?tribe=warli" className="hover:text-[#D2691E] transition-colors">Warli Collection</Link></li>
                        <li><Link href="/artworks?tribe=gond" className="hover:text-[#D2691E] transition-colors">Gond Masterpieces</Link></li>
                    </ul>
                </div>

                {/* Links Column 2 */}
                <div className="space-y-6">
                    <h4 className="font-sans text-[#C9A24D] text-xs uppercase tracking-widest">Support</h4>
                    <ul className="space-y-4 font-sans text-sm text-[#E6E1DC]/80">
                        <li><Link href="/about" className="hover:text-[#D2691E] transition-colors">About Us</Link></li>
                        <li><Link href="/contact" className="hover:text-[#D2691E] transition-colors">Contact</Link></li>
                        <li><Link href="/shipping" className="hover:text-[#D2691E] transition-colors">Shipping & Returns</Link></li>
                        <li><Link href="/artist-signup" className="hover:text-[#D2691E] transition-colors">Join as Artist</Link></li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div className="space-y-6">
                    <h4 className="font-sans text-[#C9A24D] text-xs uppercase tracking-widest">Newsletter</h4>
                    <p className="font-sans text-sm text-[#E6E1DC]/60">Subscribe for exclusive drops and artist stories.</p>
                    <form className="flex border-b border-[#E6E1DC]/20 pb-2">
                        <input
                            type="email"
                            placeholder="Your email address"
                            className="bg-transparent w-full outline-none text-[#E6E1DC] placeholder-[#E6E1DC]/40 font-sans text-sm"
                        />
                        <button className="text-[#D2691E] uppercase text-xs tracking-widest hover:text-[#C9A24D] transition-colors">
                            Join
                        </button>
                    </form>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12 mt-20 pt-8 border-t border-[#E6E1DC]/10 flex flex-col md:flex-row justify-between items-center text-xs text-[#E6E1DC]/40 font-sans">
                <p>&copy; {new Date().getFullYear()} ArtRoot. All rights reserved.</p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
            </div>
        </footer>
    );
}
