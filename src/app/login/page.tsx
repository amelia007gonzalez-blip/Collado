'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            toast.error(error.message)
        } else {
            toast.success('¡Bienvenido!')
            router.push('/dashboard')
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
                <div style={{ width: '100%', maxWidth: 440 }} className="animate-fade-in">
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--blue-primary), var(--red-primary))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 32, fontWeight: 900, color: 'white',
                            margin: '0 auto 16px', boxShadow: '0 0 40px rgba(0,45,98,0.5)'
                        }}>C</div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
                            Iniciar sesión
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                            Bienvenido de vuelta a la comunidad
                        </p>
                    </div>

                    {/* Form */}
                    <div className="card" style={{ padding: 32 }}>
                        <form onSubmit={handleLogin}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                                    Correo electrónico
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="tu@email.com"
                                        className="input"
                                        style={{ paddingLeft: 44 }}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: 28 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                                    Contraseña
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        id="login-password"
                                        type={showPass ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Tu contraseña"
                                        className="input"
                                        style={{ paddingLeft: 44, paddingRight: 44 }}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                                        position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                                    }}>
                                        {showPass ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <button
                                id="login-submit"
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}
                                disabled={loading}
                            >
                                {loading ? 'Entrando...' : (<>Entrar <FiArrowRight /></>)}
                            </button>
                        </form>
                    </div>

                    <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 14 }}>
                        ¿No tienes cuenta?{' '}
                        <Link href="/register" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
                            Regístrate gratis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
