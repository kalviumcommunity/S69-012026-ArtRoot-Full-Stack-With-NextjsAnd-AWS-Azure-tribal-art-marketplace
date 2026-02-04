'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Palette, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { getUserSession } from '@/lib/auth';

export default function SetupArtistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tribe: '',
    location: '',
    biography: '',
    specialties: '',
    yearsActive: ''
  });

  useEffect(() => {
    const session = getUserSession();
    if (!session) {
      router.push('/login?role=artist');
      return;
    }
    if (session.role !== 'artist') {
      router.push('/dashboard');
      return;
    }

    // Check if profile already exists
    checkExistingProfile();
  }, [router]);

  const checkExistingProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/artists/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Profile exists, redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      // Profile doesn't exist, continue with setup
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tribe) {
      alert('Please select your tribe/art style');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/artists/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tribe: formData.tribe,
          location: formData.location,
          biography: formData.biography,
          specialties: formData.specialties,
          yearsActive: formData.yearsActive ? parseInt(formData.yearsActive) : null
        })
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard?tab=my-artworks');
      } else {
        throw new Error(data.error || 'Failed to create profile');
      }
    } catch (error: any) {
      console.error('Error creating artist profile:', error);
      alert(error.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tribes = ['Warli', 'Gond', 'Madhubani', 'Pattachitra', 'Tribal', 'Other'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <Palette className="w-8 h-8 text-amber-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">
              Welcome, Artist!
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Let's set up your artist profile to get started
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tribe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Art Style/Tribe *
                </label>
                <select
                  name="tribe"
                  value={formData.tribe}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  <option value="">Select your art style</option>
                  {tribes.map(tribe => (
                    <option key={tribe} value={tribe}>{tribe}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </div>

              {/* Years Active */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="yearsActive"
                  value={formData.yearsActive}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., 5"
                  min="0"
                />
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialties
                </label>
                <input
                  type="text"
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="e.g., Traditional motifs, Nature themes"
                />
              </div>

              {/* Biography */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About You
                </label>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Tell buyers about your art journey, inspiration, and techniques..."
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-full transition-all shadow-lg shadow-amber-600/30 flex items-center justify-center"
              >
                {loading ? 'Creating Profile...' : 'Complete Setup'}
                {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
