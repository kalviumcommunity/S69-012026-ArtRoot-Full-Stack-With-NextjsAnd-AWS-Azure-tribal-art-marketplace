'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Upload, Check, X, Image as ImageIcon, Loader2, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { getUserSession } from '@/lib/auth';
import Image from 'next/image';

export default function UploadArtworkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', tribe: '', medium: '', size: '', imageUrl: '', additionalImages: [] as string[], stockQuantity: 1
  });
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    // Initial check on mount
    const checkVerification = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/artists/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setIsVerified(data.data.is_verified);
          if (data.data.tribe) setFormData(prev => ({ ...prev, tribe: data.data.tribe }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkVerification();
  }, []);

  const tribes = ['Warli', 'Gond', 'Madhubani', 'Pattachitra', 'Tribal', 'Other'];
  const mediums = ['Acrylic', 'Oil', 'Watercolor', 'Mixed Media', 'Canvas', 'Paper', 'Other'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isPrimary: boolean, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadKey = isPrimary ? 'primary' : `additional-${index}`;
    setUploading(uploadKey);

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await response.json();
      if (data.success) {
        if (isPrimary) {
          setFormData(prev => ({ ...prev, imageUrl: data.url }));
        } else if (index !== undefined) {
          const newImages = [...formData.additionalImages];
          newImages[index] = data.url;
          setFormData(prev => ({ ...prev, additionalImages: newImages }));
        }
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = getUserSession();
    if (!session || session.role !== 'artist') {
      router.push('/login?role=artist');
      return;
    }

    if (!isVerified) {
      alert('Your profile is not yet verified. Please wait for admin approval.');
      return;
    }

    if (!formData.imageUrl) {
      alert('Please upload a primary image');
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
          imageUrl: formData.imageUrl,
          additionalImages: formData.additionalImages.filter(img => img !== ''),
          stockQuantity: parseInt(formData.stockQuantity.toString())
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
        <div className="max-w-4xl mx-auto px-6">
          <button onClick={() => router.back()} className="flex items-center text-[#2B2B2B]/60 hover:text-[#D2691E] mb-8 transition-colors font-sans text-xs uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>

          <div className="flex items-center mb-6">
            <Upload className="w-6 h-6 text-[#D2691E] mr-4" />
            <h1 className="font-serif text-4xl text-[#2B2B2B]">Upload Artwork</h1>
          </div>

          {isVerified === false && (
            <div className="mb-12 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex gap-4 items-start animate-in slide-in-from-top duration-500">
              <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-serif text-amber-900 font-bold">Verification Pending</p>
                <p className="font-sans text-sm text-amber-700 leading-relaxed">
                  Your artist profile is currently being reviewed by our curators. You can prepare your artwork details now, but the <strong>Publish</strong> button will be enabled once your account is verified.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left Column: Form Details */}
            <div className="lg:col-span-2 space-y-12">
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
                    <label className="block text-sm font-serif text-[#2B2B2B] mb-2">Stock Quantity</label>
                    <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} className="w-full bg-transparent border-b border-[#2B2B2B]/20 py-3 focus:outline-none focus:border-[#D2691E] font-sans text-lg" placeholder="1" min="1" required />
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

              <div className="pt-8 flex gap-6">
                <button type="button" onClick={() => router.back()} className="px-8 py-4 border border-[#2B2B2B]/20 text-[#2B2B2B] font-sans text-xs uppercase tracking-widest hover:bg-[#2B2B2B] hover:text-[#E6E1DC] transition-all">Cancel</button>
                <button type="submit" disabled={loading || uploading !== null || isVerified === false} className="flex-1 px-8 py-4 bg-[#D2691E] text-[#E6E1DC] font-sans text-xs uppercase tracking-widest hover:bg-[#C9A24D] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : isVerified === false ? 'Verification Pending' : 'Publish Artwork'}
                </button>
              </div>
            </div>

            {/* Right Column: Image Uploads */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="font-sans text-xs uppercase tracking-widest text-[#2B2B2B]/40 border-b border-[#2B2B2B]/10 pb-2">Visuals</h3>

                {/* Primary Image Upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-serif text-[#2B2B2B]">Primary Image</label>
                  <div className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden ${formData.imageUrl ? 'border-[#D2691E]/50' : 'border-[#2B2B2B]/10 bg-[#2B2B2B]/5 hover:bg-[#2B2B2B]/10'}`}>
                    {formData.imageUrl ? (
                      <>
                        <img src={formData.imageUrl} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6 text-center">
                        {uploading === 'primary' ? (
                          <Loader2 className="w-10 h-10 text-[#D2691E] animate-spin mb-2" />
                        ) : (
                          <ImageIcon className="w-10 h-10 text-[#2B2B2B]/20 mb-2" />
                        )}
                        <span className="text-xs font-sans text-[#2B2B2B]/60 uppercase tracking-widest">
                          {uploading === 'primary' ? 'Uploading...' : 'Click to Upload Primary Image'}
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, true)} disabled={!!uploading} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Additional Images Upload */}
                <div className="space-y-4 pt-4">
                  <label className="block text-sm font-serif text-[#2B2B2B]">Additional Views</label>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.additionalImages.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl border-2 border-dashed border-[#D2691E]/30 overflow-hidden">
                        {url ? (
                          <>
                            <img src={url} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = formData.additionalImages.filter((_, i) => i !== idx);
                                setFormData(prev => ({ ...prev, additionalImages: newImages }));
                              }}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center p-2">
                            {uploading === `additional-${idx}` ? (
                              <Loader2 className="w-6 h-6 text-[#D2691E] animate-spin mb-1" />
                            ) : (
                              <Upload className="w-6 h-6 text-[#2B2B2B]/20 mb-1" />
                            )}
                            <span className="text-[10px] font-sans text-[#2B2B2B]/60 uppercase tracking-widest">
                              {uploading === `additional-${idx}` ? 'Wait...' : 'Upload'}
                            </span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, false, idx)} disabled={!!uploading} />
                          </label>
                        )}
                      </div>
                    ))}

                    {/* Add New Slot Button */}
                    {formData.additionalImages.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, additionalImages: [...prev.additionalImages, ''] }))}
                        className="aspect-square rounded-xl border-2 border-dashed border-[#2B2B2B]/10 hover:border-[#D2691E]/50 hover:bg-[#2B2B2B]/5 flex flex-col items-center justify-center transition-all group"
                      >
                        <PlusIcon className="w-6 h-6 text-[#2B2B2B]/20 group-hover:text-[#D2691E]/50 mb-1" />
                        <span className="text-[10px] font-sans text-[#2B2B2B]/40 group-hover:text-[#D2691E]/50 uppercase tracking-widest">Add View</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
