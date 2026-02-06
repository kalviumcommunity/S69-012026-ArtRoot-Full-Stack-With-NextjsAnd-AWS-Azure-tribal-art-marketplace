'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

function FailureContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const txnid = searchParams.get('txnid');
    const error = searchParams.get('error');
    const status = searchParams.get('status');

    return (
        <div className="min-h-screen bg-[#FAF9F6]">
            <Navbar />

            <div className="max-w-3xl mx-auto px-6 py-16">
                <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
                    {/* Failure Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-12 h-12 text-red-600" />
                        </div>
                    </div>

                    {/* Failure Message */}
                    <h1 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">
                        Payment Failed
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Unfortunately, your payment could not be processed. Please try again.
                    </p>

                    {/* Error Details */}
                    {(error || status || txnid) && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-left">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Error Details</h2>
                            <div className="space-y-2 text-sm">
                                {txnid && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <span className="font-mono text-gray-900">{txnid}</span>
                                    </div>
                                )}
                                {status && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="font-semibold text-red-600 uppercase">{status}</span>
                                    </div>
                                )}
                                {error && (
                                    <div className="mt-3">
                                        <span className="text-gray-600 block mb-1">Error Message:</span>
                                        <p className="text-gray-900 bg-white p-3 rounded border border-red-200">
                                            {decodeURIComponent(error)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Common Reasons */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                        <h3 className="font-bold text-gray-900 mb-3">Common Reasons for Payment Failure:</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li>• Insufficient funds in your account</li>
                            <li>• Incorrect card details or expired card</li>
                            <li>• Payment gateway timeout or network issues</li>
                            <li>• Bank declined the transaction</li>
                            <li>• Daily transaction limit exceeded</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => router.push('/checkout')}
                            className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-sans uppercase tracking-widest text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                        <button
                            onClick={() => router.push('/artworks')}
                            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-sans uppercase tracking-widest text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Shop
                        </button>
                    </div>

                    {/* Support */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Need help? Contact our support team at{' '}
                            <a href="mailto:support@artroot.com" className="text-amber-600 hover:text-amber-700 underline">
                                support@artroot.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default function PaymentFailurePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        }>
            <FailureContent />
        </Suspense>
    );
}
