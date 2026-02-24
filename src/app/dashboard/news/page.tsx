'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FiRadio, FiExternalLink, FiClock, FiPlus } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface NewsItem {
    id: string
    title: string
    content: string
    source: string
    image_url?: string
    created_at: string
    category: string
}

const SAMPLE_NEWS: NewsItem[] = [
    {
        id: '1', title: 'Collado refuerza lazos con la comunidad dominicana en España',
        content: 'El candidato presidencial David Collado se reunió con representantes de la comunidad dominicana radicada en España para escuchar sus necesidades y propuestas para el país.',
        source: 'El Caribe', category: 'Política', created_at: new Date().toISOString(),
    },
    {
        id: '2', title: 'Nueva propuesta de ley para dominicanos en el exterior',
        content: 'David Collado presentó un proyecto de ley que beneficiaría a más de 2 millones de dominicanos que residen en el extranjero, facilitando trámites consulares y derechos de participación.',
        source: 'Listín Diario', category: 'Legislación', created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '3', title: 'Collado Europa Conecta supera los 500 miembros',
        content: 'La plataforma digital que conecta a dominicanos en Europa que apoyan a David Collado ha alcanzado los 500 miembros activos en apenas sus primeros meses de funcionamiento.',
        source: 'Collado Europa', category: 'Comunidad', created_at: new Date(Date.now() - 172800000).toISOString(),
    },
    {
        id: '4', title: 'Encuentro dominicano en París reúne a cientos de residentes',
        content: 'Un gran encuentro de la comunidad dominicana en París congregó a cientos de compatriotas para debatir sobre el futuro de República Dominicana y el liderazgo de David Collado.',
        source: 'Acento', category: 'Eventos', created_at: new Date(Date.now() - 259200000).toISOString(),
    },
]

const CATEGORY_COLORS: Record<string, string> = {
    Política: 'badge-blue', Legislación: 'badge-red',
    Comunidad: 'badge-green', Eventos: 'badge-blue'
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
            if (data && data.length > 0) setNews(data)
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
                                <button style={{
                                    marginTop: 16, display: 'flex', alignItems: 'center', gap: 6,
                                    background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer',
                                    fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif'
                                }}>
                                    Leer más <FiExternalLink size={13} />
                                </button>
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
