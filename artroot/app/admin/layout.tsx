import Link from 'next/link';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F5F5F3] font-sans">
            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-[#2B2B2B] text-[#E6E1DC] min-h-screen fixed left-0 top-0 overflow-y-auto">
                    <div className="p-6">
                        <h1 className="font-serif text-2xl mb-8">ArtRoot Admin</h1>
                        <nav className="space-y-4">
                            <Link href="/admin" className="block py-2 hover:text-[#D2691E] transition-colors">Overview</Link>
                            <Link href="/admin/users" className="block py-2 hover:text-[#D2691E] transition-colors">Users & Artists</Link>
                            <Link href="/admin/artworks" className="block py-2 hover:text-[#D2691E] transition-colors">Artworks</Link>
                            <Link href="/admin/orders" className="block py-2 hover:text-[#D2691E] transition-colors">Orders</Link>
                            <Link href="/admin/customer-care" className="block py-2 hover:text-[#D2691E] transition-colors flex items-center h-full">Customer Care <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" title="New messages"></span></Link>
                            <div className="border-t border-[#E6E1DC]/10 my-4 pt-4">
                                <Link href="/" className="block py-2 text-sm opacity-60 hover:opacity-100">← Back to Site</Link>
                            </div>
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-64 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
