export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold text-amber-500 mb-4">
                            ArtRoot
                        </h3>
                        <p className="text-gray-400 max-w-sm">
                            Empowering tribal and rural artists by connecting them directly with global art lovers. Fair trade, transparent, and culturally rich.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Platform</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#artworks" className="hover:text-amber-500 transition-colors">Browse Art</a></li>
                            <li><a href="#artists" className="hover:text-amber-500 transition-colors">Artists</a></li>
                            <li><a href="#" className="hover:text-amber-500 transition-colors">How it works</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Community</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-amber-500 transition-colors">Our Mission</a></li>
                            <li><a href="#" className="hover:text-amber-500 transition-colors">Blog</a></li>
                            <li><a href="/signup" className="hover:text-amber-500 transition-colors">Join as Artist</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                    <p>© 2026 ArtRoot. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
