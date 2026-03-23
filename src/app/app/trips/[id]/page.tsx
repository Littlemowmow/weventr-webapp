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
  PieChart, Wallet, TrendingUp, ChevronLeft, ChevronRight,
  Sunrise, Sun, Sunset, Moon, Coffee, Utensils, Camera,
  Music, ShoppingBag, Receipt, CreditCard, Split, UserPlus,
  BarChart3
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

  // Calculate trip days
  const startDate = trip.start_date ? new Date(trip.start_date) : null
  const endDate = trip.end_date ? new Date(trip.end_date) : null
  const totalDays = startDate && endDate
    ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : Math.max(1, Math.ceil(approved.length / 3))

  const [selectedDay, setSelectedDay] = useState(0)

  // Distribute approved activities across days
  const activitiesPerDay = Math.max(1, Math.ceil(approved.length / totalDays))
  const daySchedules = Array.from({ length: totalDays }, (_, dayIndex) => {
    const dayActivities = approved.slice(dayIndex * activitiesPerDay, (dayIndex + 1) * activitiesPerDay)
    return dayActivities.map((activity, i) => {
      const timeSlots = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00']
      const periods: Array<{ icon: React.ReactNode; label: string; color: string }> = [
        { icon: <Sunrise className="w-3.5 h-3.5" />, label: 'Morning', color: 'text-gold' },
        { icon: <Sun className="w-3.5 h-3.5" />, label: 'Late Morning', color: 'text-orange' },
        { icon: <Coffee className="w-3.5 h-3.5" />, label: 'Afternoon', color: 'text-teal-light' },
        { icon: <Sunset className="w-3.5 h-3.5" />, label: 'Late Afternoon', color: 'text-orange-light' },
        { icon: <Moon className="w-3.5 h-3.5" />, label: 'Evening', color: 'text-mid' },
        { icon: <Music className="w-3.5 h-3.5" />, label: 'Night', color: 'text-dim' },
      ]
      return {
        ...activity,
        time: timeSlots[i % timeSlots.length],
        period: periods[i % periods.length],
      }
    })
  })

  const currentDayDate = startDate
    ? new Date(startDate.getTime() + selectedDay * 24 * 60 * 60 * 1000)
    : null

  return (
    <div className="space-y-4 pb-8">
      {/* Day Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedDay(d => Math.max(0, d - 1))}
          disabled={selectedDay === 0}
          className="p-1.5 rounded-lg bg-raised hover:bg-border transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 overflow-x-auto flex gap-2 scrollbar-hide">
          {Array.from({ length: totalDays }, (_, i) => {
            const dayDate = startDate
              ? new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
              : null
            return (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={`flex flex-col items-center min-w-[52px] py-2 px-3 rounded-xl transition-all ${
                  selectedDay === i
                    ? 'bg-orange text-white'
                    : 'bg-raised text-mid hover:bg-border'
                }`}
              >
                <span className="text-[10px] font-medium uppercase">
                  {dayDate ? dayDate.toLocaleDateString('en-US', { weekday: 'short' }) : `Day`}
                </span>
                <span className="text-lg font-bold">
                  {dayDate ? dayDate.getDate() : i + 1}
                </span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => setSelectedDay(d => Math.min(totalDays - 1, d + 1))}
          disabled={selectedDay === totalDays - 1}
          className="p-1.5 rounded-lg bg-raised hover:bg-border transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">
            Day {selectedDay + 1}
            {currentDayDate && (
              <span className="text-mid font-normal ml-2 text-sm">
                {currentDayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            )}
          </h3>
          <p className="text-xs text-dim mt-0.5">
            {daySchedules[selectedDay]?.length || 0} activities planned
          </p>
        </div>
      </div>

      {/* Timeline */}
      {daySchedules[selectedDay]?.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-border/50" />

          <div className="space-y-1">
            {daySchedules[selectedDay].map((item, i) => (
              <div key={item.activity_id} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div className="relative z-10 flex flex-col items-center flex-shrink-0">
                  <div className={`w-[46px] text-center text-[10px] font-mono mb-1 ${item.period.color}`}>
                    {item.time}
                  </div>
                  <div className={`w-3 h-3 rounded-full border-2 border-card ${
                    i === 0 ? 'bg-orange' : 'bg-raised'
                  }`} />
                </div>

                {/* Activity Card */}
                <div className="card flex-1 mb-2">
                  <div className="flex items-start gap-3">
                    {(item.images?.[0] || item.image_url) && (
                      <img
                        src={item.images?.[0] || item.image_url || ''}
                        alt={item.activity_name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={item.period.color}>{item.period.icon}</span>
                        <span className="text-xs text-dim">{item.period.label}</span>
                      </div>
                      <h4 className="font-semibold text-sm">{item.activity_name}</h4>
                      {item.city && (
                        <p className="text-xs text-dim flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {item.city}
                          {item.neighborhood && ` · ${item.neighborhood}`}
                        </p>
                      )}
                      {item.activity_description && (
                        <p className="text-xs text-mid mt-1 line-clamp-2">{item.activity_description}</p>
                      )}
                    </div>
                  </div>

                  {/* Vote indicator */}
                  <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/30">
                    <span className="text-xs text-teal-light flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {item.upvote_count} votes
                    </span>
                    <span className="text-xs text-dim">
                      Score: +{item.net_votes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-10">
          <Calendar className="w-10 h-10 text-dim mx-auto mb-3" />
          <p className="text-mid font-medium">No activities for this day</p>
          <p className="text-dim text-sm mt-1">
            Vote on activities in the Overview tab to fill your schedule
          </p>
        </div>
      )}

      {/* Summary Card */}
      {approved.length > 0 && (
        <div className="card-raised">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-teal-light" />
            Schedule Summary
          </h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-card rounded-xl py-3 px-2">
              <p className="text-xl font-bold text-orange">{totalDays}</p>
              <p className="text-[10px] text-dim uppercase tracking-wider">Days</p>
            </div>
            <div className="bg-card rounded-xl py-3 px-2">
              <p className="text-xl font-bold text-teal-light">{approved.length}</p>
              <p className="text-[10px] text-dim uppercase tracking-wider">Activities</p>
            </div>
            <div className="bg-card rounded-xl py-3 px-2">
              <p className="text-xl font-bold text-gold">
                {approved.reduce((sum, p) => {
                  const cities = new Set()
                  if (p.city) cities.add(p.city)
                  return cities.size
                }, 0) || approved.length > 0 ? [...new Set(approved.map(p => p.city).filter(Boolean))].length : 0}
              </p>
              <p className="text-[10px] text-dim uppercase tracking-wider">Locations</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// MARK: - Budget Tab

function BudgetTab({ trip, proposals }: { trip: Trip; proposals: ProposalRow[] }) {
  const totalBudget = trip.budget || 0
  const currency = trip.currency || 'USD'
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [expenses, setExpenses] = useState<Array<{
    id: string; name: string; amount: number; category: string; paidBy: string
  }>>([])

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'JPY' ? '¥' : currency + ' '

  // Estimate costs from proposals
  const activityCost = proposals.filter(p => p.net_votes > 0).length * 45
  const categories = [
    { name: 'Activities', icon: <Camera className="w-4 h-4" />, estimated: activityCost, color: 'bg-orange', textColor: 'text-orange' },
    { name: 'Food & Drink', icon: <Utensils className="w-4 h-4" />, estimated: expenses.filter(e => e.category === 'food').reduce((s, e) => s + e.amount, 0), color: 'bg-gold', textColor: 'text-gold' },
    { name: 'Transport', icon: <Plane className="w-4 h-4" />, estimated: expenses.filter(e => e.category === 'transport').reduce((s, e) => s + e.amount, 0), color: 'bg-teal', textColor: 'text-teal-light' },
    { name: 'Shopping', icon: <ShoppingBag className="w-4 h-4" />, estimated: expenses.filter(e => e.category === 'shopping').reduce((s, e) => s + e.amount, 0), color: 'bg-mid', textColor: 'text-mid' },
    { name: 'Accommodation', icon: <Wallet className="w-4 h-4" />, estimated: expenses.filter(e => e.category === 'accommodation').reduce((s, e) => s + e.amount, 0), color: 'bg-green-500', textColor: 'text-green-400' },
  ]

  const totalEstimated = categories.reduce((sum, c) => sum + c.estimated, 0)
  const remaining = totalBudget - totalEstimated
  const percentUsed = totalBudget > 0 ? Math.min(100, (totalEstimated / totalBudget) * 100) : 0

  const handleAddExpense = (name: string, amount: number, category: string) => {
    setExpenses(prev => [...prev, {
      id: Date.now().toString(),
      name,
      amount,
      category,
      paidBy: 'You',
    }])
    setShowAddExpense(false)
  }

  return (
    <div className="space-y-4 pb-8">
      {/* Budget Ring / Overview */}
      <div className="card-raised">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-gold" />
            <h3 className="font-semibold text-sm">Budget Overview</h3>
          </div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-1.5 text-xs text-orange hover:text-orange-light transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Expense
          </button>
        </div>

        {/* Visual Budget Display */}
        <div className="flex items-center gap-5 mb-5">
          {/* Circular Progress */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-raised" />
              <circle
                cx="48" cy="48" r="40" fill="none" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${percentUsed * 2.51} 251`}
                className={remaining < 0 ? 'stroke-red-500' : remaining < totalBudget * 0.2 ? 'stroke-gold' : 'stroke-teal'}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold">{Math.round(percentUsed)}%</span>
              <span className="text-[9px] text-dim">used</span>
            </div>
          </div>

          {/* Budget Numbers */}
          <div className="flex-1 space-y-2">
            {totalBudget > 0 ? (
              <>
                <div>
                  <p className="text-xs text-dim">Total Budget</p>
                  <p className="text-lg font-bold text-gold">{currencySymbol}{totalBudget.toLocaleString()}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-dim">Spent</p>
                    <p className="text-sm font-semibold">{currencySymbol}{totalEstimated.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-dim">Remaining</p>
                    <p className={`text-sm font-semibold ${remaining < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {remaining >= 0 ? `${currencySymbol}${remaining.toLocaleString()}` : `-${currencySymbol}${Math.abs(remaining).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p className="text-mid text-sm">No budget set</p>
                <p className="text-dim text-xs mt-1">Edit trip to set a budget</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown - Stacked bar */}
        {totalEstimated > 0 && (
          <div className="mb-4">
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              {categories.filter(c => c.estimated > 0).map(cat => (
                <div
                  key={cat.name}
                  className={`${cat.color} rounded-full transition-all`}
                  style={{ width: `${(cat.estimated / totalEstimated) * 100}%` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-3">
          {categories.map(cat => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${cat.color}/20 flex items-center justify-center`}>
                  <span className={cat.textColor}>{cat.icon}</span>
                </div>
                <div>
                  <span className="text-sm">{cat.name}</span>
                  {totalEstimated > 0 && cat.estimated > 0 && (
                    <p className="text-[10px] text-dim">{Math.round((cat.estimated / totalEstimated) * 100)}% of total</p>
                  )}
                </div>
              </div>
              <span className={`text-sm font-medium ${cat.estimated > 0 ? 'text-white' : 'text-dim'}`}>
                {cat.estimated > 0 ? `${currencySymbol}${cat.estimated.toLocaleString()}` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="w-4 h-4 text-orange" />
          <h3 className="font-semibold text-sm">Recent Expenses</h3>
        </div>

        {expenses.length > 0 ? (
          <div className="space-y-2">
            {expenses.slice().reverse().map(exp => (
              <div key={exp.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-raised flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-mid" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{exp.name}</p>
                    <p className="text-xs text-dim">Paid by {exp.paidBy}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{currencySymbol}{exp.amount}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Receipt className="w-8 h-8 text-dim/40 mx-auto mb-2" />
            <p className="text-mid text-sm">No expenses yet</p>
            <p className="text-dim text-xs mt-1">Track spending as you go</p>
          </div>
        )}
      </div>

      {/* Cost Split */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-teal-light" />
          <h3 className="font-semibold text-sm">Cost Split</h3>
        </div>

        <div className="space-y-3">
          {/* Per person estimate */}
          <div className="bg-raised rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-dim">Estimated Per Person</p>
              <p className="text-lg font-bold text-teal-light">
                {currencySymbol}{totalEstimated > 0 ? Math.round(totalEstimated / Math.max(1, 2)).toLocaleString() : '0'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-card border-2 border-raised flex items-center justify-center text-[10px] font-bold">
                You
              </div>
              <div className="w-8 h-8 rounded-full bg-card border-2 border-raised flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5 text-dim" />
              </div>
            </div>
          </div>

          <p className="text-dim text-xs text-center">
            Split adjustments and IOUs coming soon
          </p>
        </div>
      </div>

      {/* Spending Insights */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-orange" />
          <h3 className="font-semibold text-sm">Spending Insights</h3>
        </div>

        {totalEstimated > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-teal-light" />
              </div>
              <div className="flex-1">
                <p className="text-sm">Average per day</p>
                <p className="text-xs text-dim">
                  {currencySymbol}{Math.round(totalEstimated / Math.max(1, proposals.filter(p => p.net_votes > 0).length > 3 ? 3 : 1)).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-orange/20 flex items-center justify-center">
                <Camera className="w-4 h-4 text-orange" />
              </div>
              <div className="flex-1">
                <p className="text-sm">Top category</p>
                <p className="text-xs text-dim">Activities ({currencySymbol}{activityCost})</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-mid text-sm">
            Insights will appear as you add activities and expenses.
          </p>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          currency={currencySymbol}
          onAdd={handleAddExpense}
          onClose={() => setShowAddExpense(false)}
        />
      )}
    </div>
  )
}

function AddExpenseModal({
  currency, onAdd, onClose
}: {
  currency: string
  onAdd: (name: string, amount: number, category: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')

  const categoryOptions = [
    { value: 'food', label: 'Food & Drink', icon: <Utensils className="w-4 h-4" /> },
    { value: 'transport', label: 'Transport', icon: <Plane className="w-4 h-4" /> },
    { value: 'shopping', label: 'Shopping', icon: <ShoppingBag className="w-4 h-4" /> },
    { value: 'accommodation', label: 'Stay', icon: <Wallet className="w-4 h-4" /> },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card rounded-t-2xl p-5 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Add Expense</h3>
          <button onClick={onClose} className="text-dim hover:text-white">
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <input
          type="text"
          placeholder="What did you spend on?"
          value={name}
          onChange={e => setName(e.target.value)}
          className="input-field"
        />

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dim">{currency}</span>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="input-field pl-8"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap">
          {categoryOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setCategory(opt.value)}
              className={`chip flex items-center gap-1.5 ${
                category === opt.value ? 'chip-active' : 'chip-inactive'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            if (name && amount) onAdd(name, parseFloat(amount), category)
          }}
          disabled={!name || !amount}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add Expense
        </button>
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
