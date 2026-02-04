'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Upload, Check } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { getUserSession } from '@/lib/auth';

export default function UploadArtworkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', tribe: '', medium: '', size: '', imageUrl: ''
  });

  const tribes = ['Warli', 'Gond', 'Madhubani', 'Pattachitra', 'Tribal', 'Other'];
  const mediums = ['Acrylic', 'Oil', 'Watercolor', 'Mixed Media', 'Canvas', 'Paper', 'Other'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = getUserSession();
    if (!session || session.role !== 'artist') {
      router.push('/login?role=artist');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/artworks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          tribe: formData.tribe,
          medium: formData.medium,
          size: formData.size,
          imageUrl: formData.imageUrl || null
        })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => { router.push('/dashboard?tab=my-artworks'); }, 2000);
      } else {
        throw new Error(data.error || 'Failed to upload artwork');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upload artwork');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#E6E1DC]">
        <Navbar />
        <div className="pt-32 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-[#D2691E]/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-[#D2691E]" />
            </div>
            <h2 className="font-serif text-4xl text-[#2B2B2B]">Submitted</h2>
            <p className="font-sans text-[#2B2B2B]/60">Your masterpiece is pending verification.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6E1DC]">
      <Navbar />
      <div className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <button onClick={() => router.back()} className="flex items-center text-[#2B2B2B]/60 hover:text-[#D2691E] mb-8 transition-colors font-sans text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>

          <div className="flex items-center mb-12">
            <Upload className="w-6 h-6 text-[#D2691E] mr-4" />
            <h1 className="font-serif text-4xl text-[#2B2B2B]">Upload Artwork</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">

            {/* Main Info */}
            <div className="space-y-6">
              <h3 className="font-sans text-xs uppercase tracking-widest text-[#2B2B2B]/40 border-b border-[#2B2B2B]/10 pb-2">Basic Information</h3>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-serif text-[#2B2B2B] mb-2">Artwork Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans text-lg" placeholder="e.g. The Dance of Life" required />
                </div>
                <div>
                  <label className="block text-sm font-serif text-[#2B2B2B] mb-2">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans text-sm resize-none" placeholder="Tell the story behind this piece..." />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <h3 className="font-sans text-xs uppercase tracking-widest text-[#2B2B2B]/40 border-b border-[#2B2B2B]/10 pb-2">Specifics</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-serif text-[#2B2B2B] mb-2">Price (₹)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans text-lg" placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text-sm font-serif text-[#2B2B2B] mb-2">Size</label>
                  <input type="text" name="size" value={formData.size} onChange={handleInputChange} className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans text-lg" placeholder="e.g. 24x36 inches" />
                </div>
                <div>
                  <label className="block text-sm font-serif text-[#2B2B2B] mb-2">Tribe / Style</label>
                  <select name="tribe" value={formData.tribe} onChange={handleInputChange} className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans text-sm appearance-none rounded-none" required>
                    <option value="">Select Tribe</option>
                    {tribes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-serif text-[#2B2B2B] mb-2">Medium</label>
                  <select name="medium" value={formData.medium} onChange={handleInputChange} className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans text-sm appearance-none rounded-none" required>
                    <option value="">Select Medium</option>
                    {mediums.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="space-y-6">
              <h3 className="font-sans text-xs uppercase tracking-widest text-[#2B2B2B]/40 border-b border-[#2B2B2B]/10 pb-2">Visuals</h3>
              <div>
                <label className="block text-sm font-serif text-[#2B2B2B] mb-2">Image URL</label>
                <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans text-sm" placeholder="https://..." />
                <p className="mt-2 text-xs font-sans text-[#2B2B2B]/40">Please provide a direct link to a high-resolution image.</p>
              </div>
            </div>

            <div className="pt-8 flex gap-6">
              <button type="button" onClick={() => router.back()} className="px-8 py-4 border border-[#2B2B2B]/20 text-[#2B2B2B] font-sans text-xs uppercase tracking-widest hover:bg-[#2B2B2B] hover:text-[#E6E1DC] transition-all">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 px-8 py-4 bg-[#D2691E] text-[#E6E1DC] font-sans text-xs uppercase tracking-widest hover:bg-[#C9A24D] transition-all disabled:opacity-50">
                {loading ? 'Uploading...' : 'Publish Artwork'}
              </button>
            </div>

          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
