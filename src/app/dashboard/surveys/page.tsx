'use client'
import { useState, useEffect } from 'react'
import { FiPlus, FiBarChart2, FiClock, FiCheckCircle } from 'react-icons/fi'

interface Option {
    id: string
    text: string
    votes: number
}

interface Survey {
    id: string
    question: string
    options: Option[]
    expiresAt: string
    active: boolean
    totalVotes: number
    author: string
}

export default function SurveysPage() {
    const [surveys, setSurveys] = useState<Survey[]>([
        {
            id: '1',
            question: '¿Cuál consideras que es el logro más impactante de David Collado?',
            options: [
                { id: 'a', text: 'Récord de 11.6M de turistas', votes: 45 },
                { id: 'b', text: 'Recuperación de malecones', votes: 12 },
                { id: 'c', text: 'Seguridad turística', votes: 8 },
                { id: 'd', text: 'Apoyo a la diáspora', votes: 30 }
            ],
            expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
            active: true,
            totalVotes: 95,
            author: 'Sistema'
        },
        {
            id: '2',
            question: 'En un futuro gobierno de David, ¿cuál debe ser la prioridad #1?',
            options: [
                { id: 'a', text: 'Modernización del Estado', votes: 20 },
                { id: 'b', text: 'Educación y Empleo', votes: 35 },
                { id: 'c', text: 'Seguridad Ciudadana', votes: 40 },
                { id: 'd', text: 'Infraestructura Nacional', votes: 15 }
            ],
            expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
            active: true,
            totalVotes: 110,
            author: 'Colladin'
        }
    ])

    const [showCreate, setShowCreate] = useState(false)
    const [newQuestion, setNewQuestion] = useState('')
    const [newOptions, setNewOptions] = useState(['', ''])

    const addVote = (surveyId: string, optionId: string) => {
        setSurveys(prev => prev.map(s => {
            if (s.id !== surveyId) return s
            const updatedOptions = s.options.map(o =>
                o.id === optionId ? { ...o, votes: o.votes + 1 } : o
            )
            return { ...s, options: updatedOptions, totalVotes: s.totalVotes + 1 }
        }))
    }

    const createSurvey = () => {
        if (!newQuestion || newOptions.some(o => !o)) return
        const n: Survey = {
            id: Date.now().toString(),
            question: newQuestion,
            options: newOptions.map((text, i) => ({ id: i.toString(), text, votes: 0 })),
            expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
            active: true,
            totalVotes: 0,
            author: 'Usuario'
        }
        setSurveys([n, ...surveys])
        setShowCreate(false)
        setNewQuestion('')
        setNewOptions(['', ''])
    }

    return (
        <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>📊 Centro de Encuestas</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Tu voz cuenta en la visión 2028.</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    style={{
                        background: 'linear-gradient(135deg, var(--blue-primary), #1e293b)',
                        color: 'white', border: 'none', padding: '10px 20px',
                        borderRadius: 12, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    <FiPlus /> Crear Encuesta
                </button>
            </div>

            {showCreate && (
                <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 16, border: '1px solid var(--border)', marginBottom: 24, boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: 16 }}>Nueva Encuesta</h3>
                    <input
                        placeholder="Escribe tu pregunta..."
                        value={newQuestion}
                        onChange={e => setNewQuestion(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 12, background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    />
                    {newOptions.map((opt, i) => (
                        <input
                            key={i}
                            placeholder={`Opción ${i + 1}`}
                            value={opt}
                            onChange={e => {
                                const copy = [...newOptions]
                                copy[i] = e.target.value
                                setNewOptions(copy)
                            }}
                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 8, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13 }}
                        />
                    ))}
                    <button
                        onClick={() => setNewOptions([...newOptions, ''])}
                        style={{ background: 'none', border: '1px dashed #60a5fa', color: '#60a5fa', padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer', marginBottom: 16 }}
                    >+ Añadir opción</button>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</button>
                        <button onClick={createSurvey} style={{ background: 'var(--blue-primary)', color: 'white', border: 'none', padding: '8px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Publicar</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
                {surveys.map(s => (
                    <div key={s.id} style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 20, border: '1px solid var(--border)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 1 }}>Autor: {s.author}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10b981', fontWeight: 700 }}>
                                <FiCheckCircle size={14} /> ACTIVA
                            </div>
                        </div>
                        <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>{s.question}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {s.options.map(o => {
                                const pct = s.totalVotes > 0 ? Math.round((o.votes / s.totalVotes) * 100) : 0
                                return (
                                    <button
                                        key={o.id}
                                        onClick={() => addVote(s.id, o.id)}
                                        style={{
                                            width: '100%', padding: '12px 16px', borderRadius: 12,
                                            border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                                            textAlign: 'left', cursor: 'pointer', position: 'relative', overflow: 'hidden'
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute', top: 0, left: 0, height: '100%',
                                            width: `${pct}%`, background: 'rgba(96, 165, 250, 0.1)', transition: 'width 0.4s ease'
                                        }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                                            <span style={{ fontSize: 13, fontWeight: 600 }}>{o.text}</span>
                                            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue-primary)' }}>{pct}%</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: 11 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FiBarChart2 /> {s.totalVotes} votos totales
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <FiClock /> Caduca: {new Date(s.expiresAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
