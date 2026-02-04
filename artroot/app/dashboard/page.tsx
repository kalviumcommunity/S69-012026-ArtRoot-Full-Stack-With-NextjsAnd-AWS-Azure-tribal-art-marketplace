'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getUserSession } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';
import { Package, Heart, User, PlusCircle, Palette, DollarSign, TrendingUp, Trash2 } from 'lucide-react';
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
        const response = await fetch(`${API_BASE_URL}/orders/my`, { headers });
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
        const response = await fetch(`${API_BASE_URL}/orders/artist`, { headers });
        const salesData = await response.json();

        // Get artist profile to get the id for filtering
        const profRes = await fetch(`${API_BASE_URL}/artists/profile`, { headers });
        const profData = await profRes.json();
        const artistId = profData.success && profData.data ? profData.data.id : null;

        const artworksUrl = artistId
          ? `${API_BASE_URL}/artworks?artistId=${artistId}`
          : `${API_BASE_URL}/artworks`;

        const artworksResponse = await fetch(artworksUrl, { headers });
        const artworksData = await artworksResponse.json();

        if (artworksData.success) {
          setArtworks(artworksData.data || []);
        }
        if (salesData.success) {
          setOrders(salesData.data || []);
        }
      } else if (activeTab === 'profile' && session.role === 'artist') {
        // Check if artist has a profile
        try {
          const profileResponse = await fetch(`${API_BASE_URL}/artists/profile`, { headers });
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setHasArtistProfile(profileData.success && profileData.data);
          } else {
            // If 404 or other error, artist doesn't have profile
            setHasArtistProfile(false);
          }
        } catch (err) {
          // Network or parse error - assume no profile
          console.error('Error checking artist profile:', err);
          setHasArtistProfile(false);
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isArtist ? 'Artist Dashboard' : 'My Dashboard'}
            </h1>
            <p className="text-gray-600">
              Welcome back, {session.email}
            </p>
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
                              {(order.status === 'pending' || (isArtist && order.status === 'confirmed')) && (
                                <div className="mt-4 flex justify-end">
                                  <button
                                    onClick={() => handleCancelOrder(order.id, order.order_number)}
                                    className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors uppercase tracking-wider"
                                  >
                                    Cancel Order
                                  </button>
                                </div>
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
                                <p className="text-lg font-bold text-amber-600 mt-2">
                                  ₹{Number(artwork.price).toLocaleString()}
                                </p>
                                <button
                                  onClick={() => handleDeleteArtwork(artwork.id, artwork.title)}
                                  className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors border border-red-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Artwork
                                </button>
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
    </div>
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
