'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Activity } from '@/lib/types'
import { Heart, X, Star, MapPin, Clock, DollarSign, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DiscoverPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [imageIndex, setImageIndex] = useState(0)
  const supabase = createClient()

  const loadActivities = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (selectedCity) {
      query = query.eq('city', selectedCity)
    }

    const { data } = await query
    if (data) {
      // Shuffle
      const shuffled = [...data].sort(() => Math.random() - 0.5)
      setActivities(shuffled)
      setCurrentIndex(0)
      setImageIndex(0)
    }
    setLoading(false)
  }, [supabase, selectedCity])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  // Load available cities
  useEffect(() => {
    const loadCities = async () => {
      const { data } = await supabase
        .from('activities')
        .select('city')
        .not('city', 'is', null)
      if (data) {
        const unique = [...new Set(data.map(a => a.city).filter(Boolean))] as string[]
        setCities(unique.sort())
      }
    }
    loadCities()
  }, [supabase])

  const currentActivity = activities[currentIndex]

  const handleSwipe = async (direction: 'left' | 'right', isSuperLike = false) => {
    if (!currentActivity || !user) return

    setSwipeDirection(direction)

    if (direction === 'right') {
      // Save activity
      await supabase.from('saved_activities').upsert({
        user_id: user.id,
        activity_id: currentActivity.id,
        is_super_like: isSuperLike,
      }, { onConflict: 'user_id,activity_id' })
    }

    setTimeout(() => {
      setSwipeDirection(null)
      setCurrentIndex(prev => prev + 1)
      setImageIndex(0)
    }, 300)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleSwipe('left')
      if (e.key === 'ArrowRight') handleSwipe('right')
      if (e.key === 'ArrowUp') handleSwipe('right', true)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 text-orange animate-spin" />
      </div>
    )
  }

  if (!currentActivity || currentIndex >= activities.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center">
        <Compass className="w-16 h-16 text-dim mb-4" />
        <h2 className="text-xl font-semibold mb-2">No more activities</h2>
        <p className="text-mid mb-6">You&apos;ve seen everything{selectedCity ? ` in ${selectedCity}` : ''}!</p>
        <button onClick={() => { setCurrentIndex(0); loadActivities() }} className="btn-teal">
          Refresh
        </button>
      </div>
    )
  }

  const images = currentActivity.images?.length
    ? currentActivity.images
    : currentActivity.image_url
      ? [currentActivity.image_url]
      : []

  return (
    <div className="px-4 pt-4">
      {/* City Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCity('')}
          className={`chip whitespace-nowrap ${!selectedCity ? 'chip-active' : 'chip-inactive'}`}
        >
          All Cities
        </button>
        {cities.map(city => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`chip whitespace-nowrap ${selectedCity === city ? 'chip-active' : 'chip-inactive'}`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-dim mb-3">
        <span>{currentIndex + 1} / {activities.length}</span>
        {currentActivity.is_sidequest && (
          <span className="bg-gold/20 text-gold px-2 py-0.5 rounded-full text-xs font-medium">
            Hidden Gem
          </span>
        )}
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentActivity.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
            rotate: swipeDirection === 'left' ? -15 : swipeDirection === 'right' ? 15 : 0,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="card p-0 overflow-hidden"
        >
          {/* Image */}
          <div className="relative h-72 bg-raised">
            {images.length > 0 ? (
              <>
                <img
                  src={images[imageIndex] || images[0]}
                  alt={currentActivity.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImageIndex(prev => Math.max(0, prev - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full p-1"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === imageIndex ? 'bg-white' : 'bg-white/40'}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-dim" />
              </div>
            )}

            {/* Swipe overlays */}
            {swipeDirection === 'right' && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                <span className="text-4xl font-bold text-green-400 rotate-[-20deg] border-4 border-green-400 px-6 py-2 rounded-xl">
                  LIKE
                </span>
              </div>
            )}
            {swipeDirection === 'left' && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                <span className="text-4xl font-bold text-red-400 rotate-[20deg] border-4 border-red-400 px-6 py-2 rounded-xl">
                  PASS
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-5">
            <h2 className="text-xl font-bold mb-1">{currentActivity.name}</h2>

            <div className="flex items-center gap-3 text-sm text-mid mb-3">
              {currentActivity.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {currentActivity.city}
                  {currentActivity.neighborhood && ` · ${currentActivity.neighborhood}`}
                </span>
              )}
            </div>

            <p className="text-mid text-sm leading-relaxed mb-4 line-clamp-3">
              {currentActivity.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-dim">
              {currentActivity.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {currentActivity.duration_minutes}min
                </span>
              )}
              {currentActivity.cost_tier && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  {currentActivity.cost_tier}
                </span>
              )}
              {currentActivity.experience_tag && (
                <span className="bg-raised px-2 py-0.5 rounded-full">
                  {currentActivity.experience_tag}
                </span>
              )}
            </div>

            {/* Tags */}
            {currentActivity.tags && currentActivity.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {currentActivity.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="bg-raised text-dim text-xs px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <button
          onClick={() => handleSwipe('left')}
          className="w-14 h-14 rounded-full bg-raised border border-border flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 transition-all active:scale-90"
        >
          <X className="w-6 h-6 text-red-400" />
        </button>

        <button
          onClick={() => handleSwipe('right', true)}
          className="w-12 h-12 rounded-full bg-raised border border-border flex items-center justify-center hover:bg-gold/20 hover:border-gold/50 transition-all active:scale-90"
        >
          <Star className="w-5 h-5 text-gold" />
        </button>

        <button
          onClick={() => handleSwipe('right')}
          className="w-14 h-14 rounded-full bg-raised border border-border flex items-center justify-center hover:bg-green-500/20 hover:border-green-500/50 transition-all active:scale-90"
        >
          <Heart className="w-6 h-6 text-green-400" />
        </button>
      </div>

      <p className="text-center text-dim/50 text-xs mt-4">
        ← Pass · ↑ Super Like · Like →
      </p>
    </div>
  )
}

function Compass({ className }: { className?: string }) {
  return <MapPin className={className} />
}
