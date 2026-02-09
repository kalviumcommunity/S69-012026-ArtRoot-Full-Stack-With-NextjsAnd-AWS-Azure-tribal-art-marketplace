'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getUserSession } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';
import {
  User, LogOut, Package, Heart, LayoutDashboard,
  PlusCircle, Trash2, Palette, Clock, MapPin,
  CheckCircle, Loader2, DollarSign, TrendingUp
} from 'lucide-react';
import Image from 'next/image';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasArtistProfile, setHasArtistProfile] = useState<boolean | null>(null);
  const [artistProfile, setArtistProfile] = useState<any>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);

  useEffect(() => {
    const userSession = getUserSession();
    if (!userSession) {
      router.push('/login');
      return;
    }
    setSession(userSession);

    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (activeTab === 'orders') {
        const endpoint = session.role === 'artist'
          ? `${API_BASE_URL}/orders/artist`
          : `${API_BASE_URL}/orders/my`;

        const response = await fetch(endpoint, { headers });
        const data = await response.json();
        if (data.success) {
          setOrders(data.data || []);
        }
      } else if (activeTab === 'favorites') {
        const response = await fetch(`${API_BASE_URL}/favorites`, { headers });
        const data = await response.json();
        if (data.success) {
          setFavorites(data.data || []);
        }
      } else if (activeTab === 'my-artworks' && session.role === 'artist') {
        // Get artist profile to get the id for filtering
        const profRes = await fetch(`${API_BASE_URL}/artists/profile`, { headers });
        const profData = await profRes.json();
        const artistId = profData.success && profData.data ? profData.data.id : null;

        const artworksUrl = artistId
          ? `${API_BASE_URL}/artworks?artistId=${artistId}&isVerified=all`
          : `${API_BASE_URL}/artworks`;

        const artworksResponse = await fetch(artworksUrl, { headers });
        const artworksData = await artworksResponse.json();

        if (artworksData.success) {
          setArtworks(artworksData.data || []);
        }
      } else if (activeTab === 'profile') {
        // Check if artist has a profile (for artists only)
        if (session.role === 'artist') {
          try {
            const profileResponse = await fetch(`${API_BASE_URL}/artists/profile`, { headers });
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setHasArtistProfile(profileData.success && profileData.data);
              if (profileData.success && profileData.data) {
                setArtistProfile(profileData.data);
              }
            } else {
              setHasArtistProfile(false);
            }
          } catch (err) {
            // Network or parse error - assume no profile
            console.error('Error checking artist profile:', err);
            setHasArtistProfile(false);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setEditedProfile({ ...editedProfile, profile_image_url: data.url });
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditProfile = () => {
    setEditedProfile({ ...artistProfile });
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditedProfile(null);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/artists/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedProfile)
      });

      const data = await response.json();
      if (response.ok) {
        setArtistProfile(data.data);
        setIsEditingProfile(false);
        setEditedProfile(null);
        alert('Profile updated successfully!');
        // Refresh the page to show updated images on product cards
        window.location.reload();
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Show success message
        alert('Your account has been successfully deleted.');

        // Redirect to home page
        router.push('/');
      } else {
        throw new Error(data.error || 'Failed to delete account');
      }
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert(`Failed to delete account: ${error.message}`);
    }
  };

  const handleDeleteArtwork = async (artworkId: number, artworkTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${artworkTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/artworks/${artworkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('Artwork deleted successfully.');
        // Refresh the artworks list
        fetchData();
      } else {
        throw new Error(data.error || 'Failed to delete artwork');
      }
    } catch (error: any) {
      console.error('Error deleting artwork:', error);
      alert(`Failed to delete artwork: ${error.message}`);
    }
  };

  const handleCancelOrder = async (orderId: number, orderNumber: string) => {
    if (!confirm(`Are you sure you want to cancel order #${orderNumber}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('Order cancelled successfully.');
        fetchData();
      } else {
        throw new Error(data.error || 'Failed to cancel order');
      }
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      alert(`Failed to cancel order: ${error.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string, trackingNumber?: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, trackingNumber })
      });

      const data = await response.json();
      if (data.success) {
        alert('Order status updated successfully');
        fetchData();
      } else {
        throw new Error(data.error || 'Failed to update order status');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRefillStock = async (artworkId: number, currentStock: number) => {
    const amount = prompt(`How many items would you like to add to stock? (Current: ${currentStock})`, "5");
    if (amount === null) return;

    const refillCount = parseInt(amount);
    if (isNaN(refillCount) || refillCount <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/artworks/${artworkId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stockQuantity: currentStock + refillCount,
          isAvailable: true
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully added ${refillCount} items to stock!`);
        fetchData();
      } else {
        throw new Error(data.error || 'Failed to refill stock');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  const isArtist = session.role === 'artist';

  const tabs = isArtist
    ? [
      { id: 'orders', label: 'Sales', icon: DollarSign },
      { id: 'my-artworks', label: 'My Artworks', icon: Palette },
      { id: 'profile', label: 'Profile', icon: User }
    ]
    : [
      { id: 'orders', label: 'My Orders', icon: Package },
      { id: 'favorites', label: 'Favorites', icon: Heart },
      { id: 'profile', label: 'Profile', icon: User }
    ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {isArtist ? 'Artist Dashboard' : 'My Dashboard'}
              </h1>
              <p className="text-gray-600">
                Welcome back, {session.email}
              </p>
            </div>
            {session.role === 'admin' && (
              <a
                href="/admin"
                className="px-6 py-2 bg-[#2B2B2B] text-[#E6E1DC] font-serif hover:bg-[#D2691E] transition-colors rounded-lg flex items-center shadow-lg"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Admin Panel
              </a>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                        ? 'border-amber-600 text-amber-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                </div>
              ) : (
                <>
                  {/* Orders Tab */}
                  {activeTab === 'orders' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {isArtist ? 'Recent Sales' : 'Your Orders'}
                      </h2>
                      {orders.length === 0 ? (
                        <div className="text-center py-12">
                          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600">
                            {isArtist ? 'No sales yet' : 'No orders yet'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map((order) => (
                            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="font-semibold text-gray-900">Order #{order.order_number}</p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-gray-700">{order.artwork_title || 'Artwork'}</p>
                                <p className="font-bold text-gray-900">₹{Number(order.total_price).toLocaleString()}</p>
                              </div>

                              {order.tracking_number && (
                                <p className="mt-2 text-sm text-amber-700 font-medium">
                                  Tracking: {order.tracking_number}
                                </p>
                              )}

                              {isArtist ? (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 items-end">
                                  <div className="flex-1 min-w-[150px]">
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Update Status</label>
                                    <select
                                      value={order.status}
                                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value, order.tracking_number)}
                                      className="w-full text-xs font-sans border border-gray-200 rounded p-2 focus:outline-none focus:border-amber-600"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="confirmed">Confirmed</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="delivered">Delivered</option>
                                    </select>
                                  </div>
                                  <div className="flex-1 min-w-[200px]">
                                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Tracking Number</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        defaultValue={order.tracking_number}
                                        placeholder="Enter tracking #"
                                        className="flex-1 text-xs font-sans border border-gray-200 rounded p-2 focus:outline-none focus:border-amber-600"
                                        onBlur={(e) => {
                                          if (e.target.value !== order.tracking_number) {
                                            handleUpdateOrderStatus(order.id, order.status, e.target.value);
                                          }
                                        }}
                                      />
                                    </div>
                                  </div>
                                  {order.status === 'pending' && (
                                    <button
                                      onClick={() => handleCancelOrder(order.id, order.order_number)}
                                      className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider mb-2"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              ) : (
                                (order.status === 'pending') && (
                                  <div className="mt-4 flex justify-end">
                                    <button
                                      onClick={() => handleCancelOrder(order.id, order.order_number)}
                                      className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider"
                                    >
                                      Cancel Order
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Favorites Tab */}
                  {activeTab === 'favorites' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Your Favorites</h2>
                      {favorites.length === 0 ? (
                        <div className="text-center py-12">
                          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600">No favorites yet</p>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {favorites.map((favorite) => (
                            <div key={favorite.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                              <div className="aspect-square bg-gray-100 relative">
                                {favorite.artwork_image_url && (
                                  <Image
                                    src={favorite.artwork_image_url}
                                    alt={favorite.artwork_title}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="p-4">
                                <h3 className="font-bold text-gray-900">{favorite.artwork_title}</h3>
                                <p className="text-sm text-gray-600">{favorite.artist_name}</p>
                                <p className="text-lg font-bold text-amber-600 mt-2">
                                  ₹{Number(favorite.artwork_price).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Artist Artworks Tab */}
                  {activeTab === 'my-artworks' && isArtist && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">My Artworks</h2>
                        <button
                          onClick={() => router.push('/dashboard/upload')}
                          className="flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <PlusCircle className="w-5 h-5 mr-2" />
                          Upload New
                        </button>
                      </div>
                      {artworks.length === 0 ? (
                        <div className="text-center py-12">
                          <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">No artworks uploaded yet</p>
                          <button
                            onClick={() => router.push('/dashboard/upload')}
                            className="inline-flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
                          >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Upload Your First Artwork
                          </button>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {artworks.map((artwork) => (
                            <div key={artwork.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                              <div className="aspect-square bg-gray-100 relative">
                                {artwork.image_url && (
                                  <Image
                                    src={artwork.image_url}
                                    alt={artwork.title}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                                {artwork.is_verified ? (
                                  <span className="absolute top-2 left-2 bg-blue-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                                    <CheckCircle className="w-3 h-3" /> Verified
                                  </span>
                                ) : (
                                  <span className="absolute top-2 left-2 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Pending Review
                                  </span>
                                )}
                                {artwork.is_available ? (
                                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                    Available
                                  </span>
                                ) : (
                                  <span className="absolute top-2 right-2 bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                                    Sold
                                  </span>
                                )}
                              </div>
                              <div className="p-4">
                                <h3 className="font-bold text-gray-900">{artwork.title}</h3>
                                <p className="text-sm text-gray-600">{artwork.tribe} • {artwork.medium}</p>
                                <div className="mt-2 text-xs font-semibold flex items-center gap-2">
                                  <span className={Number(artwork.stock_quantity) > 0 ? 'text-green-600' : 'text-red-600'}>
                                    Stock: {artwork.stock_quantity || 0}
                                  </span>
                                  <button
                                    onClick={() => handleRefillStock(artwork.id, Number(artwork.stock_quantity || 0))}
                                    className="text-amber-600 hover:text-amber-700 underline flex items-center gap-1"
                                  >
                                    Refill
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                  <button
                                    onClick={() => router.push(`/dashboard/edit/${artwork.id}`)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 font-medium rounded-lg transition-colors border border-amber-200"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteArtwork(artwork.id, artwork.title)}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors border border-red-200"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Profile Tab */}
                  {activeTab === 'profile' && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={session.email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                          <input
                            type="text"
                            value={session.role}
                            disabled
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 capitalize"
                          />
                        </div>

                        {/* Artist Profile Section */}
                        {session.role === 'artist' && artistProfile && (
                          <div className="mt-8 pt-8 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-amber-600" />
                                Artist Profile Information
                              </h3>
                              {!isEditingProfile && (
                                <button
                                  onClick={handleEditProfile}
                                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-sans text-xs uppercase tracking-widest rounded-lg transition-colors"
                                >
                                  Edit Profile
                                </button>
                              )}
                            </div>

                            {!isEditingProfile ? (
                              /* VIEW MODE */
                              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                <div className="flex flex-col md:flex-row gap-6">
                                  <div className="w-32 h-32 flex-shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                                    {artistProfile.profile_image_url ? (
                                      <img src={artistProfile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="text-4xl font-bold text-gray-300">{session.email?.[0]?.toUpperCase()}</div>
                                    )}
                                  </div>
                                  <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-1">Art Tradition</label>
                                        <p className="text-sm font-medium text-gray-900">{artistProfile.tribe || 'Not specified'}</p>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-1">Years Active</label>
                                        <p className="text-sm font-medium text-gray-900">{artistProfile.years_active || 'Not specified'}</p>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-1">Location</label>
                                        <p className="text-sm font-medium text-gray-900">{artistProfile.location || 'Not specified'}</p>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-1">Specialties</label>
                                        <p className="text-sm font-medium text-gray-900">{artistProfile.specialties || 'Not specified'}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-sans uppercase tracking-widest text-gray-400 mb-1">Biography</label>
                                      <p className="text-sm text-gray-700">{artistProfile.biography || 'No biography added yet.'}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* EDIT MODE */
                              <form onSubmit={handleUpdateProfile} className="space-y-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                  <div className="space-y-4 flex-1">
                                    <div>
                                      <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">
                                        Store Logo / Profile Image
                                      </label>
                                      <div className="relative">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={handleProfileImageUpload}
                                          disabled={uploadingImage}
                                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-amber-600 transition-colors font-sans file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        {uploadingImage && (
                                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                                        Upload your logo or profile photo (Max 5MB, JPG/PNG)
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Art Tradition (Tribe)</label>
                                        <input
                                          type="text"
                                          value={editedProfile?.tribe || ''}
                                          onChange={(e) => setEditedProfile({ ...editedProfile, tribe: e.target.value })}
                                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-amber-600 transition-colors font-sans"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Years Active</label>
                                        <input
                                          type="number"
                                          value={editedProfile?.years_active || ''}
                                          onChange={(e) => setEditedProfile({ ...editedProfile, years_active: e.target.value })}
                                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-amber-600 transition-colors font-sans"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Location</label>
                                        <input
                                          type="text"
                                          value={editedProfile?.location || ''}
                                          onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-amber-600 transition-colors font-sans"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Specialties</label>
                                        <input
                                          type="text"
                                          value={editedProfile?.specialties || ''}
                                          onChange={(e) => setEditedProfile({ ...editedProfile, specialties: e.target.value })}
                                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-amber-600 transition-colors font-sans"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="w-32 h-32 flex-shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                                    {editedProfile?.profile_image_url ? (
                                      <img src={editedProfile.profile_image_url} alt="Logo Preview" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="text-[10px] text-gray-300 text-center px-2 uppercase tracking-tighter">Logo Preview</div>
                                    )}
                                    <div className="absolute top-0 right-0 p-1 bg-amber-600 text-white rounded-bl-lg">
                                      <Palette className="w-3 h-3" />
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-sans uppercase tracking-widest text-gray-500 mb-2">Biography & Store Story</label>
                                  <textarea
                                    value={editedProfile?.biography || ''}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, biography: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-amber-600 transition-colors font-sans resize-none"
                                    placeholder="Tell your story and what makes your art unique..."
                                  />
                                </div>

                                <div className="flex gap-3">
                                  <button
                                    type="submit"
                                    disabled={updatingProfile}
                                    className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-sans uppercase tracking-widest text-xs font-bold rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                  >
                                    {updatingProfile ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Saving...
                                      </>
                                    ) : (
                                      'Save Changes'
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    disabled={updatingProfile}
                                    className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-sans uppercase tracking-widest text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        )}

                        {/* Loading state for artist profile */}
                        {session.role === 'artist' && hasArtistProfile === null && (
                          <div className="mt-8 pt-8 border-t border-gray-200">
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                              <span className="ml-3 text-gray-600">Loading profile...</span>
                            </div>
                          </div>
                        )}

                        {/* Artist Profile Alert (for artists without profile) */}
                        {session.role === 'artist' && hasArtistProfile === false && (
                          <div className="mt-8 pt-8 border-t border-gray-200">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                              <h3 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                                <Palette className="w-5 h-5" />
                                Complete Your Artist Profile
                              </h3>
                              <p className="text-sm text-amber-800 mb-4">
                                You need to complete your artist profile before you can upload and sell artwork on ArtRoot.
                              </p>
                              <button
                                onClick={() => router.push('/artist-onboarding')}
                                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                              >
                                <Palette className="w-4 h-4" />
                                Complete Artist Profile Now
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Upgrade to Artist Section (for viewers) */}
                        {session.role === 'viewer' && (
                          <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Become an Artist</h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Upgrade your account to start selling your tribal artwork on ArtRoot.
                            </p>
                            <button
                              onClick={() => router.push('/artist-onboarding')}
                              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                            >
                              <Palette className="w-4 h-4" />
                              Upgrade to Artist Account
                            </button>
                          </div>
                        )}

                        {/* Delete Account Section */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Danger Zone</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <button
                            onClick={() => {
                              if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
                                handleDeleteAccount();
                              }
                            }}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                          >
                            Delete My Account
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div >
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    </div>}>
      <DashboardContent />
    </Suspense>
  );
}
