'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { Globe, Map, Users, Sparkles, ArrowRight, Check } from 'lucide-react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setSubmitting(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: dbError } = await supabase
        .from('waitlist')
        .insert({ email: email.trim().toLowerCase() })

      if (dbError) {
        if (dbError.code === '23505') {
          setSubmitted(true) // Already on waitlist
        } else {
          setError('Something went wrong. Try again.')
        }
      } else {
        setSubmitted(true)
      }
    } catch {
      setError('Something went wrong. Try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-bg/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-orange" />
            <span className="text-xl font-bold">Weventr</span>
          </div>
          <Link href="/login" className="btn-primary text-sm py-2 px-5">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-teal/20 text-teal-light px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Now in beta
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 animate-slide-up">
            Travel beyond
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange to-gold">
              tourism.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-mid max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Weventr connects people across cultures through travel. Stop visiting places — start experiencing them. Discover hidden gems, build trips with friends, and immerse yourself in the world.
          </p>

          {/* Waitlist Form */}
          <div className="max-w-md mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {submitted ? (
              <div className="flex items-center justify-center gap-3 bg-teal/20 border border-teal/30 rounded-card p-5">
                <Check className="w-5 h-5 text-teal-light" />
                <span className="text-teal-light font-medium">You&apos;re on the list. We&apos;ll be in touch.</span>
              </div>
            ) : (
              <form onSubmit={handleWaitlist} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-field flex-1"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary whitespace-nowrap flex items-center gap-2"
                >
                  {submitting ? 'Joining...' : 'Join Waitlist'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </div>

          {/* Or sign in */}
          <p className="text-dim text-sm mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Already have an account?{' '}
            <Link href="/login" className="text-teal-light hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How it works
          </h2>
          <p className="text-mid text-center mb-16 max-w-xl mx-auto">
            From discovery to departure — plan trips that actually matter.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Globe className="w-8 h-8" />}
              title="Discover"
              description="Swipe through curated hidden experiences. Local food spots, secret viewpoints, cultural gems the guidebooks miss."
              color="orange"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Plan Together"
              description="Create group trips, vote on activities, and let everyone have a say. Budget tracking keeps the whole crew aligned."
              color="teal"
            />
            <FeatureCard
              icon={<Map className="w-8 h-8" />}
              title="Experience"
              description="AI-powered itineraries built from your group's votes. Every trip is personal, every moment is intentional."
              color="gold"
            />
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 border-t border-border/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our mission</h2>
          <p className="text-lg text-mid leading-relaxed">
            Weventr connects people across cultures through travel. We believe the world gets smaller when you stop visiting places and start experiencing them. Our mission is to build a generation that doesn&apos;t just tolerate difference — they seek it out.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-dim">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange" />
            <span>Weventr</span>
          </div>
          <p>&copy; 2026 Weventr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, color }: {
  icon: React.ReactNode
  title: string
  description: string
  color: 'orange' | 'teal' | 'gold'
}) {
  const colorMap = {
    orange: 'bg-orange/10 text-orange',
    teal: 'bg-teal/20 text-teal-light',
    gold: 'bg-gold/10 text-gold',
  }

  return (
    <div className="card group hover:border-border transition-all duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${colorMap[color]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-mid leading-relaxed">{description}</p>
    </div>
  )
}
