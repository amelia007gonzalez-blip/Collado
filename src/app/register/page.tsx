'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiUser, FiGlobe, FiArrowRight } from 'react-icons/fi'
import confetti from 'canvas-confetti'

const EUROPEAN_COUNTRIES = [
    'España', 'Francia', 'Italia', 'Alemania', 'Portugal',
    'Países Bajos', 'Bélgica', 'Suiza', 'Reino Unido', 'Suecia',
    'Noruega', 'Dinamarca', 'Austria', 'Grecia', 'Otro'
]

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        name: '', email: '', password: '', country: '', city: ''
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.country) { toast.error('Selecciona tu país'); return }
        setLoading(true)
        const { error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: { full_name: form.name, country: form.country, city: form.city }
            }
        })
        if (error) {
            toast.error(error.message)
        } else {
            toast.success('¡Cuenta creada! Revisa tu correo para confirmar.')

            // Disparar confeti de celebración
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#002D62', '#CE1126', '#FFFFFF'] // Colores de la bandera dominicana
            })

            setTimeout(() => {
                router.push('/dashboard')
            }, 1500)
        }
        setLoading(false)
    }

    return (
        <div className="hero-gradient" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div className="flag-stripe" />
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '40px 20px'
            }}>
                <div style={{ width: '100%', maxWidth: 480 }} className="animate-fade-in">
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--blue-primary), var(--red-primary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 32, fontWeight: 900, color: 'white',
                            margin: '0 auto 16px', boxShadow: '0 0 40px rgba(0,45,98,0.5)'
                        }}>C</div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Únete a la comunidad</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                            Crea tu cuenta en Collado Europa Conecta
                        </p>
                    </div>

                    <div className="card" style={{ padding: 32 }}>
                        <form onSubmit={handleRegister}>
                            {[
                                { name: 'name', label: 'Nombre completo', type: 'text', icon: <FiUser />, placeholder: 'Juan Pérez' },
                                { name: 'email', label: 'Correo electrónico', type: 'email', icon: <FiMail />, placeholder: 'tu@email.com' },
                                { name: 'password', label: 'Contraseña', type: 'password', icon: <FiLock />, placeholder: 'Mínimo 6 caracteres' },
                                { name: 'city', label: 'Ciudad de residencia', type: 'text', icon: <FiGlobe />, placeholder: 'Madrid, París...' },
                            ].map(field => (
                                <div key={field.name} style={{ marginBottom: 18 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                                        {field.label}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                            {field.icon}
                                        </span>
                                        <input
                                            id={`register-${field.name}`}
                                            name={field.name}
                                            type={field.type}
                                            value={(form as Record<string, string>)[field.name]}
                                            onChange={handleChange}
                                            placeholder={field.placeholder}
                                            className="input"
                                            style={{ paddingLeft: 44 }}
                                            required={field.name !== 'city'}
                                        />
                                    </div>
                                </div>
                            ))}

                            <div style={{ marginBottom: 28 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                                    País de residencia
                                </label>
                                <select
                                    id="register-country"
                                    name="country"
                                    value={form.country}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                >
                                    <option value="">Selecciona tu país</option>
                                    {EUROPEAN_COUNTRIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                id="register-submit"
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
                                disabled={loading}
                            >
                                {loading ? 'Creando cuenta...' : (<>Crear cuenta gratis <FiArrowRight /></>)}
                            </button>
                        </form>
                    </div>

                    <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
                            Iniciar sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
