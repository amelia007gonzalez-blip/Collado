'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FiCalendar, FiMapPin, FiClock, FiPlus, FiUsers } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Event {
    id: string
    title: string
    description: string
    location: string
    city?: string
    country: string
    contact_info?: string
    event_date: string
    event_time: string
    attendees: number
    created_at: string
}

const SAMPLE_EVENTS: Event[] = [
    {
        id: '1', title: 'Gran Encuentro Dominicano en Madrid',
        description: 'Reunión de la comunidad dominicana en Madrid para debatir propuestas de apoyo a David Collado y fortalecer nuestra red. Habrá comida dominicana, música y más.',
        location: 'Centro Cultural Dominicano, Calle Gran Vía 45', country: 'España',
        event_date: '2025-03-15', event_time: '18:00', attendees: 87, created_at: new Date().toISOString(),
    },
    {
        id: '2', title: 'Webinar: Dominicanos en Europa – Visión 2028',
        description: 'Sesión virtual donde líderes de la comunidad presentarán propuestas para integrar la voz de los dominicanos en el exterior en el proyecto de David Collado.',
        location: 'En línea (Zoom)', country: 'Europa',
        event_date: '2025-03-22', event_time: '20:00', attendees: 234, created_at: new Date().toISOString(),
    },
    {
        id: '3', title: 'Cena de Gala Dominicana – París',
        description: 'Cena de gala para recaudar fondos y apoyar las iniciativas de la comunidad dominicana en Francia. Vestimenta formal. Cupos limitados.',
        location: 'Hotel Le Marais, París', country: 'Francia',
        event_date: '2025-04-05', event_time: '19:30', attendees: 45, created_at: new Date().toISOString(),
    },
    {
        id: '4', title: 'Festival Dominicano – Milán',
        description: 'Celebración cultural con música típica dominicana, gastronomía, danzas y actividades para toda la familia en el corazón de Milán.',
        location: 'Parque Sempione, Milán', country: 'Italia',
        event_date: '2025-04-19', event_time: '12:00', attendees: 120, created_at: new Date().toISOString(),
    },
]

const COUNTRY_FLAGS: Record<string, string> = {
    España: '🇪🇸', Francia: '🇫🇷', Italia: '🇮🇹', Alemania: '🇩🇪',
    Portugal: '🇵🇹', Europa: '🌍', Otro: '🌐'
}

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>(SAMPLE_EVENTS)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [joining, setJoining] = useState<string | null>(null)
    const [form, setForm] = useState({
        title: '', description: '', location: '', city: '', contact_info: '', country: 'España',
        event_date: '', event_time: '18:00'
    })

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('events').select('*').order('event_date').limit(20)
            if (data && data.length > 0) setEvents(data)
            setLoading(false)
        }
        fetch()
    }, [])

    const handleJoin = async (eventId: string) => {
        setJoining(eventId)
        await new Promise(r => setTimeout(r, 700))
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendees: e.attendees + 1 } : e))
        toast.success('¡Te has registrado en el evento!')
        setJoining(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const { error } = await supabase.from('events').insert({ ...form, attendees: 0 })
        if (error) toast.error('Error al crear evento')
        else { toast.success('¡Evento creado!'); setShowForm(false) }
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00')
        return d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    }

    const getDaysLeft = (dateStr: string) => {
        const diff = new Date(dateStr + 'T00:00:00').getTime() - Date.now()
        const days = Math.ceil(diff / 86400000)
        if (days < 0) return 'Pasado'
        if (days === 0) return '¡Hoy!'
        return `En ${days} día${days !== 1 ? 's' : ''}`
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FiCalendar style={{ color: '#7c3aed' }} /> Eventos
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        Próximos encuentros de la comunidad dominicana en Europa
                    </p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    <FiPlus /> Crear evento
                </button>
            </div>

            {/* Create form */}
            {showForm && (
                <div className="card" style={{ marginBottom: 28, padding: 28 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Nuevo evento</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gap: 16 }}>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="Nombre del evento" className="input" required />
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Descripción..." className="input" rows={3} style={{ resize: 'vertical' }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                                    placeholder="País" className="input" required />
                                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                                    placeholder="Ciudad" className="input" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                                    placeholder="Ubicación exacta / Link" className="input" required />
                                <input value={form.contact_info} onChange={e => setForm({ ...form, contact_info: e.target.value })}
                                    placeholder="Forma de contacto (Email/Tel)" className="input" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })}
                                    className="input" required />
                                <input type="time" value={form.event_time} onChange={e => setForm({ ...form, event_time: e.target.value })}
                                    className="input" required />
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" className="btn btn-primary">Crear evento</button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancelar</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Events */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Cargando eventos...</div>
            ) : (
                <div style={{ display: 'grid', gap: 20 }}>
                    {events.map(event => {
                        const daysLeft = getDaysLeft(event.event_date)
                        const isPast = daysLeft === 'Pasado'
                        return (
                            <div key={event.id} className="card" style={{
                                padding: 0, overflow: 'hidden',
                                opacity: isPast ? 0.6 : 1
                            }}>
                                <div style={{
                                    display: 'flex', gap: 0,
                                }}>
                                    {/* Date sidebar */}
                                    <div style={{
                                        width: 100, flexShrink: 0,
                                        background: isPast
                                            ? 'rgba(107,114,128,0.2)'
                                            : 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(0,45,98,0.3))',
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        padding: '20px 12px', textAlign: 'center',
                                        borderRight: '1px solid var(--border)'
                                    }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 6 }}>
                                            {new Date(event.event_date + 'T00:00:00').toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()}
                                        </div>
                                        <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, marginBottom: 6 }}>
                                            {new Date(event.event_date + 'T00:00:00').getDate()}
                                        </div>
                                        <div style={{
                                            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                                            background: isPast ? 'rgba(107,114,128,0.3)' : 'rgba(124,58,237,0.3)',
                                            color: isPast ? 'var(--text-muted)' : '#a78bfa'
                                        }}>{daysLeft}</div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1, padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 10 }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                    <span style={{ fontSize: 18 }}>{COUNTRY_FLAGS[event.country] || '🌍'}</span>
                                                    <span className="badge badge-blue" style={{ fontSize: 11 }}>{event.country}</span>
                                                </div>
                                                <h2 style={{ fontWeight: 700, fontSize: 17, lineHeight: 1.3 }}>{event.title}</h2>
                                            </div>
                                            {!isPast && (
                                                <button
                                                    onClick={() => handleJoin(event.id)}
                                                    className="btn btn-primary"
                                                    style={{ padding: '9px 18px', fontSize: 13, flexShrink: 0 }}
                                                    disabled={joining === event.id}
                                                >
                                                    {joining === event.id ? '...' : 'Asistir'}
                                                </button>
                                            )}
                                        </div>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
                                            {event.description}
                                        </p>
                                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                                                <FiMapPin size={13} /> {event.location} {event.city ? `(${event.city})` : ''}
                                            </span>
                                            {event.contact_info && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                                                    Contacto: {event.contact_info}
                                                </span>
                                            )}
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                                                <FiClock size={13} /> {event.event_time}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                                                <FiUsers size={13} /> {event.attendees} asistentes
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
