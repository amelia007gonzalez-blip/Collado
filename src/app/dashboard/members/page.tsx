'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { FiUsers, FiSearch, FiMapPin } from 'react-icons/fi'

interface Member {
    id: string
    full_name: string
    country: string
    city: string
    created_at: string
}

const COUNTRIES = ['Todos', 'España', 'Francia', 'Italia', 'Alemania', 'Portugal', 'Países Bajos', 'Reino Unido', 'Bélgica']
const COUNTRY_FLAGS: Record<string, string> = {
    España: '🇪🇸', Francia: '🇫🇷', Italia: '🇮🇹', Alemania: '🇩🇪',
    Portugal: '🇵🇹', 'Países Bajos': '🇳🇱', 'Reino Unido': '🇬🇧', Bélgica: '🇧🇪',
    Suiza: '🇨🇭', Suecia: '🇸🇪', Noruega: '🇳🇴', Dinamarca: '🇩🇰', Austria: '🇦🇹', Grecia: '🇬🇷'
}

const SAMPLE_MEMBERS: Member[] = [
    { id: '1', full_name: 'María García', country: 'España', city: 'Madrid', created_at: new Date().toISOString() },
    { id: '2', full_name: 'Carlos Fernández', country: 'Francia', city: 'París', created_at: new Date().toISOString() },
    { id: '3', full_name: 'Ana Reyes', country: 'Italia', city: 'Milán', created_at: new Date().toISOString() },
    { id: '4', full_name: 'Luis Martínez', country: 'Alemania', city: 'Berlín', created_at: new Date().toISOString() },
    { id: '5', full_name: 'Sofia Cruz', country: 'Portugal', city: 'Lisboa', created_at: new Date().toISOString() },
    { id: '6', full_name: 'Pedro Jiménez', country: 'España', city: 'Barcelona', created_at: new Date().toISOString() },
    { id: '7', full_name: 'Lucía Torres', country: 'Francia', city: 'Lyon', created_at: new Date().toISOString() },
    { id: '8', full_name: 'Miguel Ángel Díaz', country: 'Alemania', city: 'Múnich', created_at: new Date().toISOString() },
    { id: '9', full_name: 'Carmen López', country: 'Reino Unido', city: 'Londres', created_at: new Date().toISOString() },
    { id: '10', full_name: 'Roberto Vargas', country: 'Países Bajos', city: 'Ámsterdam', created_at: new Date().toISOString() },
    { id: '11', full_name: 'Isabel Morales', country: 'Bélgica', city: 'Bruselas', created_at: new Date().toISOString() },
    { id: '12', full_name: 'José Ramírez', country: 'España', city: 'Valencia', created_at: new Date().toISOString() },
]

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>(SAMPLE_MEMBERS)
    const [search, setSearch] = useState('')
    const [filterCountry, setFilterCountry] = useState('Todos')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100)
            if (data && data.length > 0) setMembers(data)
            setLoading(false)
        }
        fetch()
    }, [])

    const filtered = members.filter(m => {
        const matchSearch = search === '' ||
            m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            m.city?.toLowerCase().includes(search.toLowerCase())
        const matchCountry = filterCountry === 'Todos' || m.country === filterCountry
        return matchSearch && matchCountry
    })

    const joinedAgo = (iso: string) => {
        const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
        if (days === 0) return 'Se unió hoy'
        if (days === 1) return 'Se unió ayer'
        if (days < 30) return `Se unió hace ${days} días`
        return `Se unió hace ${Math.floor(days / 30)} meses`
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiUsers style={{ color: '#059669' }} /> Miembros
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                    {members.length} dominicanos conectados en Europa
                </p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        id="members-search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o ciudad..."
                        className="input"
                        style={{ paddingLeft: 42 }}
                    />
                </div>
                <select
                    value={filterCountry}
                    onChange={e => setFilterCountry(e.target.value)}
                    className="input"
                    style={{ width: 'auto', minWidth: 160 }}
                >
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
            </div>

            {/* Stats by country */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                {COUNTRIES.slice(1).map(country => {
                    const count = members.filter(m => m.country === country).length
                    if (count === 0) return null
                    return (
                        <button
                            key={country}
                            onClick={() => setFilterCountry(filterCountry === country ? 'Todos' : country)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                                borderRadius: 20, border: '1px solid',
                                borderColor: filterCountry === country ? 'var(--blue-primary)' : 'var(--border)',
                                background: filterCountry === country ? 'rgba(0,45,98,0.3)' : 'var(--bg-card)',
                                color: filterCountry === country ? '#60a5fa' : 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif',
                                transition: 'all 0.2s'
                            }}
                        >
                            {COUNTRY_FLAGS[country] || '🌍'} {country} <span style={{ fontWeight: 700 }}>{count}</span>
                        </button>
                    )
                })}
            </div>

            {/* Members grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Cargando miembros...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    No se encontraron miembros con ese criterio
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                    {filtered.map(member => {
                        const initials = (member.full_name || 'U').slice(0, 2).toUpperCase()
                        const colors = [
                            ['#002D62', '#003f8a'], ['#CE1126', '#e8132d'],
                            ['#7c3aed', '#9333ea'], ['#059669', '#10b981']
                        ]
                        const colorPair = colors[member.id.charCodeAt(0) % colors.length]
                        return (
                            <div key={member.id} className="card" style={{ padding: 20, textAlign: 'center', cursor: 'pointer' }}>
                                <div style={{
                                    width: 60, height: 60, borderRadius: '50%', margin: '0 auto 14px',
                                    background: `linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 20, fontWeight: 800, color: 'white',
                                    boxShadow: `0 4px 20px ${colorPair[0]}66`
                                }}>{initials}</div>
                                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                                    {member.full_name || 'Usuario'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
                                    <span style={{ fontSize: 16 }}>{COUNTRY_FLAGS[member.country] || '🌍'}</span>
                                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{member.country}</span>
                                </div>
                                {member.city && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 10 }}>
                                        <FiMapPin size={12} color="var(--text-muted)" />
                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{member.city}</span>
                                    </div>
                                )}
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                                    {joinedAgo(member.created_at)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
