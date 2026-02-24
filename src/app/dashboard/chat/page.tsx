'use client'
import { useEffect, useRef, useState, useCallback, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { FiSend, FiHash, FiImage, FiSmile, FiBellOff, FiBell } from 'react-icons/fi'
import { useSearchParams } from 'next/navigation'

interface Message {
    id: string
    content: string
    created_at: string
    user_id: string
    room: string
    user_name: string
    media_url?: string
    is_ai?: boolean
    read_by?: string[]
}

const ROOMS = [
    { id: 'General', label: '🌍 General' },
    { id: 'España', label: '🇪🇸 España' },
    { id: 'Francia', label: '🇫🇷 Francia' },
    { id: 'Italia', label: '🇮🇹 Italia' },
    { id: 'Alemania', label: '🇩🇪 Alemania' },
    { id: 'Suiza', label: '🇨🇭 Suiza' },
    { id: 'Reino Unido', label: '🇬🇧 Reino Unido' },
    { id: 'Portugal', label: '🇵🇹 Portugal' },
    { id: 'Países Bajos', label: '🇳🇱 Países Bajos' },
    { id: 'Bélgica', label: '🇧🇪 Bélgica' },
    { id: 'Rep. Checa', label: '🇨🇿 Rep. Checa' },
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
    const [uploadingImage, setUploadingImage] = useState(false)
    const [showEmojis, setShowEmojis] = useState(false)
    const [isShaking, setIsShaking] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const bottomRef = useRef<HTMLDivElement>(null)

    // Simulador de diálogos para cuando la sala está vacía
    const loadCollaborators = useCallback((currentRoom: string, currentMessages: Message[]) => {
        if (currentMessages.length > 5) return;
        const bots = [
            { id: 'bot-1', name: 'Laura Gómez', color: '#fca5a5', msg: `¡Hola equipo! ¿Qué tal todo en ${currentRoom}?` },
            { id: 'bot-2', name: 'Carlos🇩🇴', color: '#93c5fd', msg: currentRoom === 'General' ? 'Todo bien, activando la comunidad 🙌' : `Por aquí en ${currentRoom} listos para apoyar a tope.` },
            { id: 'bot-3', name: 'Ana María', color: '#fdba74', msg: 'Saludos a todos los compatriotas 👋' }
        ]

        let count = 0;
        const interval = setInterval(() => {
            if (count >= bots.length) {
                clearInterval(interval);
                return;
            }
            const b = bots[count];
            setMessages(prev => {
                const newMsg: Message = {
                    id: `local-bot-${Date.now()}-${b.id}`,
                    content: b.msg,
                    created_at: new Date().toISOString(),
                    user_id: b.id,
                    room: currentRoom,
                    user_name: b.name,
                };
                return [...prev, newMsg];
            })
            count++;
        }, 3000)

        return () => clearInterval(interval)
    }, [])

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
            .limit(100)

        if (data) {
            setMessages(data)
            // Lanza los bots si hay pocos mensajes para que no se vea vacío
            if (data.length < 2) {
                loadCollaborators(activeRoom, data);
            }
        }
    }, [activeRoom, loadCollaborators])

    useEffect(() => {
        loadMessages()
        const channel = supabase
            .channel(`room-${activeRoom}`)
            .on('postgres_changes', {
                event: 'INSERT', schema: 'public', table: 'messages',
                filter: `room=eq.${activeRoom}`
            }, (payload) => {
                const newMsg = payload.new as Message;
                if (newMsg.content === '*🔔 ZUMBIDO*') {
                    handleZumbido()
                }
                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg]
                })
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [activeRoom, loadMessages])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleZumbido = () => {
        setIsShaking(true);
        if (typeof window !== 'undefined') {
            const audio = new Audio('/zumbido.mp3'); // En el futuro se puede añadir archivo real
            audio.play().catch(() => { });
        }
        setTimeout(() => setIsShaking(false), 500);
    }

    const sendZumbido = async () => {
        if (!userId) return
        await supabase.from('messages').insert({
            content: '*🔔 ZUMBIDO*',
            room: activeRoom,
            user_id: userId,
            user_name: userName,
        })
    }

    const sendAIResponse = async (room: string) => {
        const responses = [
            "Colladin: ¡Hola! En República Dominicana el turismo sigue creciendo a niveles históricos, y para el 2028 esperamos grandes cosas.",
            "Colladin: ¡Saludos desde la IA! La diáspora europea es parte vital de nuestra economía. 💪 ¿De qué país nos escribes?",
            "Colladin: Hablando de política, las propuestas para fortalecer nuestros lazos con la JCE son una prioridad para nosotros.",
            "Colladin: ¿Alguien más extraña el mangú? 🇩🇴 ¡Sigamos conectando y ayudando a nuestra gente!",
        ]
        const randomResp = responses[Math.floor(Math.random() * responses.length)]

        await supabase.from('messages').insert({
            content: randomResp,
            room: room,
            user_id: '00000000-0000-0000-0000-000000000000', // Mock AI uuid
            user_name: 'Colladin (IA)',
            is_ai: true
        })
    }

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        const text = newMsg.trim();
        if (!text || !userId) return

        setSending(true)
        setNewMsg('') // Optimistic clear

        const { data, error } = await supabase.from('messages').insert({
            content: text,
            room: activeRoom,
            user_id: userId,
            user_name: userName,
        }).select().single()

        if (!error && data) {
            setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data])
        }

        // Trigger AI
        if (text.toLowerCase().includes('@colladin')) {
            setTimeout(() => sendAIResponse(activeRoom), 1500 + Math.random() * 1000)
        }

        setSending(false)
        setShowEmojis(false)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !userId) return

        setUploadingImage(true)
        try {
            const ext = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
            const filePath = `images/${fileName}`

            // 1. Upload
            const { error: uploadError } = await supabase.storage
                .from('chat_media')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('chat_media')
                .getPublicUrl(filePath)

            // 3. Send message with media
            await supabase.from('messages').insert({
                content: '📷 Imagen subida',
                room: activeRoom,
                user_id: userId,
                user_name: userName,
                media_url: publicUrl,
                media_type: 'image'
            })

        } catch (error) {
            console.error("Error subiendo imagen", error)
            alert("No se pudo subir la imagen. Asegúrate de tener el bucket 'chat_media' creado libre de restricciones para autenticados.")
        } finally {
            setUploadingImage(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    const renderTextWithMentions = (text: string) => {
        if (text === '*🔔 ZUMBIDO*') {
            return <i style={{ color: '#ef4444', fontWeight: 'bold' }}>🔔 Envió un zumbido...</i>
        }

        const parts = text.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} style={{ color: '#60a5fa', fontWeight: 600 }}>{part}</span>
            }
            return part;
        });
    }

    return (
        <div className={`chat-container ${isShaking ? 'shake-animation' : ''}`} style={{
            display: 'flex', gap: 0, height: 'calc(100vh - 145px)',
            borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
            {/* Room list */}
            <div style={{
                width: 240, background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0
            }} className="hide-mobile">
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1 }}>SALAS DE CHAT</div>
                </div>
                <div style={{ overflowY: 'auto', flex: 1, padding: '12px' }}>
                    {ROOMS.map(r => (
                        <button
                            key={r.id}
                            onClick={() => setActiveRoom(r.id)}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                background: activeRoom === r.id ? 'var(--blue-light)' : 'transparent',
                                color: activeRoom === r.id ? 'white' : 'var(--text-secondary)',
                                fontWeight: activeRoom === r.id ? 600 : 500,
                                fontSize: 14, textAlign: 'left', transition: 'all 0.2s',
                                marginBottom: 4
                            }}
                        >
                            <FiHash size={16} color={activeRoom === r.id ? "white" : "var(--text-muted)"} /> {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ece5dd' /* WhatsApp BG style */ }}>
                {/* Header */}
                <div style={{
                    padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.08)',
                    background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', zIndex: 10
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-primary), var(--red-primary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                    }}>
                        <FiHash size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{activeRoom}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {messages.length} mensajes • Diáspora en acción
                        </div>
                    </div>

                    <button onClick={sendZumbido} title="Enviar Zumbido" style={{
                        marginLeft: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                        border: 'none', padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13
                    }}>
                        <FiBell size={16} /> Zumbido
                    </button>
                </div>

                {/* Messages */}
                <div style={{
                    flex: 1, overflowY: 'auto', padding: '24px',
                    display: 'flex', flexDirection: 'column', gap: 12,
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                    backgroundBlendMode: 'overlay'
                }}>
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', margin: 'auto', background: 'rgba(255,255,255,0.8)', padding: '12px 24px', borderRadius: 20, fontSize: 14, boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            🇩🇴 Sé el primero en escribir en #{activeRoom}. Mencionando a <b>@Colladin</b> recibirás una respuesta de nuestra IA.
                        </div>
                    )}

                    {messages.map((msg, i) => {
                        const isOwn = msg.user_id === userId
                        const isAi = msg.is_ai || msg.user_name === 'Colladin (IA)'
                        const showAvatar = i === 0 || messages[i - 1].user_id !== msg.user_id

                        return (
                            <div key={msg.id} style={{
                                display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row',
                                gap: 8, marginTop: showAvatar ? 8 : 0, maxWidth: '85%',
                                alignSelf: isOwn ? 'flex-end' : 'flex-start'
                            }}>
                                {!isOwn && showAvatar && (
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                                        background: isAi ? '#10b981' : 'var(--blue-primary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 10, fontWeight: 700, color: 'white', marginTop: 18
                                    }}>
                                        {isAi ? 'IA' : msg.user_name?.slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                {!isOwn && !showAvatar && <div style={{ width: 28 }} />}

                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {!isOwn && showAvatar && (
                                        <div style={{ fontSize: 12, color: isAi ? '#10b981' : 'var(--text-secondary)', fontWeight: 600, marginBottom: 4, marginLeft: 4 }}>
                                            {msg.user_name}
                                        </div>
                                    )}
                                    <div style={{
                                        padding: msg.media_url ? '4px' : '8px 14px',
                                        borderRadius: isOwn ? '12px 0px 12px 12px' : '0px 12px 12px 12px',
                                        background: isOwn ? '#dcf8c6' : '#ffffff', // WhatsApp aesthetic
                                        color: '#303030',
                                        fontSize: 14, lineHeight: 1.4,
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                        position: 'relative'
                                    }}>
                                        {msg.media_url ? (
                                            <div>
                                                <img src={msg.media_url} alt="Media" style={{ width: '100%', maxWidth: 280, borderRadius: 8, display: 'block' }} loading="lazy" />
                                                <div style={{ padding: '0px 8px 4px', fontSize: 13, marginTop: 4 }}>
                                                    {msg.content !== '📷 Imagen subida' && msg.content}
                                                </div>
                                            </div>
                                        ) : (
                                            renderTextWithMentions(msg.content)
                                        )}

                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            justifyContent: 'flex-end', marginTop: 4,
                                            fontSize: 10, color: '#888'
                                        }}>
                                            {formatTime(msg.created_at)}
                                            {isOwn && (
                                                <span style={{ color: '#34b7f1', fontSize: 14 }}>✓✓</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input area */}
                <div style={{ background: '#f0f0f0', padding: '12px 20px', position: 'relative' }}>
                    {showEmojis && (
                        <div style={{
                            position: 'absolute', bottom: '100%', left: 20, marginBottom: 8,
                            background: 'white', padding: 12, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            display: 'flex', gap: 8, fontSize: 24
                        }}>
                            {['😀', '😂', '❤️', '👍', '🙏', '🔥', '🇩🇴', '🎉'].map(emoji => (
                                <button key={emoji} onClick={() => { setNewMsg(prev => prev + emoji); setShowEmojis(false) }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={sendMessage} style={{
                        display: 'flex', gap: 12, alignItems: 'center'
                    }}>
                        <button type="button" onClick={() => setShowEmojis(!showEmojis)} style={{
                            background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 8
                        }}>
                            <FiSmile size={24} />
                        </button>

                        <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                            background: 'none', border: 'none', color: uploadingImage ? '#ccc' : '#666', cursor: 'pointer', padding: 8
                        }} disabled={uploadingImage}>
                            <FiImage size={24} className={uploadingImage ? "animate-pulse" : ""} />
                        </button>

                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleImageUpload}
                        />

                        <input
                            value={newMsg}
                            onChange={e => setNewMsg(e.target.value)}
                            placeholder={`Escribe un mensaje en #${activeRoom}...`}
                            style={{
                                flex: 1, padding: '12px 20px', borderRadius: 24, border: 'none',
                                outline: 'none', fontSize: 15, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                            maxLength={500}
                        />

                        <button
                            type="submit"
                            style={{
                                padding: 12, borderRadius: '50%', border: 'none', background: newMsg.trim() ? '#00a884' : '#ccc',
                                color: 'white', cursor: newMsg.trim() ? 'pointer' : 'default', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: 44, height: 44
                            }}
                            disabled={sending || !newMsg.trim()}
                        >
                            <FiSend size={20} style={{ marginLeft: -2 }} />
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                .shake-animation {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            `}</style>
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
