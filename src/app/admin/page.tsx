'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Activity, Trip, Profile } from '@/lib/types'
import {
  MapPin, Users, Plane, Plus, Search, Edit3, Trash2,
  Loader2, ArrowLeft, Globe, X, Save
} from 'lucide-react'
import Link from 'next/link'

type AdminTab = 'activities' | 'users' | 'trips'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [selectedTab, setSelectedTab] = useState<AdminTab>('activities')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      // For now, any authenticated user can access admin
      // TODO: Lock to specific admin user IDs
      setAuthorized(true)
      setLoading(false)
    }
    checkAuth()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange animate-spin" />
      </div>
    )
  }

  if (!authorized) return null

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'activities', label: 'Activities', icon: <MapPin className="w-4 h-4" /> },
    { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { key: 'trips', label: 'Trips', icon: <Plane className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/app/discover" className="text-dim hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Globe className="w-6 h-6 text-orange" />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border/30 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`py-3 px-5 text-sm font-medium flex items-center gap-2 transition-colors ${
                selectedTab === tab.key ? 'tab-active' : 'tab-inactive'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {selectedTab === 'activities' && <ActivitiesAdmin />}
        {selectedTab === 'users' && <UsersAdmin />}
        {selectedTab === 'trips' && <TripsAdmin />}
      </div>
    </div>
  )
}

// MARK: - Activities Admin

function ActivitiesAdmin() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const supabase = createClient()

  const loadActivities = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(100)
    if (cityFilter) query = query.eq('city', cityFilter)
    if (search) query = query.ilike('name', `%${search}%`)
    const { data } = await query
    if (data) setActivities(data)
    setLoading(false)
  }, [supabase, cityFilter, search])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  useEffect(() => {
    const loadCities = async () => {
      const { data } = await supabase.from('activities').select('city').not('city', 'is', null)
      if (data) {
        const unique = [...new Set(data.map(a => a.city).filter(Boolean))] as string[]
        setCities(unique.sort())
      }
    }
    loadCities()
  }, [supabase])

  const deleteActivity = async (id: string) => {
    if (!confirm('Delete this activity?')) return
    await supabase.from('activities').delete().eq('id', id)
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dim" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Cities</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Stats */}
      <p className="text-sm text-dim mb-4">{activities.length} activities</p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-orange animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map(activity => (
            <div key={activity.id} className="card flex items-center gap-3">
              {activity.images?.[0] ? (
                <img src={activity.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-raised flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-dim" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{activity.name}</p>
                <p className="text-xs text-dim">{activity.city} · {activity.experience_tag || 'uncategorized'}</p>
              </div>
              <div className="flex items-center gap-1">
                {activity.is_sidequest && (
                  <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">gem</span>
                )}
                <button
                  onClick={() => deleteActivity(activity.id)}
                  className="p-2 text-dim hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Activity Modal */}
      {showAdd && (
        <AddActivityModal
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); loadActivities() }}
        />
      )}
    </div>
  )
}

function AddActivityModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [experienceTag, setExperienceTag] = useState('')
  const [costTier, setCostTier] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [isSidequest, setIsSidequest] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !city.trim()) return
    setSaving(true)
    setError('')

    const { error: insertError } = await supabase.from('activities').insert({
      name: name.trim(),
      description: description.trim() || null,
      city: city.trim(),
      neighborhood: neighborhood.trim() || null,
      experience_tag: experienceTag || null,
      cost_tier: costTier || null,
      duration_minutes: durationMinutes ? parseInt(durationMinutes) : null,
      is_sidequest: isSidequest,
      source: 'admin',
    })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
    } else {
      onAdded()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-card border border-border/50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border/30">
          <h2 className="text-lg font-semibold">Add Activity</h2>
          <button onClick={onClose} className="text-dim hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-3">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Activity name *" className="input-field" required />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="input-field min-h-[80px]" />
          <div className="grid grid-cols-2 gap-3">
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="City *" className="input-field" required />
            <input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Neighborhood" className="input-field" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <select value={experienceTag} onChange={e => setExperienceTag(e.target.value)} className="input-field">
              <option value="">Tag</option>
              <option value="hidden-gem">Hidden Gem</option>
              <option value="local-pick">Local Pick</option>
              <option value="must-see">Must See</option>
              <option value="food">Food</option>
              <option value="nightlife">Nightlife</option>
              <option value="culture">Culture</option>
              <option value="nature">Nature</option>
              <option value="adventure">Adventure</option>
            </select>
            <select value={costTier} onChange={e => setCostTier(e.target.value)} className="input-field">
              <option value="">Cost</option>
              <option value="free">Free</option>
              <option value="$">$</option>
              <option value="$$">$$</option>
              <option value="$$$">$$$</option>
            </select>
            <input value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} type="number" placeholder="Minutes" className="input-field" />
          </div>
          <label className="flex items-center gap-2 text-sm text-mid cursor-pointer">
            <input type="checkbox" checked={isSidequest} onChange={e => setIsSidequest(e.target.checked)} className="rounded" />
            Hidden Gem (SideQuest)
          </label>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Activity'}
          </button>
        </form>
      </div>
    </div>
  )
}

// MARK: - Users Admin

function UsersAdmin() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (data) setUsers(data)
      setLoading(false)
    }
    loadUsers()
  }, [supabase])

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-orange animate-spin" /></div>
  }

  return (
    <div>
      <p className="text-sm text-dim mb-4">{users.length} users</p>
      <div className="space-y-2">
        {users.map(user => (
          <div key={user.id} className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-raised flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-mid">
                {(user.display_name || user.name || user.email || '?')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.display_name || user.name || 'No name'}</p>
              <p className="text-xs text-dim truncate">{user.email}</p>
            </div>
            <div className="text-right flex-shrink-0">
              {user.xp != null && (
                <span className="text-xs text-gold">{user.xp} XP</span>
              )}
              {user.rank && (
                <p className="text-xs text-dim">{user.rank}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// MARK: - Trips Admin

function TripsAdmin() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadTrips = async () => {
      const { data } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (data) setTrips(data)
      setLoading(false)
    }
    loadTrips()
  }, [supabase])

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-orange animate-spin" /></div>
  }

  return (
    <div>
      <p className="text-sm text-dim mb-4">{trips.length} trips</p>
      <div className="space-y-2">
        {trips.map(trip => (
          <div key={trip.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{trip.title}</p>
                <p className="text-xs text-dim mt-1">
                  {trip.destinations?.join(', ')}
                  {trip.mode && ` · ${trip.mode}`}
                </p>
              </div>
              <div className="text-right">
                {trip.invite_code && (
                  <p className="text-xs font-mono text-teal-light">{trip.invite_code}</p>
                )}
                {trip.budget && (
                  <p className="text-xs text-gold mt-1">{trip.currency} {trip.budget}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
