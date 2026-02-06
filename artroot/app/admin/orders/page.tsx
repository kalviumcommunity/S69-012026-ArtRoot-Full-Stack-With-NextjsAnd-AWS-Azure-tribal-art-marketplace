'use client';
import { useEffect, useState } from 'react';
import { Loader2, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Order {
    id: number;
    order_number: string;
    created_at: string;
    status: string;
    total_price: string;
    buyer_name: string;
    buyer_email: string;
    artwork_title: string;
    artist_name: string;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('/api/admin/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (error) {
            console.error('Failed to load orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId: number, newStatus: string) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId, status: newStatus })
            });

            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            }
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'shipped': return 'bg-blue-100 text-blue-700';
            case 'confirmed': return 'bg-purple-100 text-purple-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div>
            <h2 className="font-serif text-3xl text-[#2B2B2B] mb-8">Order Management</h2>

            <div className="bg-white rounded-lg shadowoverflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-serif text-gray-600">Order Ref</th>
                            <th className="p-4 font-serif text-gray-600">Item & Artist</th>
                            <th className="p-4 font-serif text-gray-600">Buyer</th>
                            <th className="p-4 font-serif text-gray-600">Amount</th>
                            <th className="p-4 font-serif text-gray-600">Status</th>
                            <th className="p-4 font-serif text-gray-600">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map(order => (
                            <tr key={order.id} className="hover:bg-gray-50/50">
                                <td className="p-4">
                                    <div className="font-medium text-[#2B2B2B]">#{order.order_number}</div>
                                    <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="p-4">
                                    <div className="font-medium">{order.artwork_title}</div>
                                    <div className="text-xs text-gray-500">by {order.artist_name}</div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm">{order.buyer_name}</div>
                                    <div className="text-xs text-gray-400">{order.buyer_email}</div>
                                </td>
                                <td className="p-4 font-medium">
                                    ₹{parseFloat(order.total_price).toLocaleString()}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                        className="text-sm border rounded p-1 bg-white focus:ring-2 focus:ring-[#D2691E] outline-none"
                                        disabled={order.status === 'cancelled' || order.status === 'delivered'}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirm</option>
                                        <option value="shipped">Ship</option>
                                        <option value="delivered">Deliver</option>
                                        <option value="cancelled">Cancel</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
