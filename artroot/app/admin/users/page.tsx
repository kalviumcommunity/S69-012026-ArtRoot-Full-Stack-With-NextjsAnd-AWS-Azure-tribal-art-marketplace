'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, X, Shield, ShieldAlert, BadgeCheck } from 'lucide-react';

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
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

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
                                    {/* Artist Verification */}
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
        </div>
    );
}
