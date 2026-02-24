'use client'
import Link from 'next/link'
import { FiUsers, FiMessageCircle, FiCalendar, FiGlobe, FiArrowRight, FiStar } from 'react-icons/fi'

export default function HomePage() {
    return (
        <main className="hero-gradient" style={{ minHeight: '100vh' }}>
            {/* Flag stripe top */}
            <div className="flag-stripe" />

            {/* Navbar */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 40px', borderBottom: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--blue-primary), var(--red-primary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 900, color: 'white'
                    }}>C</div>
                    <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>
                        Collado <span className="gradient-text">Europa</span>
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link href="/login" className="btn btn-ghost">Iniciar sesión</Link>
                    <Link href="/register" className="btn btn-primary">Unirse ahora</Link>
                </div>
            </nav>

            {/* Hero */}
            <section style={{
                textAlign: 'center', padding: '100px 40px 80px',
                maxWidth: 900, margin: '0 auto'
            }} className="animate-fade-in">
                <div className="badge badge-blue" style={{ marginBottom: 24, display: 'inline-flex' }}>
                    <FiStar /> Red oficial de dominicanos en Europa
                </div>
                <h1 style={{
                    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900,
                    lineHeight: 1.1, marginBottom: 24, letterSpacing: '-2px'
                }}>
                    Conecta con dominicanos<br />
                    <span className="gradient-text">en toda Europa</span>
                </h1>
                <p style={{
                    fontSize: 18, color: 'var(--text-secondary)',
                    maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.8
                }}>
                    La comunidad oficial de apoyo a <strong style={{ color: 'white' }}>David Collado</strong>.
                    Chats por país y ciudad, noticias, eventos y mucho más.
                </p>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/register" className="btn btn-primary" style={{ padding: '16px 36px', fontSize: 16 }}>
                        Crear cuenta gratis <FiArrowRight />
                    </Link>
                    <Link href="/login" className="btn btn-ghost" style={{ padding: '16px 36px', fontSize: 16 }}>
                        Ya tengo cuenta
                    </Link>
                </div>
            </section>

            {/* Stats */}
            <section style={{
                display: 'flex', justifyContent: 'center', gap: 40,
                padding: '0 40px 80px', flexWrap: 'wrap'
            }}>
                {[
                    { num: '15+', label: 'Países europeos' },
                    { num: '500+', label: 'Miembros activos' },
                    { num: '50+', label: 'Salas de chat' },
                    { num: '100%', label: 'Comunidad dominicana' },
                ].map((s) => (
                    <div key={s.label} className="card" style={{ textAlign: 'center', minWidth: 160 }}>
                        <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--blue-light)' }}>{s.num}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </section>

            {/* Features */}
            <section style={{ padding: '0 40px 100px', maxWidth: 1100, margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, marginBottom: 48 }}>
                    Todo lo que necesitas en <span className="gradient-text">un solo lugar</span>
                </h2>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24
                }}>
                    {[
                        { icon: <FiMessageCircle size={28} />, title: 'Chats por país y ciudad', desc: 'Habla con dominicanos en tu misma ciudad o país europeo. Salas temáticas y generales.' },
                        { icon: <FiGlobe size={28} />, title: 'Noticias de Collado', desc: 'Mantente informado con las últimas noticias y declaraciones de David Collado.' },
                        { icon: <FiCalendar size={28} />, title: 'Eventos y encuentros', desc: 'Organiza y participa en eventos de la comunidad dominicana en Europa.' },
                        { icon: <FiUsers size={28} />, title: 'Red de contactos', desc: 'Conecta con dominicanos que comparten tu visión y valores desde toda Europa.' },
                    ].map((f) => (
                        <div key={f.title} className="card">
                            <div style={{
                                width: 56, height: 56, borderRadius: 14,
                                background: 'linear-gradient(135deg, var(--blue-primary), rgba(0,45,98,0.3))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 16, color: '#60a5fa'
                            }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--border)', padding: '24px 40px',
                textAlign: 'center', color: 'var(--text-muted)', fontSize: 13
            }}>
                <div className="flag-stripe" style={{ marginBottom: 16 }} />
                © 2025 Collado Europa Conecta · Hecho con 🇩🇴 para dominicanos en Europa
            </footer>
        </main>
    )
}
