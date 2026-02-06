'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MapPin, Phone, Loader2, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus('submitting');

        try {
            const formData = new FormData(event.currentTarget);
            // Append custom Web3Forms configurations
            formData.append("access_key", "ac04d30e-10ac-44a7-882d-e55c0ce5bbc7");
            formData.append("subject", "New Contact Message from ArtRoot");
            formData.append("from_name", "ArtRoot Contact Form");

            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setMessage('Thank you! Your message has been sent successfully.');
                (event.target as HTMLFormElement).reset();
            } else {
                setStatus('error');
                setMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Failed to send message. Please check your connection.');
        }
    };

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
                        <div className="flex items-start">
                            <MessageCircle className="w-6 h-6 text-[#D2691E] mr-4 mt-1" />
                            <div>
                                <h3 className="font-serif text-xl text-[#2B2B2B]">Live Chat</h3>
                                <p className="font-sans text-[#2B2B2B]/60 italic font-medium">Available 24/7 for collectors</p>
                                <button
                                    onClick={() => {
                                        const widget = document.querySelector('button[title="Chat with Support"]') as HTMLButtonElement;
                                        if (widget) widget.click();
                                        else alert('Please login to use live chat');
                                    }}
                                    className="text-xs text-[#D2691E] hover:underline uppercase tracking-widest font-bold mt-2"
                                >
                                    Open Chat Box →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 p-8 md:p-12 shadow-sm border border-[#2B2B2B]/5 h-fit">
                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Hidden Spam Protection */}
                        <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                        <div>
                            <label className="block font-serif text-sm text-[#2B2B2B] mb-2">Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block font-serif text-sm text-[#2B2B2B] mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="block font-serif text-sm text-[#2B2B2B] mb-2">Message</label>
                            <textarea
                                name="message"
                                required
                                rows={4}
                                className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans resize-none"
                                placeholder="How can we help?"
                            />
                        </div>

                        {status === 'success' ? (
                            <div className="bg-[#D2691E]/10 p-4 rounded flex items-center text-[#D2691E]">
                                <CheckCircle className="w-5 h-5 mr-3" />
                                <span className="font-sans text-sm">{message}</span>
                            </div>
                        ) : (
                            <>
                                {status === 'error' && (
                                    <div className="bg-red-50 p-4 rounded flex items-center text-red-600">
                                        <AlertCircle className="w-5 h-5 mr-3" />
                                        <span className="font-sans text-sm">{message}</span>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={status === 'submitting'}
                                    className="w-full bg-[#2B2B2B] text-[#E6E1DC] py-4 font-sans text-xs uppercase tracking-widest hover:bg-[#D2691E] transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                    {status === 'submitting' ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Sending...
                                        </>
                                    ) : 'Send Message'}
                                </button>
                            </>
                        )}
                    </form>
                </div>

            </div>
            <Footer />
        </div>
    );
}
