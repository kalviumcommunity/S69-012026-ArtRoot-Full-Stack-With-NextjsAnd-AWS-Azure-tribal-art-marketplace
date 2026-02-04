'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#E6E1DC]">
            <Navbar />
            <div className="pt-32 pb-24 max-w-4xl mx-auto px-6">
                <h1 className="font-serif text-5xl text-[#2B2B2B] mb-8">Our Story</h1>
                <div className="space-y-6 font-sans text-[#2B2B2B]/80 leading-relaxed text-lg">
                    <p>
                        <span className="font-serif font-bold text-[#D2691E]">ArtRoot</span> was born from a desire to bridge the gap between ancient indigenous artistry and the modern world. We believe that every stroke of a Warli painting or the intricate patterns of Gond art carries a story that deserves to be heard globally.
                    </p>
                    <p>
                        Our platform is not just a marketplace; it is a curator of culture. We partner directly with tribal artists from the heartlands of India—Maharashtra, Madhya Pradesh, Odisha, and beyond—ensuring that their craft is honored and their livelihoods supported.
                    </p>
                    <p>
                        By eliminating middlemen and providing a digital stage, we empower these artists to set their own value and share their heritage with collectors who appreciate the depth of tradition.
                    </p>
                </div>
                <div className="mt-12 p-8 bg-white/40 border-l-4 border-[#D2691E]">
                    <h3 className="font-serif text-2xl text-[#2B2B2B] mb-4">Our Mission</h3>
                    <p className="font-sans text-[#2B2B2B]/70 italic">
                        "To preserve the imperiled narratives of tribal India by creating a sustainable, premium ecosystem for indigenous art."
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}
