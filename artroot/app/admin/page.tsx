'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Users, Palette, ShoppingBag, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch('/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.status === 403) {
                    alert('Access Denied: Admin only');
                    router.push('/');
                    return;
                }
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Failed to load stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [router]);

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin w-8 h-8 text-[#D2691E]" /></div>;
    }

    return (
        <div>
            <h2 className="font-serif text-3xl text-[#2B2B2B] mb-8">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    bg="bg-blue-50"
                />
                <StatCard
                    title="Total Artists"
                    value={stats?.totalArtists || 0}
                    icon={<Palette className="w-6 h-6 text-purple-600" />}
                    bg="bg-purple-50"
                />
                <StatCard
                    title="Total Artworks"
                    value={stats?.totalArtworks || 0}
                    icon={<ShoppingBag className="w-6 h-6 text-orange-600" />}
                    bg="bg-orange-50"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                    icon={<IndianRupee className="w-6 h-6 text-green-600" />}
                    bg="bg-green-50"
                />
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, bg }: any) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <div className={`p-4 rounded-full ${bg} mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}
