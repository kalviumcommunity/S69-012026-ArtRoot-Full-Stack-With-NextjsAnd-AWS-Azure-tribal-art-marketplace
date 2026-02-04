'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#E6E1DC]">
            <Navbar />
            <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">

                <div>
                    <h1 className="font-serif text-5xl text-[#2B2B2B] mb-8">Get in Touch</h1>
                    <p className="font-sans text-[#2B2B2B]/60 mb-12 text-lg">
                        Whether you are an artist looking to join our collective or a collector seeking a specific piece, we are here to assist you.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start">
                            <Mail className="w-6 h-6 text-[#D2691E] mr-4 mt-1" />
                            <div>
                                <h3 className="font-serif text-xl text-[#2B2B2B]">Email</h3>
                                <p className="font-sans text-[#2B2B2B]/60">support@artroot.com</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Phone className="w-6 h-6 text-[#D2691E] mr-4 mt-1" />
                            <div>
                                <h3 className="font-serif text-xl text-[#2B2B2B]">Phone</h3>
                                <p className="font-sans text-[#2B2B2B]/60">+91 98765 43210</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <MapPin className="w-6 h-6 text-[#D2691E] mr-4 mt-1" />
                            <div>
                                <h3 className="font-serif text-xl text-[#2B2B2B]">Studio</h3>
                                <p className="font-sans text-[#2B2B2B]/60">
                                    12, Heritage Lane, <br />
                                    Kala Ghoda, Mumbai - 400001
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 p-8 md:p-12 shadow-sm border border-[#2B2B2B]/5">
                    <form className="space-y-6">
                        <div>
                            <label className="block font-serif text-sm text-[#2B2B2B] mb-2">Name</label>
                            <input type="text" className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block font-serif text-sm text-[#2B2B2B] mb-2">Email</label>
                            <input type="email" className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="block font-serif text-sm text-[#2B2B2B] mb-2">Message</label>
                            <textarea rows={4} className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans resize-none" placeholder="How can we help?" />
                        </div>
                        <button className="w-full bg-[#2B2B2B] text-[#E6E1DC] py-4 font-sans text-xs uppercase tracking-widest hover:bg-[#D2691E] transition-colors">
                            Send Message
                        </button>
                    </form>
                </div>

            </div>
            <Footer />
        </div>
    );
}
