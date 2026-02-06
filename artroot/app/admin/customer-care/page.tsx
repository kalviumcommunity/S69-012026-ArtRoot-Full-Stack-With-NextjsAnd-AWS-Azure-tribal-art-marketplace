'use client';
import { useState, useEffect, useRef } from 'react';
import { Loader2, Send, User, MessageSquare } from 'lucide-react';

export default function AdminCustomerCare() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Refresh list every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedId) {
            fetchMessages(selectedId);
            const interval = setInterval(() => fetchMessages(selectedId), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/chat/conversations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setConversations(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/chat/messages?conversationId=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !selectedId || sending) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: input, conversationId: selectedId })
            });
            if (res.ok) {
                setInput('');
                fetchMessages(selectedId);
            }
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setSending(false);
        }
    };

    if (loading && conversations.length === 0) {
        return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="h-[80vh] flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-100 flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-serif text-lg text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#D2691E]" />
                        Active Chats
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No active conversations</div>
                    ) : (
                        conversations.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedId(c.id)}
                                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 ${selectedId === c.id ? 'bg-[#D2691E]/5 border-l-4 border-l-[#D2691E]' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-sm text-gray-900">{c.user_name}</span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{c.last_message}</p>
                                {c.unread_count > 0 && (
                                    <span className="mt-2 inline-block bg-[#D2691E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {c.unread_count} new
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50/30">
                {selectedId ? (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-white border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#D2691E]/10 rounded-full flex items-center justify-center text-[#D2691E]">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">
                                    {conversations.find(c => c.id === selectedId)?.user_name}
                                </h3>
                                <p className="text-[10px] uppercase tracking-widest text-green-600 font-bold">Active Customer</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex ${m.sender_name === 'Admin' || m.sender_id === conversations.find(c => c.id === selectedId)?.admin_id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-2xl p-4 text-sm shadow-sm ${m.sender_id === conversations.find(c => c.id === selectedId)?.user_id
                                                ? 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                                : 'bg-[#2B2B2B] text-white rounded-br-none'
                                            }`}
                                    >
                                        <p className="font-sans leading-relaxed">{m.message}</p>
                                        <span className="text-[9px] block mt-1 opacity-50">
                                            {new Date(m.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-4">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Write a reply..."
                                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D2691E]/20 focus:border-[#D2691E] font-sans"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || sending}
                                className="bg-[#D2691E] text-white px-6 py-2 rounded-xl hover:bg-[#b05516] transition-all flex items-center gap-2 font-sans text-xs uppercase tracking-widest font-bold disabled:opacity-50"
                            >
                                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send</>}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-10" />
                        <h3 className="font-serif text-xl mb-2">Customer Care Center</h3>
                        <p className="font-sans text-sm max-w-xs">Select a conversation from the left to start helping your customers in real-time.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
