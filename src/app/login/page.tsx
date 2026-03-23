'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Globe, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    if (isSignUp) {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
      if (data.user) {
        await supabase.from('profiles').update({ name, display_name: name }).eq('id', data.user.id)
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }
    }

    router.push('/app/discover')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Globe className="w-8 h-8 text-orange" />
            <span className="text-2xl font-bold">Weventr</span>
          </Link>
          <p className="text-mid text-sm">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="input-field"
              required
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="input-field"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-field pr-12"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-dim hover:text-mid"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-button px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-dim text-sm mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            className="text-teal-light hover:underline"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>

        <p className="text-center text-dim/50 text-xs mt-8">
          Same account works on iOS and web
        </p>
      </div>
    </div>
  )
}
