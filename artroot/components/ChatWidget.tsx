'use client';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, User } from 'lucide-react';
import { getUserSession } from '@/lib/auth';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [conversationId, setConversationId] = useState<number | null>(null);

    useEffect(() => {
        const updateSession = () => {
            const s = getUserSession();
            setSession(s);
        };
        updateSession();
        window.addEventListener('auth-change', updateSession);
        return () => window.removeEventListener('auth-change', updateSession);
    }, []);

    useEffect(() => {
        const handleOpenChat = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to chat with support');
                return;
            }
            setIsOpen(true);
        };
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, []);

    useEffect(() => {
        let interval: any;
        if (isOpen) {
            fetchMessages();
            interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isOpen]);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const res = await fetch('/api/chat/messages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
                setConversationId(data.conversationId);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: input, conversationId })
            });
            if (res.ok) {
                setInput('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Failed to send message', error);
        } finally {
            setLoading(false);
        }
    };

    if (!session || !isOpen) return null; // Only show if logged in AND explicitly opened

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-80 md:w-96 flex flex-col overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-[#2B2B2B] p-4 flex justify-between items-center text-[#E6E1DC]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#D2691E] rounded-full flex items-center justify-center">
                            <User className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-serif text-sm">ArtRoot Support</h3>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] uppercase tracking-widest text-[#E6E1DC]/60">Online</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-1 h-96 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="font-sans text-sm text-gray-500">Hello! 👋 How can we help you today?</p>
                        </div>
                    ) : (
                        messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex ${m.sender_id === Number(session.userId) ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${m.sender_id === Number(session.userId)
                                        ? 'bg-[#D2691E] text-white rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                        }`}
                                >
                                    <p className="font-sans leading-relaxed">{m.message}</p>
                                    <span className={`text-[9px] block mt-1 opacity-70 ${m.sender_id === Number(session.userId) ? 'text-right' : 'text-left'}`}>
                                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#D2691E] font-sans"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="bg-[#D2691E] text-white p-2 rounded-full hover:bg-[#b05516] transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </form>
            </div>
        </div>
    );
}
