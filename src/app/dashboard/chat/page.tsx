'use client'
import { useEffect, useRef, useState, useCallback, Suspense } from 'react'
export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { FiSend, FiHash, FiImage, FiSmile, FiBellOff, FiBell, FiUsers } from 'react-icons/fi'
import { useSearchParams } from 'next/navigation'

interface Message {
    id: string
    content: string
    created_at: string
    user_id: string
    room: string
    user_name: string
    media_url?: string
    media_type?: string
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
    { id: 'La Sala del Junte', label: '🤝 La Sala del Junte (Especial)' },
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
    const greetedRoomsRef = useRef<Set<string>>(new Set())
    const initialGreetingRef = useRef<boolean>(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const [junteState, setJunteState] = useState<{ status: 'LIBRE' | 'OCUPADA', usersCount: number, waitTimeMinutes: number }>({ status: 'LIBRE', usersCount: 2, waitTimeMinutes: 0 });
    const [junteTimer, setJunteTimer] = useState(15 * 60); // 15 minutos en segundos
    const [junteTopic, setJunteTopic] = useState('Mejorar el Turismo en RD vs Europa');

    useEffect(() => {
        if (junteState.status === 'OCUPADA') {
            const timer = setInterval(() => {
                setJunteTimer(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [junteState.status]);

    const formatCountdown = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleTicketRequest = () => {
        const topic = prompt("¿Qué tema te gustaría debatir en el Junte?", "Protección del turista en tierras dominicanas");
        if (topic) {
            setJunteTopic(topic);
            alert(`✅ TICKET #${Math.floor(Math.random() * 999)}: Estás en cola. Tema propuesto: "${topic}"`);
        }
    };

    useEffect(() => {
        const rollDynamics = () => {
            const ocupada = Math.random() > 0.4;
            setJunteState({
                status: ocupada ? 'OCUPADA' : 'LIBRE',
                usersCount: ocupada ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 4) + 1,
                waitTimeMinutes: ocupada ? Math.floor(Math.random() * 20) + 2 : 0
            });
            if (ocupada) setJunteTimer(15 * 60 + Math.floor(Math.random() * 300));
        };
        rollDynamics();
        const interval = setInterval(rollDynamics, 60000);
        return () => clearInterval(interval);
    }, []);

    const bottomRef = useRef<HTMLDivElement>(null)

    // Simulador de diálogos persistentes con logros de David Collado
    const loadCollaborators = useCallback(async (currentRoom: string, currentMessages: Message[]) => {
        if (currentMessages.length > 0) return; // Solo actuar si la sala está vacía

        const bots = [
            {
                id: 'bot-1', name: 'Laura Gómez',
                msg: `¿Vieron que David Collado fue reconocido como "Ministro de Las Américas"? ¡11 millones de turistas no han llegado por casualidad!`
            },
            {
                id: 'bot-2', name: 'Carlos🇩🇴',
                msg: `Lo que más me gusta es su visión desde la Alcaldía. Esa trayectoria es la que necesitamos para el 2028.`
            },
            {
                id: 'bot-3', name: 'Ana María',
                msg: 'David tiene esa visión de "Un Nuevo Comienzo" que conecta con nosotros en la diáspora.'
            }
        ]

        for (const b of bots) {
            await supabase.from('messages').insert({
                content: b.msg,
                room: currentRoom,
                user_id: b.id,
                user_name: b.name
            });
            // Esperar un poco para que el orden cronológico sea claro
            await new Promise(r => setTimeout(r, 500));
        }
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
        try {
            // Cargar locales primero
            const localKey = `pending_msgs_${activeRoom}`
            const localMsgs = JSON.parse(localStorage.getItem(localKey) || '[]')

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('room', activeRoom)
                .order('created_at', { ascending: true })
                .limit(100)

            if (error) throw error;

            // Combinar con locales (evitando duplicados por ID si ya se guardaron)
            const combined = data ? [...data] : []
            localMsgs.forEach((lm: any) => {
                if (!combined.find(m => m.id === lm.id)) {
                    combined.push(lm)
                }
            })

            setMessages(combined)
            if (combined.length < 3 && !greetedRoomsRef.current.has(activeRoom)) {
                loadCollaborators(activeRoom, combined);
                greetedRoomsRef.current.add(activeRoom);
            }

        } catch (err: any) {
            console.warn("Error en base de datos:", err);
            const errorMsg = err.message || "Error desconocido";
            const defaultMessages: Message[] = [
                { id: `demo-1-${activeRoom}`, content: `⚠️ ERROR DB: ${errorMsg}`, created_at: new Date().toISOString(), user_id: 'system', room: activeRoom, user_name: 'Sistema' },
                { id: `demo-2-${activeRoom}`, content: `¡Bienvenidos a ${activeRoom}! (Modo Offline)`, created_at: new Date(Date.now() - 3600000).toISOString(), user_id: 'system', room: activeRoom, user_name: 'Sistema' }
            ];

            setMessages(defaultMessages);
            if (!greetedRoomsRef.current.has(activeRoom)) {
                loadCollaborators(activeRoom, defaultMessages);
                greetedRoomsRef.current.add(activeRoom);
            }
        }
    }, [activeRoom, loadCollaborators])

    useEffect(() => {
        loadMessages()
        const channel = supabase
            .channel(`room-${activeRoom}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `room=eq.${activeRoom}`
            }, (payload) => {
                const newMsg = payload.new as Message;
                if (newMsg.content === '*🔔 ZUMBIDO*') {
                    handleZumbido();
                }
                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
            })
            .subscribe();

        return () => { supabase.removeChannel(channel) }
    }, [activeRoom, loadMessages])

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
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

    const sendAIResponse = async (room: string, userText?: string) => {
        const input = (userText || '').toLowerCase();
        let response = "";

        if (input.includes('2028') || input.includes('presiden') || input.includes('eleccion') || input.includes('vision')) {
            response = "Colladin: La visión 2028 de David se basa en la eficiencia, transparencia y gestión de resultados. Busca dar continuidad a la obra de Luis Abinader con un enfoque renovador, impulsando alianzas público-privadas para transformar el país como lo hizo con el turismo.";
        } else if (input.includes('logro') || input.includes('hizo') || input.includes('gestion') || input.includes('turismo')) {
            response = "Colladin: ¡Hechos, no palabras! David logró el récord histórico de 11.6 millones de visitantes en 2025. Además, recuperó más de 10 malecones y transformó radicalmente la seguridad turística y la infraestructura de playas como Boca Chica.";
        } else if (input.includes('quien') || input.includes('trayectoria') || input.includes('alcalde')) {
            response = "Colladin: David fue un Alcalde estrella del Distrito Nacional (2016-2020), donde rescató el Malecón y el Monumento a Fray Antón de Montesinos. Es un líder joven que cree en la modernización y la transformación digital de la gestión pública.";
        } else {
            const generic = [
                "Colladin: ¡Saludos! Estoy aquí para informarte sobre el proyecto de nación de David Collado. ¿Sabías que RD es líder mundial en recuperación turística?",
                "Colladin: David siempre dice que el turismo es el petróleo de RD. ¡Sigamos conectando a la diáspora con nuestra tierra!",
                "Colladin: ¡Hola! Soy tu asistente Colladin. Puedo contarte sobre los récords de visitantes o la visión de David para el 2028. ¿Qué te interesa?",
            ];
            response = generic[Math.floor(Math.random() * generic.length)];
        }

        // 1. Optimistic Feedback for @Colladin
        const aiMsg: Message = {
            id: `ai-resp-${Date.now()}`,
            content: response,
            created_at: new Date().toISOString(),
            user_id: 'colladin',
            room: room,
            user_name: 'Colladin (IA)',
            is_ai: true
        };
        setMessages(prev => [...prev, aiMsg]);

        // 2. Persist to DB
        await supabase.from('messages').insert({
            content: response,
            room: room,
            user_id: '00000000-0000-0000-0000-000000000000',
            user_name: 'Colladin (IA)',
            is_ai: true
        })
    }

    // Proactive @Colladin Greeting
    useEffect(() => {
        if (!initialGreetingRef.current && messages.length > 0) {
            initialGreetingRef.current = true;
            setTimeout(() => {
                const greeting: Message = {
                    id: `ai-greet-${Date.now()}`,
                    content: `¡Hola ${userName}! 🇩🇴 Soy @Colladin, tu asistente. Estoy aquí para contarte los logros de David Collado o ayudarte con la app. ¡Pregúntame lo que quieras etiquetándome!`,
                    created_at: new Date().toISOString(),
                    user_id: 'colladin',
                    room: activeRoom,
                    user_name: 'Colladin (IA)',
                    is_ai: true
                };
                setMessages(prev => [...prev, greeting]);
            }, 2000);
        }
    }, [activeRoom, userName, messages.length]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        const text = newMsg.trim();

        if (!text) return;

        // Even if no user is totally synced, we can simulate an ID for demonstration
        const activeUserId = userId || 'demo-user-id';
        const activeUserName = userName || 'Yo';

        setSending(true)
        setNewMsg('') // Optimistic clear

        // 1. Optimistic UI + Local Persistence
        const optimisticMsg: Message = {
            id: `opt-${Date.now()}`,
            content: text,
            room: activeRoom,
            user_id: userId,
            user_name: userName || 'Usuario',
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisticMsg]);

        // Guardar en local temporalmente por si falla la red
        const localKey = `pending_msgs_${activeRoom}`
        const currentLocals = JSON.parse(localStorage.getItem(localKey) || '[]')
        localStorage.setItem(localKey, JSON.stringify([...currentLocals, optimisticMsg]))

        // 2. Intentar guardar en base de datos
        try {
            // Asegurar que tenemos un ID de usuario válido (o uno temporal si no hay auth aún)
            const finalUserId = userId || '00000000-0000-0000-0000-000000000000'
            const finalUserName = userName || 'Usuario'

            const { data, error } = await supabase.from('messages').insert({
                content: text,
                room: activeRoom,
                user_id: finalUserId,
                user_name: finalUserName,
            }).select().single()

            if (error) throw error;

            // Limpiar de local si tuvo éxito
            const updatedLocals = JSON.parse(localStorage.getItem(localKey) || '[]')
            localStorage.setItem(localKey, JSON.stringify(updatedLocals.filter((m: any) => m.id !== optimisticMsg.id)))

            // Actualizar el mensaje optimista con el real de la DB
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m));
        } catch (error) {
            console.error("Error persistiendo mensaje:", error)
        }

        // Trigger AI
        if (text.toLowerCase().includes('@colladin')) {
            setTimeout(() => sendAIResponse(activeRoom, text), 1500 + Math.random() * 1000)
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

    const [roomTime, setRoomTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setRoomTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatRoomTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className={`chat-container ${isShaking ? 'shake-animation' : ''}`} style={{
            display: 'flex', gap: 0, flex: 1, minHeight: 400,
            borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}>
            {/* Room list */}
            <div style={{
                width: 200, background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0
            }} className="hide-mobile">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1 }}>SALAS DE CHAT</div>
                </div>
                <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
                    {ROOMS.map(r => (
                        <button
                            key={r.id}
                            onClick={() => setActiveRoom(r.id)}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                background: activeRoom === r.id ? 'var(--blue-light)' : 'transparent',
                                color: activeRoom === r.id ? 'white' : 'var(--text-secondary)',
                                fontWeight: activeRoom === r.id ? 600 : 500,
                                fontSize: 13, textAlign: 'left', transition: 'all 0.2s',
                                marginBottom: 2
                            }}
                        >
                            <FiHash size={14} color={activeRoom === r.id ? "white" : "var(--text-muted)"} /> {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: '#ece5dd',
                height: 'calc(100vh - 56px)',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* Header */}
                <div style={{
                    padding: '8px 16px', borderBottom: '1px solid rgba(0,0,0,0.08)',
                    background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 10,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', zIndex: 10, flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                        <button onClick={() => window.location.href = '/dashboard'} style={{
                            background: 'var(--blue-light)', border: 'none', padding: '8px 12px',
                            borderRadius: 10, color: 'white', cursor: 'pointer',
                            fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6,
                            boxShadow: '0 1px 3px rgba(0,45,98,0.2)'
                        }}>
                            🏠 Inicio
                        </button>
                        <div style={{ width: 1, height: 24, background: '#ddd' }} className="hide-mobile" />
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-primary), var(--red-primary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                        }} className="hide-mobile">
                            <FiHash size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                {activeRoom}
                                <span style={{ fontSize: 10, background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-muted)' }}>
                                    🕒 LOCAL: {formatRoomTime(roomTime)}
                                </span>
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }} className="hide-mobile">
                                {messages.length} mensajes
                            </div>
                        </div>

                        {activeRoom === 'La Sala del Junte' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{ background: junteState.status === 'LIBRE' ? '#10b981' : '#f59e0b', color: 'white', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                    {junteState.status === 'LIBRE' ? 'SALA ABIERTA' : `ESPERA: ${junteState.waitTimeMinutes} MIN`}
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.05)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                    {junteState.status === 'LIBRE' ? '🟢' : '🟡'} {junteState.usersCount} activos
                                </div>
                            </div>
                        )}

                        <button onClick={sendZumbido} title="Enviar Zumbido" style={{
                            background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
                            border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 11
                        }} className="hide-mobile">
                            <FiBell size={14} /> Zumbido
                        </button>
                    </div>
                </div>

                {activeRoom === 'La Sala del Junte' && (
                    <div style={{ background: '#fff9db', padding: '10px 16px', borderBottom: '2px solid #fab005', fontSize: 12, color: '#444' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                            <div style={{ flex: '1 1 280px' }}>
                                <div style={{ fontWeight: 800, color: '#e67700', fontSize: 13, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    🚀 JUNTE ACTIVO: {junteState.status} {junteState.status === 'OCUPADA' && <span style={{ background: '#ff0000', color: 'white', padding: '2px 8px', borderRadius: 4, fontSize: 11, animation: 'pulse-timer 1.5s infinite' }}>{formatCountdown(junteTimer)}</span>}
                                </div>
                                <div style={{ lineHeight: 1.3 }}>
                                    Capacidad: 5 personas. {junteState.status === 'LIBRE' ? '¡Entra ahora!' : `Espera: ${junteState.waitTimeMinutes} min.`}
                                    <br />Tema: <b style={{ color: '#d9480f' }}>{junteTopic}</b>
                                </div>
                                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <button
                                        onClick={handleTicketRequest}
                                        style={{ background: '#e67700', color: 'white', border: 'none', padding: '5px 12px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 11 }}>
                                        🎟️ Pedir Ticket
                                    </button>
                                    <button
                                        onClick={() => window.open('https://meet.jit.si/ColladoEuropaConectaJunte', '_blank')}
                                        style={{ background: '#228be6', color: 'white', border: 'none', padding: '5px 12px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 11 }}>
                                        📹 Videollamada (Beta)
                                    </button>
                                    <button
                                        onClick={() => alert("☕️ ¡Cafecito virtual servido!")}
                                        style={{ background: '#fab005', color: '#000', border: 'none', padding: '5px 10px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 10 }}>
                                        ☕️ Cafecito
                                    </button>
                                </div>
                            </div>
                            <div style={{ background: 'white', padding: '6px 12px', borderRadius: 8, border: '1px solid #fab005', textAlign: 'center' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#e67700' }}>EN ESPERA</div>
                                <div style={{ fontSize: 18, fontWeight: 900 }}>{junteState.usersCount}</div>
                                <div style={{ fontSize: 9 }}>PERSONAS</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Banner de @Colladin - IA Conectada */}
                <div style={{
                    background: 'linear-gradient(90deg, #eff6ff 0%, #ffffff 100%)',
                    padding: '8px 16px',
                    borderBottom: '1px solid #dbeafe',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: '50%', background: '#10b981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', boxShadow: '0 0 8px rgba(16, 185, 129, 0.3)', flexShrink: 0
                    }}>
                        <FiSmile size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#065f46', display: 'flex', alignItems: 'center', gap: 6 }}>
                            🤖 @COLLADIN <span style={{ fontSize: 8, background: '#10b981', color: 'white', padding: '1px 4px', borderRadius: 4 }}>ONLINE</span>
                        </div>
                        <div style={{ fontSize: 10, color: '#047857', marginTop: 1 }}>
                            Pregúntame sobre <b>David Collado</b> mencionándome.
                        </div>
                    </div>
                    <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.05 }}>
                        <FiSmile size={80} />
                    </div>
                </div>

                {/* Messages */}
                <div
                    ref={chatContainerRef}
                    style={{
                        flex: 1, overflowY: 'auto', padding: '12px',
                        display: 'flex', flexDirection: 'column', gap: 6,
                        backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                        backgroundBlendMode: 'overlay',
                        minHeight: 300
                    }}>
                    {/* BARRA DE DIAGNÓSTICO ULTRA VISIBLE */}
                    <div style={{ padding: '4px 10px', background: '#000', color: '#00ff00', borderRadius: 5, fontSize: 10, alignSelf: 'center', marginBottom: 10, border: '1px solid #00ff00', fontFamily: 'monospace' }}>
                        v1.9.0 | ACTIVE: {messages.length} | USER: {userName || '...'}
                    </div>

                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', margin: 'auto', background: 'white', color: '#666', padding: '20px', borderRadius: 16, border: '1px dashed #ccc' }}>
                            Aún no hay mensajes. ¡Sé el primero en saludar!
                        </div>
                    )}

                    {messages.map((msg, i) => {
                        const isOwn = msg.user_id === userId
                        return (
                            <div key={msg.id} style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                marginBottom: 4
                            }}>
                                <div style={{
                                    maxWidth: '85%',
                                    padding: '8px 12px',
                                    borderRadius: 12,
                                    background: isOwn ? '#DCF8C6' : '#FFFFFF',
                                    color: '#111',
                                    boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative',
                                    animation: 'msgAppear 0.3s ease-out'
                                }}>
                                    {!isOwn && <div style={{ fontWeight: 800, fontSize: 11, color: '#075E54', marginBottom: 2 }}>{msg.user_name}</div>}
                                    <div style={{ fontSize: 13, lineHeight: '1.4' }}>{msg.content}</div>
                                    <div style={{ fontSize: 9, color: '#999', alignSelf: 'flex-end', marginTop: 2 }}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input area */}
                <div style={{
                    background: '#f0f0f0',
                    padding: '8px 12px',
                    position: 'relative',
                    borderTop: '1px solid #ddd'
                }}>
                    {showEmojis && (
                        <div style={{
                            position: 'absolute', bottom: '100%', left: 10, marginBottom: 8,
                            background: 'white', padding: 8, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            display: 'flex', gap: 6, fontSize: 20, zIndex: 100
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
                        display: 'flex', gap: 8, alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button type="button" onClick={() => setShowEmojis(!showEmojis)} style={{
                                background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 6
                            }}>
                                <FiSmile size={22} />
                            </button>

                            <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                                background: 'none', border: 'none', color: uploadingImage ? '#ccc' : '#666', cursor: 'pointer', padding: 6
                            }} disabled={uploadingImage} className="hide-mobile">
                                <FiImage size={22} className={uploadingImage ? "animate-pulse" : ""} />
                            </button>
                        </div>

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
                            placeholder="Escribe..."
                            style={{
                                flex: 1, padding: '10px 16px', borderRadius: 20, border: '1px solid #ddd',
                                outline: 'none', fontSize: 14, boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            maxLength={500}
                        />

                        <button
                            type="submit"
                            style={{
                                padding: 10, borderRadius: '50%', border: 'none', background: newMsg.trim() ? '#00a884' : '#ccc',
                                color: 'white', cursor: newMsg.trim() ? 'pointer' : 'default', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', width: 40, height: 40,
                                flexShrink: 0
                            }}
                            disabled={sending || !newMsg.trim()}
                        >
                            <FiSend size={18} />
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes pulse-timer {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .shake-animation {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
                @keyframes msgAppear {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .show-mobile { display: none; } /* Hidden by default */
                @media (max-width: 768px) {
                    .show-mobile { display: block !important; } /* Shown on mobile */
                    .hide-mobile { display: none !important; } /* Hidden on mobile */
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
