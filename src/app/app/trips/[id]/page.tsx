'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import type { Trip, TripMember, ProposalRow } from '@/lib/types'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Calendar, Users, ThumbsUp, ThumbsDown,
  Share2, Copy, Check, Plus, Loader2, DollarSign, Plane, Clock,
  PieChart, Wallet, TrendingUp
} from 'lucide-react'

type DashboardTab = 'overview' | 'schedule' | 'budget' | 'logistics'

export default function TripDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [members, setMembers] = useState<TripMember[]>([])
  const [proposals, setProposals] = useState<ProposalRow[]>([])
  const [selectedTab, setSelectedTab] = useState<DashboardTab>('overview')
  const [loading, setLoading] = useState(true)
  const [codeCopied, setCodeCopied] = useState(false)
  const supabase = createClient()

  const loadTripData = useCallback(async () => {
    if (!id) return
    setLoading(true)

    const [tripRes, membersRes, proposalsRes] = await Promise.all([
      supabase.from('trips').select('*').eq('id', id).single(),
      supabase.from('trip_members').select('*, profile:profiles(*)').eq('trip_id', id),
      supabase.from('trip_proposals').select('*').eq('trip_id', id).order('net_votes', { ascending: false }),
    ])

    if (tripRes.data) setTrip(tripRes.data)
    if (membersRes.data) setMembers(membersRes.data)
    if (proposalsRes.data) setProposals(proposalsRes.data)
    setLoading(false)
  }, [id, supabase])

  useEffect(() => {
    loadTripData()
  }, [loadTripData])

  const handleVote = async (activityId: string, voteType: 'up' | 'down') => {
    if (!id) return
    await supabase.rpc('toggle_vote', {
      p_trip_id: id,
      p_activity_id: activityId,
      p_vote_type: voteType,
    })
    // Reload proposals
    const { data } = await supabase
      .from('trip_proposals')
      .select('*')
      .eq('trip_id', id)
      .order('net_votes', { ascending: false })
    if (data) setProposals(data)
  }

  const copyInviteCode = () => {
    if (trip?.invite_code) {
      navigator.clipboard.writeText(trip.invite_code)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 text-orange animate-spin" />
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
        <h2 className="text-xl font-semibold mb-2">Trip not found</h2>
        <Link href="/app/trips" className="btn-teal mt-4">Back to Trips</Link>
      </div>
    )
  }

  const tabs: { key: DashboardTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'budget', label: 'Budget' },
    { key: 'logistics', label: 'Logistics' },
  ]

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href="/app/trips" className="text-dim hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{trip.title}</h1>
          <div className="flex items-center gap-3 text-sm text-mid mt-1">
            {trip.destinations && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {trip.destinations.join(', ')}
              </span>
            )}
            {trip.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Invite Code */}
      {trip.invite_code && (
        <div className="card-raised flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-dim uppercase tracking-wider">Invite Code</p>
            <p className="text-lg font-mono font-bold text-teal-light tracking-widest">{trip.invite_code}</p>
          </div>
          <button onClick={copyInviteCode} className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm">
            {codeCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {codeCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}

      {/* Members */}
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-dim" />
        <span className="text-sm text-mid">{members.length} member{members.length !== 1 ? 's' : ''}</span>
        <div className="flex -space-x-2 ml-2">
          {members.slice(0, 5).map((member, i) => (
            <div
              key={member.id}
              className="w-7 h-7 rounded-full bg-raised border-2 border-card flex items-center justify-center text-xs font-medium"
              title={member.profile?.display_name || member.profile?.name || 'Member'}
            >
              {(member.profile?.display_name || member.profile?.name || '?')[0].toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-0 border-b border-border/30 mb-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`py-3 px-4 text-sm font-medium whitespace-nowrap transition-colors ${
              selectedTab === tab.key ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <OverviewTab
          trip={trip}
          proposals={proposals}
          userId={user?.id || ''}
          onVote={handleVote}
        />
      )}
      {selectedTab === 'schedule' && <ScheduleTab proposals={proposals} trip={trip} />}
      {selectedTab === 'budget' && <BudgetTab trip={trip} proposals={proposals} />}
      {selectedTab === 'logistics' && <LogisticsTab trip={trip} />}
    </div>
  )
}

// MARK: - Overview Tab

function OverviewTab({
  trip, proposals, userId, onVote
}: {
  trip: Trip
  proposals: ProposalRow[]
  userId: string
  onVote: (activityId: string, voteType: 'up' | 'down') => void
}) {
  return (
    <div className="space-y-4 pb-8">
      {/* Discover Activities CTA */}
      <Link href="/app/discover" className="block">
        <div className="card border-teal/30 hover:border-teal/60 transition-colors text-center py-6">
          <Plus className="w-8 h-8 text-teal-light mx-auto mb-2" />
          <p className="text-teal-light font-medium">Discover Activities</p>
          <p className="text-dim text-sm mt-1">Swipe to add activities to this trip</p>
        </div>
      </Link>

      {/* Proposals */}
      <div>
        <h3 className="text-xs text-dim uppercase tracking-wider mb-3">
          Proposed Activities ({proposals.length})
        </h3>

        {proposals.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-mid">No activities proposed yet</p>
            <p className="text-dim text-sm mt-1">Swipe right on activities in Discover to add them</p>
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map(proposal => (
              <ProposalCard
                key={`${proposal.trip_id}-${proposal.activity_id}`}
                proposal={proposal}
                userId={userId}
                onVote={onVote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProposalCard({
  proposal, userId, onVote
}: {
  proposal: ProposalRow
  userId: string
  onVote: (activityId: string, voteType: 'up' | 'down') => void
}) {
  const userVote = proposal.votes_up?.includes(userId) ? 'up'
    : proposal.votes_down?.includes(userId) ? 'down'
    : 'none'

  return (
    <div className="card">
      <div className="flex items-start gap-3">
        {/* Image */}
        {(proposal.images?.[0] || proposal.image_url) && (
          <img
            src={proposal.images?.[0] || proposal.image_url || ''}
            alt={proposal.activity_name}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{proposal.activity_name}</h4>
          {proposal.city && (
            <p className="text-xs text-dim flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {proposal.city}
              {proposal.neighborhood && ` · ${proposal.neighborhood}`}
            </p>
          )}
          {proposal.proposed_by_name && (
            <p className="text-xs text-dim mt-1">by {proposal.proposed_by_name}</p>
          )}
        </div>

        {/* Votes */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onVote(proposal.activity_id, 'up')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors ${
              userVote === 'up'
                ? 'bg-teal/20 text-teal-light'
                : 'text-dim hover:text-teal-light hover:bg-teal/10'
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{proposal.upvote_count}</span>
          </button>

          <button
            onClick={() => onVote(proposal.activity_id, 'down')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors ${
              userVote === 'down'
                ? 'bg-red-500/20 text-red-400'
                : 'text-dim hover:text-red-400 hover:bg-red-500/10'
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{proposal.downvote_count}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// MARK: - Schedule Tab

function ScheduleTab({ proposals, trip }: { proposals: ProposalRow[]; trip: Trip }) {
  const approved = proposals.filter(p => p.net_votes > 0)

  return (
    <div className="space-y-4 pb-8">
      <div className="card-raised">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-orange" />
          <h3 className="font-semibold text-sm">Itinerary Preview</h3>
        </div>
        {approved.length === 0 ? (
          <p className="text-mid text-sm">Vote on activities in the Overview tab to build your schedule.</p>
        ) : (
          <div className="space-y-3">
            {approved.map((proposal, i) => (
              <div key={proposal.activity_id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-raised flex items-center justify-center text-xs font-bold text-orange flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{proposal.activity_name}</p>
                  <p className="text-xs text-dim">{proposal.city}{proposal.neighborhood ? ` · ${proposal.neighborhood}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card text-center py-8">
        <p className="text-mid text-sm">AI itinerary generation coming soon</p>
        <p className="text-dim text-xs mt-1">Vote on activities first, then generate a day-by-day plan</p>
      </div>
    </div>
  )
}

// MARK: - Budget Tab

function BudgetTab({ trip, proposals }: { trip: Trip; proposals: ProposalRow[] }) {
  const totalBudget = trip.budget || 0
  const currency = trip.currency || 'USD'

  // Estimate costs from proposals (simplified)
  const categories = [
    { name: 'Activities', icon: <MapPin className="w-4 h-4" />, estimated: proposals.length * 45, color: 'text-orange' },
    { name: 'Food & Drink', icon: <DollarSign className="w-4 h-4" />, estimated: 0, color: 'text-gold' },
    { name: 'Transport', icon: <Plane className="w-4 h-4" />, estimated: 0, color: 'text-teal-light' },
    { name: 'Accommodation', icon: <Wallet className="w-4 h-4" />, estimated: 0, color: 'text-mid' },
  ]

  const totalEstimated = categories.reduce((sum, c) => sum + c.estimated, 0)
  const remaining = totalBudget - totalEstimated

  return (
    <div className="space-y-4 pb-8">
      {/* Budget Overview */}
      <div className="card-raised">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-gold" />
            <h3 className="font-semibold text-sm">Budget Lock</h3>
          </div>
          {totalBudget > 0 && (
            <span className="text-gold font-bold">
              {currency} {totalBudget.toLocaleString()}
            </span>
          )}
        </div>

        {totalBudget > 0 ? (
          <>
            {/* Progress bar */}
            <div className="w-full h-3 bg-raised rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all ${
                  remaining < 0 ? 'bg-red-500' : remaining < totalBudget * 0.2 ? 'bg-gold' : 'bg-teal'
                }`}
                style={{ width: `${Math.min(100, (totalEstimated / totalBudget) * 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-dim mb-4">
              <span>Estimated: {currency} {totalEstimated.toLocaleString()}</span>
              <span className={remaining < 0 ? 'text-red-400' : 'text-green-400'}>
                {remaining >= 0 ? `${currency} ${remaining.toLocaleString()} left` : `Over by ${currency} ${Math.abs(remaining).toLocaleString()}`}
              </span>
            </div>
          </>
        ) : (
          <p className="text-mid text-sm mb-4">Set a budget when creating the trip to track spending here.</p>
        )}

        {/* Categories */}
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cat.color}>{cat.icon}</span>
                <span className="text-sm">{cat.name}</span>
              </div>
              <span className="text-sm text-mid">
                {cat.estimated > 0 ? `${currency} ${cat.estimated}` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Per Person Split */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-teal-light" />
          <h3 className="font-semibold text-sm">Cost Split</h3>
        </div>
        <p className="text-mid text-sm">
          Split tracking and expense sharing coming soon. Track who owes what as you book activities.
        </p>
      </div>

      {/* Spending Insights */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-orange" />
          <h3 className="font-semibold text-sm">Spending Insights</h3>
        </div>
        <p className="text-mid text-sm">
          Insights will appear as you add activities and set costs.
        </p>
      </div>
    </div>
  )
}

// MARK: - Logistics Tab

function LogisticsTab({ trip }: { trip: Trip }) {
  return (
    <div className="space-y-4 pb-8">
      <div className="card-raised">
        <div className="flex items-center gap-2 mb-3">
          <Plane className="w-4 h-4 text-teal-light" />
          <h3 className="font-semibold text-sm">Flights</h3>
        </div>
        <p className="text-mid text-sm">Add flight details to share with your group.</p>
        <button className="btn-secondary text-sm py-2 px-4 mt-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Flight
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-orange" />
          <h3 className="font-semibold text-sm">Accommodation</h3>
        </div>
        <p className="text-mid text-sm">Share hotel, Airbnb, or hostel details with the group.</p>
        <button className="btn-secondary text-sm py-2 px-4 mt-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Stay
        </button>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-gold" />
          <h3 className="font-semibold text-sm">Local Transport</h3>
        </div>
        <p className="text-mid text-sm">Train passes, rental cars, or rideshare plans.</p>
        <button className="btn-secondary text-sm py-2 px-4 mt-3 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Transport
        </button>
      </div>
    </div>
  )
}
