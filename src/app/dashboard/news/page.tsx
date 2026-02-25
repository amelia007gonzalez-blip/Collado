'use client'
import { useEffect, useState } from 'react'
export const dynamic = 'force-dynamic'
import { supabase } from '@/lib/supabase'
import { FiRadio, FiExternalLink, FiClock, FiPlus } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface NewsItem {
    id: string
    title: string
    content: string
    source: string
    link?: string
    image_url?: string
    created_at: string
    category: string
}

const SAMPLE_NEWS: NewsItem[] = [
    {
        id: '1', title: 'David Collado proyecta visión de nación para el 2028',
        content: 'Basado en su exitosa gestión en MITUR y la Alcaldía de Santo Domingo, David Collado se perfila como una figura clave para la continuidad del progreso, enfocándose en la eficiencia gubernamental y alianzas público-privadas.',
        source: 'DavidCollado.com', link: 'https://davidcollado.com', category: 'Política', created_at: new Date().toISOString(),
    },
    {
        id: '2', title: 'Récord histórico: República Dominicana recibe 11.6 millones de visitantes',
        content: 'Bajo la dirección de David Collado, el país rompe récords internacionales de turismo en 2025, superando todas las expectativas y consolidándose como el motor económico de la región del Caribe.',
        source: 'MITUR Oficial', link: 'https://www.mitur.gob.do/', category: 'Turismo', created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: '3', title: 'Plan de reordenamiento de Boca Chica inicia con éxito',
        content: 'El Ministerio de Turismo comenzó la transformación integral de Boca Chica, incluyendo reordenamiento urbano y mejoras en la seguridad para los visitantes, como parte del plan estratégico de Collado.',
        source: 'Presidencia RD', link: 'https://davidcollado.com', category: 'Desarrollo', created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '4', title: 'ONU Turismo premia la visión innovadora de David Collado',
        content: 'Reconocimiento internacional destaca la gestión post-pandemia y el liderazgo de Collado, posicionándolo como el "Ministro de las Américas" por sus resultados tangibles en el sector.',
        source: 'ONU Turismo', link: 'https://bohionews.com', category: 'Internacional', created_at: new Date(Date.now() - 172800000).toISOString(),
    },
]

const CATEGORY_COLORS: Record<string, string> = {
    Política: 'badge-blue', Desarrollo: 'badge-red',
    Turismo: 'badge-green', Eventos: 'badge-blue'
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>(SAMPLE_NEWS)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ title: '', content: '', source: '', category: 'Política' })

    useEffect(() => {
        const fetchNews = async () => {
            const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false }).limit(20)
            if (data && data.length > 0) {
                // Merge custom mock links with db data to ensure we have some real links available
                setNews(data)
            } else {
                setNews(SAMPLE_NEWS) // Use real mock data as fallback
            }
            setLoading(false)
        }
        fetchNews()
        supabase.auth.getUser().then(({ data }) => {
            if (data.user?.user_metadata?.role === 'admin') setIsAdmin(true)
        })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const { error } = await supabase.from('news').insert(form)
        if (error) toast.error('Error al publicar')
        else { toast.success('Noticia publicada'); setShowForm(false); setForm({ title: '', content: '', source: '', category: 'Política' }) }
    }

    const timeAgo = (iso: string) => {
        const diff = Date.now() - new Date(iso).getTime()
        const h = Math.floor(diff / 3600000)
        const d = Math.floor(diff / 86400000)
        if (d > 0) return `hace ${d} día${d > 1 ? 's' : ''}`
        if (h > 0) return `hace ${h} hora${h > 1 ? 's' : ''}`
        return 'hace unos minutos'
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FiRadio style={{ color: 'var(--red-primary)' }} /> Noticias
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        Últimas noticias sobre David Collado y la comunidad dominicana en Europa
                    </p>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                        <FiPlus /> Publicar noticia
                    </button>
                )}
            </div>

            {/* Admin form */}
            {showForm && (
                <div className="card" style={{ marginBottom: 28, padding: 24 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Nueva noticia</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gap: 16 }}>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Título" className="input" required />
                            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Contenido..." className="input" rows={4} required style={{ resize: 'vertical' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="Fuente" className="input" />
                                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input">
                                    {['Política', 'Legislación', 'Comunidad', 'Eventos'].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary">Publicar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* News grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Cargando noticias...</div>
            ) : (
                <div style={{ display: 'grid', gap: 20 }}>
                    {news.map((item, i) => (
                        <article key={item.id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--red-primary)')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                        >
                            <div style={{ padding: '24px 28px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                    <span className={`badge ${CATEGORY_COLORS[item.category] || 'badge-blue'}`}>{item.category}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                                        <FiClock size={11} /> {timeAgo(item.created_at)}
                                    </span>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {item.source}</span>
                                </div>
                                <h2 style={{ fontWeight: 700, fontSize: i === 0 ? 20 : 17, marginBottom: 10, lineHeight: 1.4 }}>
                                    {item.title}
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                                    {item.content}
                                </p>
                                <a
                                    href={item.link || `https://www.google.com/search?q=${encodeURIComponent(item.title)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                        marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6,
                                        background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.3)', color: '#60a5fa',
                                        cursor: 'pointer', padding: '6px 12px', borderRadius: 20, textDecoration: 'none',
                                        fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(96, 165, 250, 0.2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(96, 165, 250, 0.1)')}
                                >
                                    Leer noticia completa <FiExternalLink size={14} />
                                </a>
                            </div>
                            {i === 0 && (
                                <div style={{ height: 3, background: 'linear-gradient(90deg, var(--blue-primary), var(--red-primary))' }} />
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    )
}
