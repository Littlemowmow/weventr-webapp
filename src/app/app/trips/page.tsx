'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Trip } from '@/lib/types'
import Link from 'next/link'
import { Plus, MapPin, Calendar, Users, Loader2, X } from 'lucide-react'

export default function TripsPage() {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const supabase = createClient()

  const loadTrips = useCallback(async () => {
    if (!user) return
    setLoading(true)

    // Get trips where user is owner
    const { data: ownedTrips } = await supabase
      .from('trips')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    // Get trips where user is a member
    const { data: memberTrips } = await supabase
      .from('trip_members')
      .select('trip_id')
      .eq('user_id', user.id)

    let allTrips = ownedTrips || []

    if (memberTrips && memberTrips.length > 0) {
      const memberTripIds = memberTrips
        .map(m => m.trip_id)
        .filter(id => !allTrips.some(t => t.id === id))

      if (memberTripIds.length > 0) {
        const { data: extraTrips } = await supabase
          .from('trips')
          .select('*')
          .in('id', memberTripIds)

        if (extraTrips) allTrips = [...allTrips, ...extraTrips]
      }
    }

    setTrips(allTrips)
    setLoading(false)
  }, [user, supabase])

  useEffect(() => {
    loadTrips()
  }, [loadTrips])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 text-orange animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Trips</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Trip
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
          <MapPin className="w-16 h-16 text-dim mb-4" />
          <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
          <p className="text-mid mb-6">Create your first trip and start discovering activities.</p>
          <button onClick={() => setShowCreate(true)} className="btn-teal">
            Create Trip
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      {/* Create Trip Modal */}
      {showCreate && (
        <CreateTripModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadTrips() }}
        />
      )}
    </div>
  )
}

function TripCard({ trip }: { trip: Trip }) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Link href={`/app/trips/${trip.id}`}>
      <div className="card hover:border-border transition-all group cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold group-hover:text-orange transition-colors">
              {trip.title}
            </h3>

            <div className="flex items-center gap-3 mt-2 text-sm text-mid">
              {trip.destinations && trip.destinations.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {trip.destinations.join(', ')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-dim">
              {trip.start_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(trip.start_date)}
                  {trip.end_date && ` – ${formatDate(trip.end_date)}`}
                </span>
              )}
              {trip.mode && (
                <span className="bg-teal/20 text-teal-light px-2 py-0.5 rounded-full">
                  {trip.mode}
                </span>
              )}
            </div>
          </div>

          {trip.budget && (
            <div className="text-right">
              <span className="text-sm font-medium text-gold">
                {trip.currency || '$'}{trip.budget.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function CreateTripModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim() || !destination.trim()) return

    setCreating(true)
    setError('')

    const { error: createError } = await supabase.from('trips').insert({
      owner_id: user.id,
      title: title.trim(),
      destinations: [destination.trim()],
      start_date: startDate || null,
      end_date: endDate || null,
      budget: budget ? parseFloat(budget) : null,
      currency: currency,
      mode: 'planning',
      status: 'active',
    })

    if (createError) {
      setError(createError.message)
      setCreating(false)
    } else {
      onCreated()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center">
      <div className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-card border border-border/50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border/30">
          <h2 className="text-lg font-semibold">Create Trip</h2>
          <button onClick={onClose} className="text-dim hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-4">
          <div>
            <label className="text-sm text-mid mb-1 block">Trip Name</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tokyo Adventure"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="text-sm text-mid mb-1 block">Destination</label>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Tokyo, Japan"
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-mid mb-1 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-mid mb-1 block">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-sm text-mid mb-1 block">Budget</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="5000"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm text-mid mb-1 block">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-field"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-button px-4 py-3">{error}</p>
          )}

          <button type="submit" disabled={creating} className="btn-primary w-full">
            {creating ? 'Creating...' : 'Create Trip'}
          </button>
        </form>
      </div>
    </div>
  )
}
