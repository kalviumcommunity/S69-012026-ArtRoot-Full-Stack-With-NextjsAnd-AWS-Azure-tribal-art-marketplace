'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#E6E1DC]">
            <Navbar />

            <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D2691E]/10 rounded-full mb-6">
                        <Shield className="w-8 h-8 text-[#D2691E]" />
                    </div>
                    <h1 className="font-serif text-5xl text-[#2B2B2B] mb-4">Privacy Policy</h1>
                    <p className="font-sans text-[#2B2B2B]/60 italic font-medium">Last Updated: February 6, 2026</p>
                </div>

                <div className="bg-white/40 backdrop-blur-sm p-8 md:p-12 shadow-sm border border-[#2B2B2B]/5 space-y-12">
                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl text-[#2B2B2B] flex items-center gap-3">
                            <Lock className="w-5 h-5 text-[#D2691E]" />
                            1. Data Collection
                        </h2>
                        <p className="font-sans text-[#2B2B2B]/70 leading-relaxed">
                            At ArtRoot, we collect information that you provide directly to us when you create an account, make a purchase, or communicate with us. This includes your name, email address, postal address, phone number, and any other information you choose to provide.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl text-[#2B2B2B] flex items-center gap-3">
                            <Eye className="w-5 h-5 text-[#D2691E]" />
                            2. Use of Information
                        </h2>
                        <p className="font-sans text-[#2B2B2B]/70 leading-relaxed">
                            We use the information we collect to provide, maintain, and improve our services, such as to process your transactions, respond to your comments, and send you technical notices, updates, security alerts, and support and administrative messages.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl text-[#2B2B2B] flex items-center gap-3">
                            <FileText className="w-5 h-5 text-[#D2691E]" />
                            3. Information Sharing
                        </h2>
                        <p className="font-sans text-[#2B2B2B]/70 leading-relaxed">
                            We do not share your personal information with third parties except as described in this Privacy Policy. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
                        </p>
                    </section>

                    <section className="space-y-4 border-t border-[#2B2B2B]/10 pt-8">
                        <p className="font-sans text-[#2B2B2B]/50 text-sm italic">
                            By using ArtRoot, you agree to the collection and use of information in accordance with this policy. If you have any questions about this Privacy Policy, please contact us at support@artroot.com.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
