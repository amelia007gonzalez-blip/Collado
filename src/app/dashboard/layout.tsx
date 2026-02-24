'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
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
    const [pathname, setPathname] = useState('')
    const [isPlayingRadio, setIsPlayingRadio] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // No necesitamos inicializar New Audio() en el useEffect si usamos la etiqueta <audio>
    // Esto evita duplicidad y conflictos de recursos en el navegador.

    const toggleRadio = () => {
        if (!audioRef.current) return

        if (isPlayingRadio) {
            audioRef.current.pause()
            setIsPlayingRadio(false)
        } else {
            // Force load the stream in case it stale
            audioRef.current.load()
            audioRef.current.play().then(() => {
                setIsPlayingRadio(true)
            }).catch(e => {
                console.error("Radio play error:", e)
                setIsPlayingRadio(false)
            })
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined') setPathname(window.location.pathname)
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
                <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
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
                        { flag: '🌍', id: 'General', label: 'General' }
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
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)', e.currentTarget.style.background = 'var(--bg-card)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)', e.currentTarget.style.background = 'transparent')}
                        >
                            <span style={{ fontSize: 14 }}>{r.flag}</span> {r.label}
                        </Link>
                    ))}
                </nav>

                {/* Logout */}
                <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                    <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                        <FiLogOut size={16} /> Cerrar sesión
                    </button>
                </div>
                <div className="flag-stripe" />
            </aside>

            {/* Main */}
            <div className="main-content">
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
                        background: isPlayingRadio ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0,0,0,0.05)',
                        border: isPlayingRadio ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid transparent',
                        color: isPlayingRadio ? '#ef4444' : 'var(--text-secondary)',
                        padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13,
                        transition: 'all 0.3s',
                        boxShadow: isPlayingRadio ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none',
                    }}
                        className={isPlayingRadio ? "radio-playing" : ""}
                    >
                        {isPlayingRadio ? <FiPauseCircle size={18} className="animate-spin-slow" /> : <FiPlayCircle size={18} />}
                        <span className="hide-mobile">{isPlayingRadio ? 'ON AIR 🔴' : 'Radio 🇩🇴'}</span>
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
                        fontWeight: 700, fontSize: 13, color: 'white', cursor: 'pointer'
                    }}>{initials}</div>
                </header>

                <div style={{ padding: '32px 28px' }}>{children}</div>
            </div>

            <style>{`
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

            {/* Emisora: Disco 106 (RD) - Muy segura y estable por HTTPS */}
            <audio ref={audioRef} src="https://stream.zeno.fm/fvr868y9vduv" preload="none" crossOrigin="anonymous" />
        </div>
    )
}
