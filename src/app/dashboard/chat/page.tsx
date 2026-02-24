'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { FiSend, FiHash } from 'react-icons/fi'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Message {
    id: string
    content: string
    created_at: string
    user_id: string
    room: string
    user_name: string
}

const ROOMS = [
    { id: 'General', label: '🌍 General' },
    { id: 'España', label: '🇪🇸 España' },
    { id: 'Francia', label: '🇫🇷 Francia' },
    { id: 'Italia', label: '🇮🇹 Italia' },
    { id: 'Alemania', label: '🇩🇪 Alemania' },
    { id: 'Portugal', label: '🇵🇹 Portugal' },
    { id: 'Noticias', label: '📰 Noticias' },
    { id: 'Eventos', label: '📅 Eventos' },
]

function ChatContent() {
    const searchParams = useSearchParams()
    const initialRoom = searchParams.get('room') || 'General'
    const [activeRoom, setActiveRoom] = useState(initialRoom)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMsg, setNewMsg] = useState('')
    const [userId, setUserId] = useState('')
    const [userName, setUserName] = useState('')
    const [sending, setSending] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) {
                setUserId(data.user.id)
                setUserName(data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Usuario')
            }
        })
    }, [])

    const loadMessages = useCallback(async () => {
        const { data } = await supabase
            .from('messages')
            .select('*')
            .eq('room', activeRoom)
            .order('created_at', { ascending: true })
            .limit(50)
        if (data) setMessages(data)
    }, [activeRoom])

    useEffect(() => {
        loadMessages()
        const channel = supabase
            .channel(`room-${activeRoom}`)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'messages',
                filter: `room=eq.${activeRoom}`
            }, (payload) => {
                setMessages(prev => [...prev, payload.new as Message])
            })
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [activeRoom, loadMessages])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMsg.trim() || !userId) return
        setSending(true)
        await supabase.from('messages').insert({
            content: newMsg.trim(),
            room: activeRoom,
            user_id: userId,
            user_name: userName,
        })
        setNewMsg('')
        setSending(false)
    }

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    return (
        <div className="animate-fade-in" style={{ display: 'flex', gap: 0, height: 'calc(100vh - 145px)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {/* Room list */}
            <div style={{
                width: 220, background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0
            }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1 }}>SALAS</div>
                </div>
                <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
                    {ROOMS.map(r => (
                        <button
                            key={r.id}
                            onClick={() => setActiveRoom(r.id)}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                background: activeRoom === r.id ? 'rgba(0,45,98,0.4)' : 'transparent',
                                color: activeRoom === r.id ? '#60a5fa' : 'var(--text-secondary)',
                                fontWeight: activeRoom === r.id ? 600 : 400,
                                fontSize: 13, textAlign: 'left', transition: 'all 0.2s',
                                fontFamily: 'Inter, sans-serif'
                            }}
                        >
                            <FiHash size={13} /> {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
                {/* Header */}
                <div style={{
                    padding: '14px 20px', borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: 8
                }}>
                    <FiHash size={16} color="#60a5fa" />
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{activeRoom}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
                        — Sala de la comunidad dominicana en {activeRoom}
                    </span>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
                            🇩🇴 Sé el primero en escribir en #{activeRoom}
                        </div>
                    )}
                    {messages.map((msg, i) => {
                        const isOwn = msg.user_id === userId
                        const showAvatar = i === 0 || messages[i - 1].user_id !== msg.user_id
                        return (
                            <div key={msg.id} style={{
                                display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row',
                                gap: 10, marginBottom: showAvatar ? 16 : 4, alignItems: 'flex-end'
                            }}>
                                {showAvatar && !isOwn && (
                                    <div style={{
                                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-light))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 700, color: 'white'
                                    }}>
                                        {msg.user_name?.slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                {!showAvatar && !isOwn && <div style={{ width: 34 }} />}
                                <div style={{ maxWidth: '70%' }}>
                                    {showAvatar && !isOwn && (
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, paddingLeft: 4 }}>
                                            {msg.user_name}
                                        </div>
                                    )}
                                    <div style={{
                                        padding: '10px 14px', borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        background: isOwn
                                            ? 'linear-gradient(135deg, var(--blue-primary), var(--blue-light))'
                                            : 'var(--bg-card)',
                                        border: isOwn ? 'none' : '1px solid var(--border)',
                                        fontSize: 14, lineHeight: 1.5, color: 'white'
                                    }}>
                                        {msg.content}
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, textAlign: isOwn ? 'right' : 'left', paddingLeft: 4 }}>
                                        {formatTime(msg.created_at)}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} style={{
                    padding: '16px 20px', borderTop: '1px solid var(--border)',
                    background: 'var(--bg-secondary)', display: 'flex', gap: 12, alignItems: 'center'
                }}>
                    <input
                        id="chat-input"
                        value={newMsg}
                        onChange={e => setNewMsg(e.target.value)}
                        placeholder={`Escribe en #${activeRoom}...`}
                        className="input"
                        style={{ flex: 1, padding: '12px 16px' }}
                        maxLength={500}
                    />
                    <button
                        id="chat-send"
                        type="submit"
                        className="btn btn-primary"
                        style={{ padding: '12px 20px', flexShrink: 0 }}
                        disabled={sending || !newMsg.trim()}
                    >
                        <FiSend size={16} />
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Cargando chat...</div>}>
            <ChatContent />
        </Suspense>
    )
}
