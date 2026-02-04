'use client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ShippingPage() {
    return (
        <div className="min-h-screen bg-[#E6E1DC]">
            <Navbar />
            <div className="pt-32 pb-24 max-w-4xl mx-auto px-6">
                <h1 className="font-serif text-5xl text-[#2B2B2B] mb-12">Shipping & Returns</h1>

                <div className="space-y-12">
                    <section>
                        <h2 className="font-serif text-2xl text-[#2B2B2B] mb-4">Global Shipping</h2>
                        <p className="font-sans text-[#2B2B2B]/70 leading-relaxed">
                            We offer complimentary insured shipping for all domestic orders within India. For international collectors, we partner with specialized art logistics providers (DHL, FedEx Art) to ensure your masterpiece arrives safely. International shipping rates are calculated at checkout based on destination and artwork dimensions.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl text-[#2B2B2B] mb-4">Packaging</h2>
                        <p className="font-sans text-[#2B2B2B]/70 leading-relaxed">
                            Each artwork is meticulously inspected and packaged. Rolled canvases are shipped in heavy-duty tubes, while framed pieces are crated in custom-built wooden boxes with museum-grade shock absorption materials.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl text-[#2B2B2B] mb-4">Returns Policy</h2>
                        <p className="font-sans text-[#2B2B2B]/70 leading-relaxed">
                            Due to the unique and delicate nature of original tribal art, all sales are generally final. However, if your artwork arrives damaged, please contact us within 48 hours of delivery with photographic evidence. We will arrange for a return and full refund or restoration, depending on the extent of the damage.
                        </p>
                    </section>
                </div>

            </div>
            <Footer />
        </div>
    );
}
