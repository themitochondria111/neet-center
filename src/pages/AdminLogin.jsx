import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Eye, EyeOff, AlertCircle, Loader2, Shield } from 'lucide-react'

export default function AdminLogin() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!email || !password) { setError('Please fill in all fields.'); return }
        setLoading(true); setError('')
        try {
            const { error: err } = await supabase.auth.signInWithPassword({ email, password })
            if (err) setError(err.message)
            else navigate('/admin/dashboard')
        } catch {
            setError('Unexpected error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const iClass = `w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-sm
    placeholder-stone-300 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-900/5
    hover:border-stone-300 transition-all`

    return (
        <div className="min-h-[calc(100vh-60px)] flex items-center justify-center py-12 px-5">
            <div className="w-full max-w-sm">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-900 mb-4">
                        <Shield size={20} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-stone-900 mb-1">Admin login</h1>
                    <p className="text-stone-400 text-sm">Authorized access only</p>
                </div>

                {/* Form */}
                <div className="bg-white border border-stone-200 rounded-2xl p-7 shadow-sm">
                    <form onSubmit={handleLogin} noValidate className="space-y-4">

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-stone-700">Email</label>
                            <input
                                id="admin-email"
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError('') }}
                                placeholder="admin@example.com"
                                className={iClass}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-stone-700">Password</label>
                            <div className="relative">
                                <input
                                    id="admin-password"
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError('') }}
                                    placeholder="••••••••"
                                    className={`${iClass} pr-11`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors"
                                >
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3.5 py-3">
                                <AlertCircle size={14} className="text-red-400 shrink-0" />
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            id="admin-login-btn"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700
                text-white font-semibold py-3.5 rounded-xl text-sm transition-all mt-1
                disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {loading ? <><Loader2 size={16} className="animate-spin" />Signing in…</> : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-stone-300 text-xs mt-5">
                    Use your Supabase Auth credentials
                </p>
            </div>
        </div>
    )
}
