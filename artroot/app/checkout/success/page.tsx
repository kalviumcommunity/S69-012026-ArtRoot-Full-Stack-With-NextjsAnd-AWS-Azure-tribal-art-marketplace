'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [orderDetails, setOrderDetails] = useState<any>(null);

    const orderId = searchParams.get('orderId');
    const txnid = searchParams.get('txnid');

    useEffect(() => {
        if (orderId) {
            // Fetch order details
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setOrderDetails(data.data);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            <Navbar />

            <div className="max-w-3xl mx-auto px-6 py-16">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                        Payment Successful!
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>

                    {/* Order Details */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Order Details</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order ID:</span>
                                <span className="font-semibold text-gray-900">#{orderId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Transaction ID:</span>
                                <span className="font-mono text-sm text-gray-900">{txnid}</span>
                            </div>
                            {orderDetails && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Amount:</span>
                                        <span className="font-semibold text-gray-900">
                                            ₹{orderDetails.total_price?.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                            Confirmed
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* What's Next */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 text-left">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Package className="w-5 h-5 text-amber-600" />
                            What's Next?
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li>• You will receive an order confirmation email shortly</li>
                            <li>• Track your order status in your dashboard</li>
                            <li>• We'll notify you when your order is shipped</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => router.push('/dashboard?tab=orders')}
                            className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-sans uppercase tracking-widest text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            View Order
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => router.push('/artworks')}
                            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-sans uppercase tracking-widest text-xs rounded-lg transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
