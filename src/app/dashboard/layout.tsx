'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    FiMessageCircle, FiCalendar, FiGlobe, FiLogOut,
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
    const [isPlayingRadio, setIsPlayingRadio] = useState(false)
    const [isLoadingRadio, setIsLoadingRadio] = useState(false)
    const [radioError, setRadioError] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // No necesitamos inicializar New Audio() en el useEffect si usamos la etiqueta <audio>
    // Esto evita duplicidad y conflictos de recursos en el navegador.

    const toggleRadio = () => {
        if (!audioRef.current) return

        if (isPlayingRadio) {
            audioRef.current.pause()
            // El estado se actualizará mediante los eventos onPlay/onPause del elemento <audio>
        } else {
            setRadioError(false)
            setIsLoadingRadio(true)
            setIsPlayingRadio(true)

            // Intentamos primero con Z 101 Digital (Muy estable)
            const primaryStream = "https://streaming.z101digital.com/z101"
            const fallbackStream = "https://stream.zeno.fm/937f4a4c-dc94-4714-96ed-15fed55b237f" // Disco 106

            audioRef.current.src = primaryStream
            audioRef.current.load()

            audioRef.current.play().catch(e => {
                console.warn("Primary stream failed, trying fallback...", e)
                if (audioRef.current) {
                    audioRef.current.src = fallbackStream
                    audioRef.current.load()
                    audioRef.current.play().catch(err => {
                        console.error("All streams failed", err)
                        setRadioError(true)
                        setIsPlayingRadio(false)
                        setIsLoadingRadio(false)
                    })
                }
            })
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
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--blue-primary), var(--red-primary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 900, fontSize: 18, color: 'white', flexShrink: 0
                        }}>C</div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: 14 }}>Collado Europa</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Conecta</div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} style={{
                            marginLeft: 'auto', background: 'none', border: 'none',
                            color: 'var(--text-muted)', cursor: 'pointer', display: 'none'
                        }} className="close-sidebar">
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* User info */}
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-light))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 14, color: 'white', flexShrink: 0
                        }}>{initials}</div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {userName}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{userCountry}</div>
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
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '11px 12px', borderRadius: 10, marginBottom: 4,
                                    textDecoration: 'none', transition: 'all 0.2s',
                                    background: active ? 'linear-gradient(135deg, rgba(0,45,98,0.4), rgba(0,45,98,0.2))' : 'transparent',
                                    color: active ? '#60a5fa' : 'var(--text-secondary)',
                                    border: active ? '1px solid rgba(0,45,98,0.4)' : '1px solid transparent',
                                    fontWeight: active ? 600 : 400, fontSize: 14,
                                }}
                            >
                                {item.icon}
                                {item.label}
                                {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#60a5fa' }} />}
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
                {/* Top bar */}
                <header style={{
                    padding: '16px 28px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 16,
                    background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 50
                }}>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
                        background: 'none', border: 'none', color: 'var(--text-secondary)',
                        cursor: 'pointer', display: 'none'
                    }} className="sidebar-toggle">
                        <FiMenu size={22} />
                    </button>
                    <div style={{ flex: 1 }} />
                    <button style={{
                        background: 'none', border: 'none', color: 'var(--text-secondary)',
                        cursor: 'pointer', position: 'relative'
                    }}>
                        <FiBell size={20} />
                        <span style={{
                            position: 'absolute', top: -4, right: -4,
                            width: 8, height: 8, borderRadius: '50%',
                            background: 'var(--red-primary)'
                        }} />
                    </button>

                    <button onClick={toggleRadio} title="Radio Dominicana Online" style={{
                        background: isPlayingRadio ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                        border: isPlayingRadio ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.2)',
                        color: isPlayingRadio ? '#ef4444' : 'white',
                        padding: '8px 16px', borderRadius: 24, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13,
                        transition: 'all 0.3s',
                        boxShadow: isPlayingRadio ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none',
                    }}
                        className={isPlayingRadio ? "radio-playing" : ""}
                    >
                        {isLoadingRadio ? (
                            <div className="animate-spin-slow" style={{ width: 18, height: 18, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />
                        ) : (
                            isPlayingRadio ? <FiPauseCircle size={20} /> : <FiPlayCircle size={20} />
                        )}
                        <span>
                            {isLoadingRadio ? 'CONECTANDO...' : (isPlayingRadio ? 'EN VIVO 🔴' : 'RADIO 🇩🇴')}
                        </span>
                        {radioError && !isPlayingRadio && <span style={{ fontSize: 9, color: '#ffaaaa', marginLeft: 4 }}>Error de conexión</span>}
                    </button>

                    <button onClick={handleLogout} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444', padding: '6px 12px', borderRadius: 20,
                        cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                    >
                        <FiLogOut size={14} /> <span className="hide-mobile">Salir</span>
                    </button>

                    <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-light))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 13, color: 'white'
                    }}>{initials}</div>
                </header>

                {/* Cintillos de Información */}
                <div style={{ background: '#fefce8', borderBottom: '1px solid #fef3c7', padding: '4px 0', overflow: 'hidden' }}>
                    <div className="ticker-wrap" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                        <div className="ticker-item" style={{ fontSize: 11, fontWeight: 700, color: '#854d0e', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eab308', color: 'white', width: 20, height: 20, borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 5px rgba(234, 179, 8, 0.4)' }}>
                                <FiRadio size={12} />
                            </div>
                            RADIO: Sintoniza Z 101 Digital y Disco 106 - El pulso de la República Dominicana en Europa.
                        </div>
                    </div>
                </div>
                <div style={{ background: 'var(--blue-primary)', color: 'white', padding: '6px 0', overflow: 'hidden' }}>
                    <div className="ticker-news" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
                        <div className="ticker-content" style={{ fontSize: 13, fontWeight: 500, padding: '0 40px' }}>
                            🇩🇴 ÚLTIMAS NOTICIAS: David Collado reconocido como "Ministro de Las Américas" por ONU Turismo • RD alcanza cifra récord de 11 millones de visitantes • Se proyecta un crecimiento histórico para el sector turístico en 2025 • Inauguración de nuevos malecones y playas públicas en todo el país • Presidente Abinader destaca el papel de la diáspora en el desarrollo nacional.
                        </div>
                    </div>
                </div>

                <div style={{ padding: '32px 28px' }}>{children}</div>
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
        }
        .radio-playing {
            animation: pulse-radio 2s infinite;
        }
        @keyframes pulse-radio {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
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
                onPlay={() => setIsPlayingRadio(true)}
                onPause={() => setIsPlayingRadio(false)}
                onPlaying={() => setIsLoadingRadio(false)}
                onWaiting={() => setIsLoadingRadio(true)}
                onError={() => {
                    // No hacemos nada aquí porque ya lo manejamos en el catch del play
                    // pero evitamos que el navegador se queje.
                }}
                preload="none"
            />
        </div>
    )
}
