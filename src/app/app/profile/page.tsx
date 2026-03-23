'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import type { SavedActivity } from '@/lib/types'
import { Heart, MapPin, LogOut, Star, Globe, Loader2, Trash2 } from 'lucide-react'

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const [savedActivities, setSavedActivities] = useState<SavedActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ trips: 0, saved: 0, countries: 0 })
  const router = useRouter()
  const supabase = createClient()

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const [savedRes, tripsRes, stampsRes] = await Promise.all([
      supabase
        .from('saved_activities')
        .select('*, activity:activities(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('trips')
        .select('id')
        .eq('owner_id', user.id),
      supabase
        .from('country_stamps')
        .select('id')
        .eq('user_id', user.id),
    ])

    if (savedRes.data) setSavedActivities(savedRes.data)
    setStats({
      trips: tripsRes.data?.length || 0,
      saved: savedRes.data?.length || 0,
      countries: stampsRes.data?.length || 0,
    })
    setLoading(false)
  }, [user, supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const removeSaved = async (activityId: string) => {
    if (!user) return
    await supabase
      .from('saved_activities')
      .delete()
      .eq('user_id', user.id)
      .eq('activity_id', activityId)
    setSavedActivities(prev => prev.filter(s => s.activity_id !== activityId))
    setStats(prev => ({ ...prev, saved: prev.saved - 1 }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 text-orange animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Profile Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-raised border-2 border-border flex items-center justify-center mx-auto mb-3">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-mid">
              {(profile?.display_name || profile?.name || user?.email || '?')[0].toUpperCase()}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold">
          {profile?.display_name || profile?.name || 'Traveler'}
        </h1>
        {profile?.username && (
          <p className="text-dim text-sm">@{profile.username}</p>
        )}
        {profile?.rank && (
          <span className="inline-block bg-gold/20 text-gold text-xs font-medium px-3 py-1 rounded-full mt-2">
            {profile.rank}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard icon={<MapPin className="w-4 h-4" />} label="Trips" value={stats.trips} color="text-orange" />
        <StatCard icon={<Heart className="w-4 h-4" />} label="Saved" value={stats.saved} color="text-teal-light" />
        <StatCard icon={<Globe className="w-4 h-4" />} label="Countries" value={stats.countries} color="text-gold" />
      </div>

      {/* XP */}
      {profile?.xp != null && (
        <div className="card-raised mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-mid">Experience Points</span>
            <span className="text-lg font-bold text-gold">{profile.xp} XP</span>
          </div>
        </div>
      )}

      {/* Saved Activities */}
      <div>
        <h2 className="text-sm text-dim uppercase tracking-wider mb-3">
          Saved Activities ({savedActivities.length})
        </h2>

        {savedActivities.length === 0 ? (
          <div className="card text-center py-8">
            <Heart className="w-10 h-10 text-dim mx-auto mb-2" />
            <p className="text-mid text-sm">No saved activities yet</p>
            <p className="text-dim text-xs mt-1">Swipe right on activities to save them</p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedActivities.map(saved => (
              <div key={saved.id} className="card flex items-center gap-3">
                {saved.activity?.images?.[0] && (
                  <img
                    src={saved.activity.images[0]}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {saved.activity?.name || 'Activity'}
                  </p>
                  <p className="text-xs text-dim">
                    {saved.activity?.city}
                    {saved.is_super_like && (
                      <Star className="w-3 h-3 text-gold inline ml-1" />
                    )}
                  </p>
                </div>
                <button
                  onClick={() => removeSaved(saved.activity_id)}
                  className="text-dim hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="w-full mt-8 py-3 text-red-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-500/10 rounded-button transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode; label: string; value: number; color: string
}) {
  return (
    <div className="card text-center">
      <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-dim">{label}</p>
    </div>
  )
}
