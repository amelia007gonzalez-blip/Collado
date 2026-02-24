'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { FiMessageCircle, FiCalendar, FiRadio, FiUsers, FiTrendingUp, FiArrowRight, FiShield } from 'react-icons/fi'

export default function DashboardHome() {
    const [user, setUser] = useState<{ user_metadata?: Record<string, string> } | null>(null)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
    }, [])

    const name = user?.user_metadata?.full_name?.split(' ')[0] || 'amigo'

    const quickLinks = [
        { icon: <FiMessageCircle size={24} />, label: 'Chat General', sub: 'Conversa con toda la comunidad', href: '/dashboard/chat', color: 'var(--blue-primary)' },
        { icon: <FiRadio size={24} />, label: 'Últimas noticias', sub: 'Mantente informado', href: '/dashboard/news', color: 'var(--red-primary)' },
        { icon: <FiCalendar size={24} />, label: 'Próximos eventos', sub: 'Reuniones y encuentros', href: '/dashboard/events', color: '#7c3aed' },
        { icon: <FiUsers size={24} />, label: 'Miembros', sub: 'Conoce a la comunidad', href: '/dashboard/members', color: '#059669' },
    ]

    const stats = [
        { label: 'Miembros activos', value: '524', icon: <FiUsers size={18} />, trend: '+12 esta semana' },
        { label: 'Mensajes hoy', value: '1,248', icon: <FiMessageCircle size={18} />, trend: '+248 hoy' },
        { label: 'Países conectados', value: '15', icon: <FiTrendingUp size={18} />, trend: 'En toda Europa' },
    ]

    return (
        <div className="animate-fade-in">
            {/* Welcome */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(0,45,98,0.4), rgba(206,17,38,0.15))',
                border: '1px solid rgba(0,45,98,0.3)',
                borderRadius: 20, padding: '32px 36px', marginBottom: 32,
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: -40, right: -40, width: 200, height: 200,
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,45,98,0.3), transparent)',
                }} />
                <div className="flag-stripe" style={{ position: 'absolute', top: 0, left: 0, right: 0, borderRadius: '20px 20px 0 0' }} />
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                    ¡Hola, <span className="gradient-text">{name}</span>! 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                    Bienvenido a la comunidad de dominicanos que apoya a David Collado en Europa.
                </p>
            </div>

            {/* Stats */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16, marginBottom: 32
            }}>
                {stats.map(s => (
                    <div key={s.label} className="card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: 'rgba(0,45,98,0.3)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', color: '#60a5fa'
                            }}>{s.icon}</div>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{s.value}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: '#34d399' }}>{s.trend}</div>
                    </div>
                ))}
            </div>

            {/* Quick access */}
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Acceso rápido</h2>
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16, marginBottom: 32
            }}>
                {quickLinks.map(q => (
                    <Link key={q.label} href={q.href} style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, cursor: 'pointer' }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                                background: `linear-gradient(135deg, ${q.color}, ${q.color}88)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                            }}>{q.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{q.label}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{q.sub}</div>
                            </div>
                            <FiArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Community Rules */}
            <div style={{
                background: 'var(--bg-secondary)', padding: 24, borderRadius: 16,
                border: '1px solid var(--border)', marginBottom: 32
            }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiShield color="var(--blue-primary)" /> Reglas de Convivencia y Respeto
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div style={{ fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>1. Cero Insultos</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Mantenemos el respeto mutuo. Las faltas de respeto conllevan baneo.</div>
                    </div>
                    <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <div style={{ fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>2. No a la desinformación</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Verifica la fuente antes de publicar noticias o datos falsos.</div>
                    </div>
                    <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ fontWeight: 600, color: '#10b981', marginBottom: 4 }}>3. Respeto Político</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Debate y propuestas amigables. No toleramos la toxicidad.</div>
                    </div>
                    <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <div style={{ fontWeight: 600, color: '#8b5cf6', marginBottom: 4 }}>4. No Spam</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Evita enviar cadenas, publicidad externa o enlaces maliciosos.</div>
                    </div>
                </div>
            </div>

            {/* Country rooms */}
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Salas por país 🌍</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                {[
                    { flag: '🇪🇸', country: 'España', members: 142 },
                    { flag: '🇫🇷', country: 'Francia', members: 98 },
                    { flag: '🇮🇹', country: 'Italia', members: 75 },
                    { flag: '🇩🇪', country: 'Alemania', members: 63 },
                    { flag: '🇵🇹', country: 'Portugal', members: 51 },
                    { flag: '🇳🇱', country: 'Países Bajos', members: 38 },
                    { flag: '🇬🇧', country: 'Reino Unido', members: 35 },
                    { flag: '🇧🇪', country: 'Bélgica', members: 22 },
                ].map(r => (
                    <Link key={r.country} href={`/dashboard/chat?room=${r.country}`} style={{ textDecoration: 'none' }}>
                        <div className="card" style={{ textAlign: 'center', padding: 18, cursor: 'pointer' }}>
                            <div style={{ fontSize: 32, marginBottom: 8 }}>{r.flag}</div>
                            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{r.country}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.members} miembros</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
