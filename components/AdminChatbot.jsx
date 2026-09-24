// app/components/AdminChatbot.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, X, Send, Sparkles, Loader2,
  Minimize2, Maximize2, Bot, User, Trash2, Leaf,
} from 'lucide-react';

// ==========================================
// ✅ FIX: env var already contains `/api/admin`
// Strip it here so we can safely append `/api/admin/chat/...`
// without duplicating the path.
// ==========================================
const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/admin';

const API_BASE_URL = RAW_API_URL
  .replace(/\/api\/admin\/?$/, '')
  .replace(/\/api\/?$/, '')
  .replace(/\/$/, '');

// Debug log (visible in browser console)
if (typeof window !== 'undefined') {
  console.log('🔍 AdminChatbot API base:', API_BASE_URL);
}

const QUICK_PROMPTS = [
  'How many orders today?',
  'Show low stock products',
  'Best selling plant this week',
  'Pending customer reviews',
];

const SESSION_KEY = 'greenscape_admin_chat_session';
const MESSAGES_KEY = 'greenscape_admin_chat_messages';

export default function AdminChatbot() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ==========================================
  // INIT
  // ==========================================
  useEffect(() => {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 'admin-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      localStorage.setItem(SESSION_KEY, sid);
    }
    setSessionId(sid);

    try {
      const saved = localStorage.getItem(MESSAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch (e) {}

    setMessages((prev) =>
      prev.length === 0
        ? [{
            id: 'welcome',
            role: 'assistant',
            content:
              "Hi! 👋 I'm your GreenScape Admin Assistant. Ask me anything about products, orders, customers, or inventory.",
            timestamp: Date.now(),
          }]
        : prev
    );
  }, []);

  // ==========================================
  // PERSIST MESSAGES
  // ==========================================
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages.slice(-50)));
      } catch (e) {}
    }
  }, [messages]);

  // ==========================================
  // AUTO-SCROLL
  // ==========================================
  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  // ==========================================
  // FOCUS INPUT
  // ==========================================
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, minimized]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================
  const handleSend = async (text) => {
    const messageText = (text || input).trim();
    if (!messageText || sending) return;

    const userMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    const placeholderId = 'ai-' + Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: placeholderId,
        role: 'assistant',
        content: '',
        pending: true,
        timestamp: Date.now(),
      },
    ]);

    try {
      // ✅ Correct URL: http://localhost:5001/api/admin/chat/message
      const url = `${API_BASE_URL}/api/admin/chat/message`;
      console.log('📤 Sending to:', url);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // sends adminToken cookie
        body: JSON.stringify({
          message: messageText,
          sessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Chat service unavailable');
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: data.reply, pending: false }
            : m
        )
      );

      if (!open) setUnreadCount((c) => c + 1);
    } catch (err) {
      console.error('❌ Chat error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? {
                ...m,
                content: `⚠️ ${err.message}. Please try again.`,
                pending: false,
                error: true,
              }
            : m
        )
      );
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = async () => {
    if (!window.confirm('Clear chat history?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/admin/chat/session/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (e) {}
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: 'Chat cleared. How can I help you? 🌱',
        timestamp: Date.now(),
      },
    ]);
    localStorage.removeItem(MESSAGES_KEY);
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      {/* FLOATING BUTTON */}
      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setUnreadCount(0);
          }}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open AI chat"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2B7A4B] to-[#1a5a37] shadow-lg shadow-[#2B7A4B]/30 flex items-center justify-center hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="absolute inset-0 rounded-full bg-[#2B7A4B]/40 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#4ade80] border-2 border-white flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -left-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </button>
      )}

      {/* CHAT WINDOW */}
      {open && (
        <div
          className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 ${
            minimized
              ? 'bottom-6 right-6 w-[320px] h-[60px]'
              : 'bottom-6 right-6 w-[380px] h-[600px] max-h-[calc(100vh-3rem)] max-w-[calc(100vw-3rem)]'
          }`}
        >
          {/* ---------- HEADER ---------- */}
          <div className="bg-gradient-to-br from-[#2B7A4B] to-[#1a5a37] text-white p-4 flex items-center gap-3 shrink-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#4ade80] rounded-full border-2 border-[#2B7A4B]"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm">GreenScape AI</h3>
                <Sparkles className="w-3 h-3 text-[#4ade80]" />
              </div>
              <p className="text-[11px] text-white/70">
                {sending ? 'Typing...' : 'Online · Ready to help'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                title="Clear chat"
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMinimized((m) => !m)}
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                {minimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* ---------- MESSAGES ---------- */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2 ${
                        isUser ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          isUser
                            ? 'bg-[#2B7A4B]'
                            : 'bg-gradient-to-br from-[#4ade80] to-[#2B7A4B]'
                        }`}
                      >
                        {isUser ? (
                          <User className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Bot className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <div
                        className={`flex flex-col max-w-[80%] ${
                          isUser ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                            isUser
                              ? 'bg-[#2B7A4B] text-white rounded-tr-sm'
                              : msg.error
                              ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm'
                          }`}
                        >
                          {msg.pending ? (
                            <div className="flex items-center gap-1.5 py-0.5">
                              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                              <span
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0.15s' }}
                              ></span>
                              <span
                                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: '0.3s' }}
                              ></span>
                            </div>
                          ) : (
                            msg.content
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* ---------- QUICK PROMPTS ---------- */}
              {messages.length <= 2 && (
                <div className="px-4 pt-3 pb-2 border-t border-gray-100 bg-white">
                  <p className="text-[10px] text-gray-400 uppercase font-medium mb-2">
                    Quick questions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSend(prompt)}
                        disabled={sending}
                        className="text-[11px] px-3 py-1.5 bg-[#2B7A4B]/5 text-[#2B7A4B] border border-[#2B7A4B]/20 rounded-full hover:bg-[#2B7A4B]/10 transition-colors disabled:opacity-50"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ---------- INPUT ---------- */}
              <div className="p-3 border-t border-gray-100 bg-white shrink-0">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Ask me anything..."
                    disabled={sending}
                    className="flex-1 resize-none px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2B7A4B] focus:border-transparent max-h-24 disabled:opacity-60"
                    style={{ minHeight: '42px' }}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || sending}
                    className="w-10 h-10 rounded-xl bg-[#2B7A4B] text-white flex items-center justify-center hover:bg-[#1f5a37] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center flex items-center justify-center gap-1">
                  <Leaf className="w-3 h-3 text-[#2B7A4B]" />
                  Powered by GreenScape AI
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}