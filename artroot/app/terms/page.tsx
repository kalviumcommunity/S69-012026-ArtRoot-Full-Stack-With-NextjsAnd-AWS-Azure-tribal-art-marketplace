'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Gavel, Scale, AlertTriangle, CheckSquare } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#E6E1DC]">
            <Navbar />

            <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D2691E]/10 rounded-full mb-6">
                        <Gavel className="w-8 h-8 text-[#D2691E]" />
                    </div>
                    <h1 className="font-serif text-5xl text-[#2B2B2B] mb-4">Terms of Service</h1>
                    <p className="font-sans text-[#2B2B2B]/60 italic font-medium">Last Updated: February 6, 2026</p>
                </div>

                <div className="bg-white/40 backdrop-blur-sm p-8 md:p-12 shadow-sm border border-[#2B2B2B]/5 space-y-12">
                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl text-[#2B2B2B] flex items-center gap-3">
                            <Scale className="w-5 h-5 text-[#D2691E]" />
                            1. Acceptance of Terms
                        </h2>
                        <p className="font-sans text-[#2B2B2B]/70 leading-relaxed">
                            By accessing or using the ArtRoot platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services. We reserve the right to change or modify these terms at any time.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl text-[#2B2B2B] flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-[#D2691E]" />
                            2. Use of Services
                        </h2>
                        <p className="font-sans text-[#2B2B2B]/70 leading-relaxed">
                            You are responsible for your use of the services and for any content you post. You may use our services only for lawful purposes and in accordance with these Terms. You agree not to use the services in any way that violates any applicable local, national, or international law.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl text-[#2B2B2B] flex items-center gap-3">
                            <CheckSquare className="w-5 h-5 text-[#D2691E]" />
                            3. Intellectual Property
                        </h2>
                        <p className="font-sans text-[#2B2B2B]/70 leading-relaxed">
                            The services and their entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by ArtRoot and its licensors.
                        </p>
                    </section>

                    <section className="space-y-4 border-t border-[#2B2B2B]/10 pt-8">
                        <p className="font-sans text-[#2B2B2B]/50 text-sm italic">
                            These terms constitute the entire agreement between you and ArtRoot regarding our services. If you have any questions, please contact our legal team at legal@artroot.com.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
