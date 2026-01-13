export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="border-b border-amber-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-amber-900">🎨 ArtRoot</div>
          <div className="space-x-6">
            <a href="#explore" className="text-gray-700 hover:text-amber-900 font-medium">
              Explore
            </a>
            <a href="#about" className="text-gray-700 hover:text-amber-900 font-medium">
              About
            </a>
            <a href="api/artists" className="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 font-medium">
              Browse Artists
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover Authentic <span className="text-amber-700">Tribal Art</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with talented artists from around the world. Explore unique tribal artwork, support artisans, and own pieces with cultural significance.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/api/artworks"
              className="bg-amber-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-amber-700 transition"
            >
              Start Exploring
            </a>
            <a
              href="#about"
              className="border-2 border-amber-600 text-amber-600 px-8 py-3 rounded-full font-semibold hover:bg-amber-50 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="explore" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Why Choose ArtRoot?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-amber-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Authentic Artists</h3>
              <p className="text-gray-600">
                Direct connection with real tribal artists preserving cultural heritage
              </p>
            </div>
            <div className="p-8 border border-amber-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Community</h3>
              <p className="text-gray-600">
                Explore artwork from diverse cultures and support artisans worldwide
              </p>
            </div>
            <div className="p-8 border border-amber-200 rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Guaranteed</h3>
              <p className="text-gray-600">
                Verified artworks with certificates of authenticity
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Featured Artworks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-64 flex items-center justify-center hover:shadow-lg transition">
                <span className="text-gray-400 text-lg">Artwork {i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-amber-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands discovering authentic tribal art and supporting artists globally.
          </p>
          <a
            href="/api/artworks"
            className="bg-white text-amber-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition inline-block"
          >
            Browse Our Collection
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 ArtRoot. Celebrating tribal art and supporting artisans worldwide.</p>
        </div>
      </footer>
    </div>
  );
}
