'use client';
import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface Review {
    id: number;
    reviewer_name: string;
    rating: number;
    title: string | null;
    comment: string | null;
    created_at: string;
}

interface ReviewListProps {
    artworkId: number;
    refreshTrigger?: number; // Prop to trigger re-fetch when a new review is added
}

export default function ReviewList({ artworkId, refreshTrigger }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ average: 0, count: 0 });

    useEffect(() => {
        fetchReviews();
    }, [artworkId, refreshTrigger]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/reviews/artwork/${artworkId}`);
            if (!response.ok) throw new Error('Failed to fetch reviews');

            const data = await response.json();
            if (data.success) {
                setReviews(data.data.reviews || []);
                setStats(data.data.stats || { average: 0, count: 0 });
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-20 bg-gray-100 rounded-lg"></div>
                <div className="h-20 bg-gray-100 rounded-lg"></div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                <p>No reviews yet. Be the first to review this artwork!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="flex items-center gap-4 mb-8 bg-amber-50 p-6 rounded-xl">
                <div className="text-4xl font-bold text-amber-600 font-serif">
                    {Number(stats.average).toFixed(1)}
                </div>
                <div>
                    <div className="flex text-amber-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-5 h-5 ${i < Math.round(Number(stats.average)) ? 'fill-current' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                    <p className="text-gray-600 text-sm">{stats.count} Review{stats.count !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-500" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{review.reviewer_name}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {review.title && (
                            <h4 className="font-bold text-gray-900 mb-2">{review.title}</h4>
                        )}

                        {review.comment && (
                            <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
