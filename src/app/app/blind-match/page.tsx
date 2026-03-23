'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Activity } from '@/lib/types'
import {
  Shuffle, Heart, X, MapPin, Clock, DollarSign,
  Loader2, Sparkles, Eye, EyeOff, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type MatchPhase = 'intro' | 'revealing' | 'revealed' | 'deciding'

export default function BlindMatchPage() {
  const { user } = useAuth()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [phase, setPhase] = useState<MatchPhase>('intro')
  const [loading, setLoading] = useState(false)
  const [revealStep, setRevealStep] = useState(0)
  const [matchHistory, setMatchHistory] = useState<{ activity: Activity; liked: boolean }[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const supabase = createClient()

  const getRandomActivity = useCallback(async () => {
    setLoading(true)
    setRevealStep(0)

    const { data, count } = await supabase
      .from('activities')
      .select('*', { count: 'exact' })

    if (data && count && count > 0) {
      const randomIndex = Math.floor(Math.random() * data.length)
      setActivity(data[randomIndex])
      setPhase('revealing')
    }
    setLoading(false)
  }, [supabase])

  const handleRevealNext = () => {
    if (revealStep < 3) {
      setRevealStep(prev => prev + 1)
    } else {
      setPhase('revealed')
    }
  }

  const handleDecision = async (liked: boolean) => {
    if (!activity || !user) return

    if (liked) {
      await supabase.from('saved_activities').upsert({
        user_id: user.id,
        activity_id: activity.id,
        is_super_like: false,
      }, { onConflict: 'user_id,activity_id' })
    }

    setMatchHistory(prev => [...prev, { activity, liked }])
    setPhase('intro')
    setActivity(null)
    setRevealStep(0)
  }

  // Clue data based on reveal step
  const clues = activity ? [
    {
      label: 'Vibe',
      value: activity.experience_tag || activity.tags?.[0] || 'Adventure',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      label: 'Location',
      value: activity.city || 'Somewhere exciting',
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      label: 'Duration',
      value: activity.duration_minutes ? `~${activity.duration_minutes} min` : 'A few hours',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      label: 'Price Range',
      value: activity.cost_tier || 'Varies',
      icon: <DollarSign className="w-5 h-5" />,
    },
  ] : []

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange to-gold mx-auto mb-3 flex items-center justify-center">
          <Shuffle className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Blind Match</h1>
        <p className="text-mid text-sm mt-1">Discover activities without the bias</p>
      </div>

      {/* Intro / Start Phase */}
      {phase === 'intro' && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="card text-center py-8">
            <EyeOff className="w-10 h-10 text-teal-light mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">How it works</h2>
            <p className="text-mid text-sm leading-relaxed max-w-xs mx-auto">
              We&apos;ll show you clues about an activity one at a time.
              Decide if you&apos;re interested before seeing the full reveal!
            </p>
          </div>

          <button
            onClick={getRandomActivity}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Shuffle className="w-5 h-5" />
            Start Blind Match
          </button>

          {/* Match Stats */}
          {matchHistory.length > 0 && (
            <div className="card-raised">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-mid" />
                  <span className="text-sm font-medium">Match History</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-mid">
                    {matchHistory.filter(m => m.liked).length} liked · {matchHistory.filter(m => !m.liked).length} passed
                  </span>
                  <ChevronRight className={`w-4 h-4 text-dim transition-transform ${showHistory ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {showHistory && (
                <div className="mt-4 space-y-2">
                  {matchHistory.slice().reverse().map((match, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-2 border-t border-border/30"
                    >
                      {(match.activity.images?.[0] || match.activity.image_url) ? (
                        <img
                          src={match.activity.images?.[0] || match.activity.image_url || ''}
                          alt={match.activity.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-dim" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{match.activity.name}</p>
                        <p className="text-xs text-dim">{match.activity.city}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        match.liked ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {match.liked ? 'Liked' : 'Passed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange animate-spin mb-4" />
          <p className="text-mid text-sm">Finding your match...</p>
        </div>
      )}

      {/* Revealing Phase - Clue Cards */}
      {phase === 'revealing' && activity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {clues.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i <= revealStep ? 'bg-orange scale-110' : 'bg-raised'
                }`}
              />
            ))}
          </div>

          {/* Clue Cards */}
          <div className="space-y-3">
            <AnimatePresence>
              {clues.slice(0, revealStep + 1).map((clue, i) => (
                <motion.div
                  key={clue.label}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: i === revealStep ? 0.1 : 0, duration: 0.3 }}
                  className="card"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      i === 0 ? 'bg-orange/20 text-orange' :
                      i === 1 ? 'bg-teal/20 text-teal-light' :
                      i === 2 ? 'bg-gold/20 text-gold' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {clue.icon}
                    </div>
                    <div>
                      <p className="text-xs text-dim uppercase tracking-wider">{clue.label}</p>
                      <p className="font-semibold">{clue.value}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Unrevealed slots */}
          <div className="space-y-3">
            {Array.from({ length: 3 - revealStep }).map((_, i) => (
              <div key={`hidden-${i}`} className="card border-dashed opacity-40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-raised flex items-center justify-center">
                    <EyeOff className="w-4 h-4 text-dim" />
                  </div>
                  <div>
                    <p className="text-xs text-dim">???</p>
                    <p className="text-sm text-dim">Tap reveal to uncover</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => handleDecision(false)}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5 text-red-400" />
              Pass
            </button>
            {revealStep < 3 ? (
              <button
                onClick={handleRevealNext}
                className="flex-1 btn-teal flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Reveal Next
              </button>
            ) : (
              <button
                onClick={() => setPhase('revealed')}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Full Reveal
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Fully Revealed Phase */}
      {phase === 'revealed' && activity && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          {/* Activity Card */}
          <div className="card p-0 overflow-hidden">
            {/* Image */}
            <div className="relative h-56 bg-raised">
              {(activity.images?.[0] || activity.image_url) ? (
                <img
                  src={activity.images?.[0] || activity.image_url || ''}
                  alt={activity.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-dim" />
                </div>
              )}

              {/* Reveal badge */}
              <div className="absolute top-3 right-3 bg-orange/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Revealed!
              </div>
            </div>

            {/* Info */}
            <div className="p-5">
              <h2 className="text-xl font-bold mb-1">{activity.name}</h2>

              <div className="flex items-center gap-3 text-sm text-mid mb-3">
                {activity.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {activity.city}
                    {activity.neighborhood && ` · ${activity.neighborhood}`}
                  </span>
                )}
              </div>

              {activity.description && (
                <p className="text-mid text-sm leading-relaxed mb-4">
                  {activity.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-dim">
                {activity.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {activity.duration_minutes}min
                  </span>
                )}
                {activity.cost_tier && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {activity.cost_tier}
                  </span>
                )}
                {activity.experience_tag && (
                  <span className="bg-raised px-2 py-0.5 rounded-full">
                    {activity.experience_tag}
                  </span>
                )}
              </div>

              {activity.tags && activity.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {activity.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="bg-raised text-dim text-xs px-2.5 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Decision Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleDecision(false)}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-card bg-raised border border-border/50 hover:bg-red-500/10 hover:border-red-500/30 transition-all active:scale-95"
            >
              <X className="w-6 h-6 text-red-400" />
              <span className="font-semibold">Pass</span>
            </button>
            <button
              onClick={() => handleDecision(true)}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-card bg-teal/20 border border-teal/30 hover:bg-teal/30 hover:border-teal/50 transition-all active:scale-95"
            >
              <Heart className="w-6 h-6 text-teal-light" />
              <span className="font-semibold text-teal-light">Save</span>
            </button>
          </div>

          <button
            onClick={getRandomActivity}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Shuffle className="w-5 h-5" />
            Try Another
          </button>
        </motion.div>
      )}
    </div>
  )
}
