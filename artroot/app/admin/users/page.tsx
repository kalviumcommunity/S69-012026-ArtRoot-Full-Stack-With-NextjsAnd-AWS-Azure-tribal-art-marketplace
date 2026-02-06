'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, ShieldAlert, Check, X, Loader2, BadgeCheck, ExternalLink, Search } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    artist_id: number | null;
    is_verified: boolean;
    tribe: string;
    biography?: string;
    location?: string;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedArtist, setSelectedArtist] = useState<User | null>(null);

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Failed to load users', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAction = async (targetUserId: number, action: 'verify_artist' | 'toggle_active', value: boolean) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ targetUserId, action, value })
            });
            if (res.ok) {
                // Refresh local state to reflect change quickly
                setUsers(prev => prev.map(u => {
                    if (u.id === targetUserId) {
                        return {
                            ...u,
                            is_verified: action === 'verify_artist' ? value : u.is_verified,
                            is_active: action === 'toggle_active' ? value : u.is_active
                        };
                    }
                    return u;
                }));
                if (selectedArtist && selectedArtist.id === targetUserId) {
                    setSelectedArtist(prev => prev ? {
                        ...prev,
                        is_verified: action === 'verify_artist' ? value : prev.is_verified
                    } : null);
                }
            }
        } catch (error) {
            console.error('Action failed', error);
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div>
            <h2 className="font-serif text-3xl text-[#2B2B2B] mb-8">User Management</h2>

            <div className="bg-white rounded-lg shadowoverflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-serif text-gray-600">User</th>
                            <th className="p-4 font-serif text-gray-600">Role</th>
                            <th className="p-4 font-serif text-gray-600">Status</th>
                            <th className="p-4 font-serif text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50">
                                <td className="p-4">
                                    <div className="font-medium text-[#2B2B2B]">{user.name}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="p-4 capitalize">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                        user.role === 'artist' ? 'bg-orange-100 text-orange-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {user.role}
                                    </span>
                                    {user.role === 'artist' && user.tribe && (
                                        <div className="text-xs text-gray-400 mt-1">{user.tribe} Tribe</div>
                                    )}
                                </td>
                                <td className="p-4">
                                    {user.is_active ? (
                                        <span className="text-green-600 text-xs font-medium flex items-center"><Check className="w-3 h-3 mr-1" /> Active</span>
                                    ) : (
                                        <span className="text-red-500 text-xs font-medium flex items-center"><X className="w-3 h-3 mr-1" /> Inactive</span>
                                    )}
                                </td>
                                <td className="p-4 flex gap-3">
                                    {/* Quick Bio Info */}
                                    {user.role === 'artist' && (
                                        <button
                                            title="Quick Bio Review"
                                            onClick={() => setSelectedArtist(user)}
                                            className="p-2 rounded hover:bg-gray-100 text-blue-500"
                                        >
                                            <Search className="w-5 h-5" />
                                        </button>
                                    )}

                                    {/* Artist Profile Link - BLUE SHIELD */}
                                    {user.role === 'artist' && user.artist_id && (
                                        <a
                                            href={`/artists/${user.artist_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="View Full Artist Portfolio"
                                            className="p-2 rounded hover:bg-gray-100 text-blue-500"
                                        >
                                            <Shield className="w-5 h-5" />
                                        </a>
                                    )}

                                    {/* Artist Verification Toggle */}
                                    {user.role === 'artist' && (
                                        <button
                                            title={user.is_verified ? "Unverify Artist" : "Verify Artist"}
                                            onClick={() => handleAction(user.id, 'verify_artist', !user.is_verified)}
                                            className={`p-2 rounded hover:bg-gray-100 ${user.is_verified ? 'text-green-600' : 'text-gray-400'}`}
                                        >
                                            <BadgeCheck className="w-5 h-5" />
                                        </button>
                                    )}

                                    {/* Ban/Unban - Prevent banning self/admins */}
                                    {user.role !== 'admin' && (
                                        <button
                                            title={user.is_active ? "Block User" : "Activate User"}
                                            onClick={() => handleAction(user.id, 'toggle_active', !user.is_active)}
                                            className={`p-2 rounded hover:bg-gray-100 ${user.is_active ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'}`}
                                        >
                                            {user.is_active ? <ShieldAlert className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Artist Detail Modal */}
            {selectedArtist && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-serif text-2xl text-gray-900">{selectedArtist.name}</h3>
                                {selectedArtist.artist_id && (
                                    <a
                                        href={`/artists/${selectedArtist.artist_id}`}
                                        target="_blank"
                                        className="text-[10px] text-blue-500 hover:underline flex items-center gap-1 mt-1 font-bold uppercase tracking-wider"
                                    >
                                        Visit Full Profile <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                            <button onClick={() => setSelectedArtist(null)} className="p-2 hover:bg-white rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#D2691E] mb-1">Tribe / Style</p>
                                    <p className="font-medium text-gray-900">{selectedArtist.tribe || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#D2691E] mb-1">Location</p>
                                    <p className="font-medium text-gray-900">{selectedArtist.location || 'Not provided'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-[#D2691E] mb-2">Biography</p>
                                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed max-h-48 overflow-y-auto italic">
                                    "{selectedArtist.biography || 'No biography provided yet by the artist.'}"
                                </div>
                            </div>
                            <div className="pt-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${selectedArtist.is_verified ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'}`} />
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        {selectedArtist.is_verified ? 'Verified Artist' : 'Pending Verification'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleAction(selectedArtist.id, 'verify_artist', !selectedArtist.is_verified)}
                                    className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${selectedArtist.is_verified
                                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                        : 'bg-[#D2691E] text-white hover:bg-[#b05516] shadow-lg shadow-orange-200'
                                        }`}
                                >
                                    {selectedArtist.is_verified ? 'Revoke Status' : 'Approve Artist'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

