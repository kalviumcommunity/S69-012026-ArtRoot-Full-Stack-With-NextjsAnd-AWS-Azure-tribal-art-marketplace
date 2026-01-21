import { Share2, Heart } from 'lucide-react';

interface ArtworkProps {
    artwork: {
        id: number;
        title: string;
        artistName: string;
        price: number;
        tribe: string;
        medium: string;
        size: string;
        description: string;
        available: boolean;
    };
}

export default function ArtworkCard({ artwork }: ArtworkProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                {/* Placeholder for actual image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-100 to-orange-50 flex items-center justify-center text-amber-900/20 font-serif text-4xl">
                    {artwork.tribe} Art
                </div>
                <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white/90 backdrop-blur rounded-full text-gray-700 hover:text-amber-600 shadow-sm">
                        <Heart className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-white/90 backdrop-blur rounded-full text-gray-700 hover:text-amber-600 shadow-sm">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
                {artwork.available && (
                    <span className="absolute top-3 left-3 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                        Available
                    </span>
                )}
            </div>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">{artwork.tribe}</span>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight mt-1">{artwork.title}</h3>
                    </div>
                    <span className="text-lg font-bold text-gray-900">₹{artwork.price.toLocaleString()}</span>
                </div>

                <p className="text-sm text-gray-500 mb-4">{artwork.medium} • {artwork.size}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">{artwork.artistName}</span>
                    </div>
                    <button className="text-amber-600 text-sm font-semibold hover:text-amber-700">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
}
