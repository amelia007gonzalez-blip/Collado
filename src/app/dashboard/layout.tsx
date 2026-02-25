'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useRadioStore } from '@/lib/store'
import {
    FiMessageCircle, FiCalendar, FiLogOut,
    FiMenu, FiX, FiBell, FiUsers, FiHome, FiRadio, FiPlayCircle, FiPauseCircle
} from 'react-icons/fi'

const NAV_ITEMS = [
    { href: '/dashboard', icon: <FiHome size={18} />, label: 'Inicio' },
    { href: '/dashboard/chat', icon: <FiMessageCircle size={18} />, label: 'Chats' },
    { href: '/dashboard/news', icon: <FiRadio size={18} />, label: 'Noticias' },
    { href: '/dashboard/events', icon: <FiCalendar size={18} />, label: 'Eventos' },
    { href: '/dashboard/members', icon: <FiUsers size={18} />, label: 'Miembros' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [user, setUser] = useState<{ email?: string; user_metadata?: Record<string, string> } | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()

    // Radio Store
    const { isPlaying, isLoading, error: radioError, setIsPlaying, setIsLoading, setError } = useRadioStore()

    const audioRef = useRef<HTMLAudioElement>(null)
    const primaryStream = "https://streaming.z101digital.com/z101"
    const fallbackStream = "https://stream.zeno.fm/937f4a4c-dc94-4714-96ed-15fed55b237f" // Disco 106

    // No necesitamos inicializar New Audio() en el useEffect si usamos la etiqueta <audio>
    // Esto evita duplicidad y conflictos de recursos en el navegador.

    const toggleRadio = () => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
            // El estado se actualizará mediante los eventos onPlay/onPause del elemento <audio>
        } else {
            setError(null)
            setIsLoading(true)

            // Intentamos primero con Z 101 Digital (Muy estable)
            audioRef.current.src = primaryStream
            audioRef.current.load()

            const playPromise = audioRef.current.play()
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.warn("Primary stream failed, trying fallback...", e)
                    if (audioRef.current) {
                        audioRef.current.src = fallbackStream
                        audioRef.current.load()
                        audioRef.current.play().catch(err => {
                            console.error("All streams failed", err)
                            setError("No se puede conectar con la radio")
                            setIsLoading(false)
                            setIsPlaying(false)
                        })
                    }
                })
            }
        }
    }

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (!data.user) router.push('/login')
            else setUser(data.user)
        })
    }, [router])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
    const userCountry = user?.user_metadata?.country || 'Europa'
    const initials = userName.slice(0, 2).toUpperCase()

    return (
        <div className="app-shell">
            {/* Overlay mobile */}
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    zIndex: 99, display: 'none'
                }} className="mobile-overlay" />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="flag-stripe" />
                {/* Logo */}
                <div style={{ padding: '16px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--blue-primary), var(--red-primary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: 14, color: 'white', flexShrink: 0
                        }}>C</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 13 }}>Collado Europa</div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Conecta</div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} style={{
                            marginLeft: 'auto', background: 'none', border: 'none',
                            color: 'var(--text-muted)', cursor: 'pointer', display: 'none'
                        }} className="close-sidebar">
                            <FiX size={18} />
                        </button>
                    </div>
                </div>

                {/* User info */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-light))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 12, color: 'white', flexShrink: 0
                        }}>{initials}</div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {userName}
                            </div>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{userCountry}</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

                    {/* Logout button moved inside nav for better scrolling */}
                    <div style={{ padding: '0 8px 16px', borderBottom: '1px solid var(--border)', marginBottom: 16 }}>
                        <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13, background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}>
                            <FiLogOut size={16} /> Cerrar sesión
                        </button>
                    </div>

                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, padding: '0 8px', marginBottom: 8 }}>
                        MENÚ PRINCIPAL
                    </div>
                    {NAV_ITEMS.map(item => {
                        const active = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '8px 12px', borderRadius: 8, marginBottom: 2,
                                    textDecoration: 'none', transition: 'all 0.2s',
                                    background: active ? 'linear-gradient(135deg, rgba(0,45,98,0.4), rgba(0,45,98,0.2))' : 'transparent',
                                    color: active ? '#60a5fa' : 'var(--text-secondary)',
                                    border: active ? '1px solid rgba(0,45,98,0.4)' : '1px solid transparent',
                                    fontWeight: active ? 600 : 400, fontSize: 13,
                                }}
                            >
                                {item.icon}
                                {item.label}
                                {active && <div style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: '#60a5fa' }} />}
                            </Link>
                        )
                    })}

                    {/* Country rooms */}
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, padding: '16px 8px 8px', marginTop: 8 }}>
                        SALAS POR PAÍS
                    </div>
                    {[
                        { flag: '🌍', id: 'General', label: 'General' },
                        { flag: '🇪🇸', id: 'España', label: 'España' },
                        { flag: '🇫🇷', id: 'Francia', label: 'Francia' },
                        { flag: '🇮🇹', id: 'Italia', label: 'Italia' },
                        { flag: '🇩🇪', id: 'Alemania', label: 'Alemania' },
                        { flag: '🇨🇭', id: 'Suiza', label: 'Suiza' },
                        { flag: '🇬🇧', id: 'Reino Unido', label: 'Reino Unido' },
                        { flag: '🇵🇹', id: 'Portugal', label: 'Portugal' },
                        { flag: '🇳🇱', id: 'Países Bajos', label: 'Países Bajos' },
                        { flag: '🇧🇪', id: 'Bélgica', label: 'Bélgica' },
                        { flag: '🇨🇿', id: 'Rep. Checa', label: 'Rep. Checa' },
                        { flag: '🤝', id: 'La Sala del Junte', label: 'La Sala del Junte' }
                    ].map(r => (
                        <Link
                            key={r.id}
                            href={`/dashboard/chat?room=${encodeURIComponent(r.id)}`}
                            onClick={() => setSidebarOpen(false)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '9px 12px', borderRadius: 8, marginBottom: 2,
                                textDecoration: 'none', color: 'var(--text-muted)',
                                fontSize: 13, transition: 'all 0.2s',
                                wordBreak: 'break-word', whiteSpace: 'normal'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)', e.currentTarget.style.background = 'var(--bg-card)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)', e.currentTarget.style.background = 'transparent')}
                        >
                            <span style={{ fontSize: 14, flexShrink: 0 }}>{r.flag}</span>
                            <span>{r.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="flag-stripe" />
            </aside>

            {/* Main */}
            <div className={`main-content ${sidebarOpen ? 'shifted' : ''}`}>
                <header className="app-header" style={{
                    height: 56, minHeight: 56, padding: '0 20px', borderBottom: '3px solid #ff0000',
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: '#0f172a', zIndex: 1100,
                    flexShrink: 0, position: 'sticky', top: 0, width: '100%',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.6)'
                }}>
                    <div style={{ position: 'absolute', top: 0, right: 10, fontSize: 10, color: '#00ff00', padding: '4px 10px', background: '#000', borderRadius: '0 0 8px 8px', fontWeight: 'bold', zIndex: 1200 }}>v1.9.0-STICKY</div>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                        background: 'none', border: 'none', color: 'var(--text-secondary)',
                        cursor: 'pointer', display: 'none'
                    }} className="sidebar-toggle">
                        <FiMenu size={22} />
                    </button>
                    <div style={{ flex: 1 }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <button style={{
                            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white',
                            cursor: 'pointer', position: 'relative', width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <FiBell size={18} />
                            <span style={{
                                position: 'absolute', top: 2, right: 2,
                                width: 6, height: 6, borderRadius: '50%',
                                background: '#ef4444', border: '1px solid var(--bg-secondary)'
                            }} />
                        </button>

                        <button onClick={toggleRadio} title="Radio Dominicana Online" style={{
                            background: isPlaying ? '#ff0000' : '#CE1126',
                            border: '2px solid #fff',
                            color: '#fff',
                            padding: '6px 16px', borderRadius: 24, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 12,
                            transition: 'all 0.2s',
                            boxShadow: '0 0 20px rgba(255,0,0,0.6)',
                            transform: 'scale(1.15)',
                            animation: isPlaying ? 'pulse-heavy 1.5s infinite' : 'none',
                            zIndex: 1101
                        }}
                            className={isPlaying ? "radio-playing" : ""}
                        >
                            {isLoading ? (
                                <div className="animate-spin-slow" style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                            ) : (
                                isPlaying ? <FiPauseCircle size={20} /> : <FiPlayCircle size={20} />
                            )}
                            <span style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                                {isLoading ? '...' : (isPlaying ? 'EN VIVO' : 'ESCUCHAR RADIO 🇩🇴')}
                            </span>
                        </button>

                        <button onClick={handleLogout} style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: '#1e293b', border: '1px solid #334155',
                            color: '#cbd5e1', padding: '6px 12px', borderRadius: 18,
                            cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s'
                        }}>
                            <FiLogOut size={14} /> <span className="hide-mobile">Salir</span>
                        </button>

                        <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--blue-primary), #60a5fa)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: 12, color: 'white', border: '1px solid rgba(255,255,255,0.2)'
                        }}>{initials}</div>
                    </div>
                </header>

                {/* Cintillos de Información */}
                <div style={{ background: '#fefce8', borderBottom: '1px solid #fef3c7', padding: '2px 0', overflow: 'hidden', flexShrink: 0 }}>
                    <div className="ticker-wrap" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                        <div className="ticker-item" style={{ fontSize: 10, fontWeight: 700, color: '#854d0e', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eab308', color: 'white', width: 14, height: 14, borderRadius: '50%', flexShrink: 0 }}>
                                <FiRadio size={9} />
                            </div>
                            RADIO: Sintoniza Z 101 Digital y Disco 106 - El pulso de la República Dominicana en Europa.
                        </div>
                    </div>
                </div>
                <div style={{ background: 'var(--blue-primary)', color: 'white', padding: '4px 0', overflow: 'hidden', flexShrink: 0 }}>
                    <div className="ticker-news" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                        <div className="ticker-content" style={{ fontSize: 11, fontWeight: 500, padding: '0 40px' }}>
                            🇩🇴 ÚLTIMAS NOTICIAS: David Collado reconocido como "Ministro de Las Américas" por ONU Turismo • RD alcanza cifra récord de 11 millones de visitantes • Se proyecta un crecimiento histórico para el sector turístico en 2025 • Inauguración de nuevos malecones y playas públicas en todo el país • Presidente Abinader destaca el papel de la diáspora en el desarrollo nacional.
                        </div>
                    </div>
                </div>

                <div style={{
                    padding: pathname.includes('/chat') ? '0' : '20px 24px',
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {children}
                </div>
            </div>

            <style>{`
        .ticker-wrap { width: 100%; overflow: hidden; }
        .ticker-content {
            display: inline-block;
            animation: ticker 30s linear infinite;
            padding-right: 100%;
        }
        @keyframes ticker {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
        @media (max-width: 768px) {
          .sidebar-toggle { display: block !important; }
          .mobile-overlay { display: block !important; }
          .close-sidebar { display: block !important; }
          .hide-mobile { display: none !important; }
          .app-header { padding: 8px 12px !important; flex-wrap: wrap; gap: 6px !important; height: auto !important; min-height: 48px !important; }
          .app-header > button[title="Radio Dominicana Online"] { order: 4; width: 100%; justify-content: center; margin-top: 2px; height: 36px; }
        }
        .radio-playing {
            animation: pulse-radio 2s infinite;
        }
        @keyframes pulse-radio {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes pulse-heavy {
            0% { transform: scale(1.1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
            70% { transform: scale(1.15); box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
            100% { transform: scale(1.1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
        }
        .animate-spin-slow {
            animation: spin 3s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>

            {/* Emisoras dominicanas de alta disponibilidad */}
            <audio
                ref={audioRef}
                style={{ display: 'none' }}
                onPlay={() => { setIsPlaying(true); setIsLoading(false); }}
                onPause={() => setIsPlaying(false)}
                onWaiting={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onError={() => {
                    setError("Error de audio")
                    setIsLoading(false)
                    setIsPlaying(false)
                }}
            />
        </div>
    )
}
