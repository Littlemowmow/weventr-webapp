'use client'

import { ArrowLeft, Users, Bookmark, MapPin, DollarSign, Calendar, Vote, ChevronRight, Clock, TrendingUp, TrendingDown, Check, Lightbulb } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useTrip, type Trip } from "@/lib/trip-context"
import { useBudget } from "@/lib/budget-context"
import { useState, useEffect } from "react"

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { trips, activeTrip, setActiveTrip } = useTrip()
  const [activeTab, setActiveTab] = useState<"schedule" | "budget" | "votes">("schedule")

  const trip = trips.find(t => t.id === Number(id))

  useEffect(() => {
    if (trip && (!activeTrip || activeTrip.id !== trip.id)) {
      setActiveTrip(trip)
    }
  }, [trip, activeTrip, setActiveTrip])

  if (!trip) {
    return (
      <div className="px-5 py-4 max-w-md mx-auto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤔</div>
          <h2 className="text-xl mb-2 font-semibold text-zinc-900 dark:text-white">Trip Not Found</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-[15px] mb-6">This trip doesn&apos;t exist</p>
          <Link href="/app/trips" className="inline-block bg-orange-600 hover:bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold transition-all">Back to Trips</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600 px-5 pt-4 pb-6">
        <div className="flex items-center gap-3 mb-6 pt-1">
          <button onClick={() => { setActiveTrip(null); router.push("/app/trips") }} className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-md">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-[24px] tracking-tight text-white font-semibold">{trip.name}</h1>
        </div>
        <div className="mb-4">
          <p className="text-orange-50 text-[15px] font-medium mb-1">{trip.dates} · {trip.duration}</p>
          <span className="bg-white text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-lg inline-block">{trip.status.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl border border-white/30">
            <Users className="w-4 h-4 text-white" strokeWidth={2} />
            <span className="text-sm font-medium text-white">{trip.members}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl border border-white/30">
            <MapPin className="w-4 h-4 text-white" strokeWidth={2} />
            <span className="text-sm font-medium text-white">{trip.cityCount} cities</span>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl border border-white/30">
            <Bookmark className="w-4 h-4 text-white" strokeWidth={2} />
            <span className="text-sm font-medium text-white">{trip.saved}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {trip.memberInitials.map((initial, index) => (
              <div key={index} className={`w-10 h-10 rounded-full ${trip.memberColors[index]} flex items-center justify-center text-white text-sm font-bold border-[3px] border-white/50 shadow-md`}>{initial}</div>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-xl border border-white/30">
            <span className="text-xs text-white/80 font-medium">Code:</span>
            <span className="text-sm text-white font-bold tracking-wide">{trip.code}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-zinc-50 dark:bg-black px-5 pt-4 pb-3 border-b border-zinc-200/60 dark:border-zinc-800/50">
        <div className="flex gap-2 bg-white dark:bg-zinc-900 rounded-2xl p-1 shadow-sm dark:shadow-none border border-zinc-200 dark:border-transparent">
          {([["schedule", Calendar, "Schedule"], ["budget", DollarSign, "Budget"], ["votes", Vote, "Votes"]] as const).map(([key, Icon, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[15px] font-semibold transition-all ${activeTab === key ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === "schedule" && <ScheduleTab trip={trip} />}
        {activeTab === "budget" && <BudgetTab />}
        {activeTab === "votes" && <VotesTab />}
      </div>
    </div>
  )
}

function ScheduleTab({ trip }: { trip: Trip }) {
  const [selectedCity, setSelectedCity] = useState(0)
  const [selectedDay, setSelectedDay] = useState(0)

  const currentCity = trip.cities[selectedCity]
  const currentActivities = currentCity?.activities[selectedDay] || []

  return (
    <div className="px-5 py-4 max-w-md mx-auto pb-24">
      {/* City Pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {trip.cities.map((city, index) => (
          <div key={city.name} className="flex items-center gap-2">
            <button onClick={() => { setSelectedCity(index); setSelectedDay(0) }} className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all ${index === selectedCity ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm dark:shadow-none border border-zinc-200/50 dark:border-transparent"}`}>
              <span className="text-lg">{city.flag}</span>
              <span className="text-[15px] font-medium">{city.name}</span>
              <span className="text-xs opacity-60 font-medium">({city.days}d)</span>
            </button>
            {index < trip.cities.length - 1 && <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* Day Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {Array.from({ length: currentCity?.days || 0 }, (_, i) => (
          <button key={i} onClick={() => setSelectedDay(i)} className={`px-5 py-3.5 rounded-2xl whitespace-nowrap transition-all ${i === selectedDay ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm dark:shadow-none border border-zinc-200/50 dark:border-transparent"}`}>
            <div className="text-sm font-semibold mb-0.5">Day {i + 1}</div>
            <div className="text-xs opacity-70 font-medium">{trip.days[i]?.date || ''}</div>
          </button>
        ))}
      </div>

      {/* Date Header */}
      <div className="mb-5">
        <h2 className="text-[24px] mb-1.5 font-semibold tracking-tight text-zinc-900 dark:text-white">
          {selectedDay === 0 ? "Arrival Day" : `Day ${selectedDay + 1}`}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-[15px] font-medium">{currentCity?.name}</p>
      </div>

      {/* Activities */}
      <div className="space-y-4 relative">
        <div className="absolute left-[26px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-zinc-200 dark:from-zinc-800 via-zinc-200 dark:via-zinc-800 to-transparent" />
        {currentActivities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="relative">
              <div className="absolute left-0 top-7 w-[52px] flex justify-center z-10">
                <div className={`w-3 h-3 rounded-full ${activity.dotColor} border-[3px] border-zinc-50 dark:border-black shadow-lg`} />
              </div>
              <div className="ml-[52px] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-[20px] p-5 shadow-md hover:shadow-lg transition-shadow border border-zinc-200/50 dark:border-zinc-800">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${activity.iconBg} flex items-center justify-center flex-shrink-0 border border-zinc-100/50 dark:border-zinc-800`}>
                    <Icon className={`w-6 h-6 ${activity.iconColor}`} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-[16px] text-zinc-900 dark:text-zinc-100 leading-tight">{activity.title}</h3>
                      {activity.price && <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex-shrink-0">{activity.price}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-medium">{activity.time}</span>
                      </div>
                      {activity.duration && (
                        <>
                          <span className="text-zinc-300 dark:text-zinc-600">•</span>
                          <span className="font-medium">{activity.duration}</span>
                        </>
                      )}
                      {activity.badge && (
                        <span className={`${activity.badgeColor} text-white px-2.5 py-1 rounded-md text-xs font-bold tracking-wide shadow-sm`}>{activity.badge}</span>
                      )}
                    </div>
                    {activity.subtitle && <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{activity.subtitle}</p>}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button className="w-full mt-5 py-4 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl text-[15px] font-semibold transition-all border-2 border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
        + Add Activity
      </button>
    </div>
  )
}

function BudgetTab() {
  const { budgetData } = useBudget()
  const [selectedCity, setSelectedCity] = useState("All")

  const percentSpent = Math.round((budgetData.spent / budgetData.total) * 100)
  const remaining = budgetData.total - budgetData.spent
  const isOverBudget = percentSpent > 100

  const filteredTransactions = selectedCity === "All"
    ? budgetData.transactions
    : budgetData.transactions.filter(t => t.city === selectedCity)

  return (
    <div className="px-5 py-4 max-w-md mx-auto pb-24">
      {/* City Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        <button onClick={() => setSelectedCity("All")} className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all ${selectedCity === "All" ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm dark:shadow-none border border-zinc-200/50 dark:border-transparent"}`}>
          <span className="text-lg">🌍</span>
          <span className="text-[15px] font-medium">All</span>
        </button>
        {budgetData.destinations.map((dest) => (
          <button key={dest.city} onClick={() => setSelectedCity(dest.city)} className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap transition-all ${selectedCity === dest.city ? "bg-zinc-900 dark:bg-white text-white dark:text-black shadow-md" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-sm dark:shadow-none border border-zinc-200/50 dark:border-transparent"}`}>
            <span className="text-lg">{dest.flag}</span>
            <span className="text-[15px] font-medium">{dest.city}</span>
          </button>
        ))}
      </div>

      {/* Total Trip Card */}
      <div className="bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-white rounded-[28px] p-8 mb-5 shadow-lg border border-zinc-200/50 dark:border-zinc-800">
        <div className="text-center mb-6">
          <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-3 tracking-widest font-bold">TOTAL TRIP</div>
          <div className="text-6xl mb-3 font-bold bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">${budgetData.spent.toLocaleString()}</div>
          <div className="text-[15px] text-zinc-500 dark:text-zinc-400 font-medium">${remaining.toLocaleString()} remaining of ${budgetData.total.toLocaleString()}</div>
        </div>
        <div className="mb-3">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
            <div className={`h-full rounded-full transition-all ${isOverBudget ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-teal-500 to-teal-600"}`} style={{ width: `${Math.min(percentSpent, 100)}%` }} />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2">
          {isOverBudget ? <TrendingUp className="w-4 h-4 text-red-600 dark:text-red-400" /> : <TrendingDown className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
          <span className={`text-sm font-bold ${isOverBudget ? "text-red-600 dark:text-red-400" : "text-teal-600 dark:text-teal-400"}`}>{percentSpent}% spent</span>
        </div>
      </div>

      {/* By Destination */}
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold mb-3 text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">By Destination</h3>
        <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-[24px] p-5 shadow-lg border border-zinc-200/50 dark:border-zinc-800">
          <div className="space-y-5">
            {budgetData.destinations.map((dest) => {
              const percent = Math.round((dest.spent / dest.budget) * 100)
              return (
                <div key={dest.city}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{dest.flag}</span>
                      <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{dest.city}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">${dest.spent}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">of ${dest.budget}</div>
                    </div>
                  </div>
                  <div className="h-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200/30 dark:border-transparent">
                    <div className="h-full bg-orange-500 rounded-full transition-all shadow-sm" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* By Category */}
      <div className="mb-6">
        <h3 className="text-[15px] font-semibold mb-3 text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">By Category</h3>
        <div className="space-y-3">
          {budgetData.categories.map((cat) => {
            const percent = Math.round((cat.spent / cat.budget) * 100)
            return (
              <div key={cat.category} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-[20px] p-5 shadow-lg border border-zinc-200/50 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center text-xl border border-zinc-100 dark:border-zinc-800`}>{cat.emoji}</div>
                    <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">${cat.spent}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">of ${cat.budget}</div>
                  </div>
                </div>
                <div className="h-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200/30 dark:border-transparent">
                  <div className={`h-full ${cat.barColor} rounded-full transition-all shadow-sm`} style={{ width: `${percent}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-[15px] font-semibold mb-3 text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Recent Transactions</h3>
        <div className="space-y-2">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-[20px] p-4 shadow-md hover:shadow-lg transition-shadow border border-zinc-200/50 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${transaction.iconBg} flex items-center justify-center text-2xl border border-zinc-100 dark:border-zinc-800 flex-shrink-0`}>{transaction.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-[15px] text-zinc-900 dark:text-zinc-100 truncate">{transaction.title}</h4>
                    <span className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100 flex-shrink-0">€{transaction.amount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
                    <span className="font-medium">{transaction.paidBy}</span>
                    <span>•</span>
                    <span>{transaction.date}</span>
                    <span>•</span>
                    <span>{transaction.city}</span>
                  </div>
                  {transaction.splitWith && transaction.splitWith.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">Split:</span>
                      {transaction.splitWith.map((person, idx) => (
                        <div key={idx} className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold" title={person}>{person.charAt(0)}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const members = [
  { name: "Hadi", initial: "H", status: "Voted", color: "bg-gradient-to-br from-orange-500 to-orange-600", isYou: true },
  { name: "Sara", initial: "S", status: "Voted", color: "bg-gradient-to-br from-teal-500 to-teal-600", isYou: false },
  { name: "Zayd", initial: "Z", status: "Waiting", color: "bg-gradient-to-br from-pink-500 to-pink-600", isYou: false },
  { name: "Alex", initial: "A", status: "Waiting", color: "bg-gradient-to-br from-blue-500 to-blue-600", isYou: false },
]

function VotesTab() {
  const votedCount = members.filter(m => m.status === "Voted").length
  const waitingCount = members.filter(m => m.status === "Waiting").length

  return (
    <div className="px-5 py-4 max-w-md mx-auto">
      {/* Icon */}
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950 dark:to-purple-900 rounded-[28px] flex items-center justify-center border-2 border-purple-200 dark:border-purple-800/50 shadow-xl shadow-purple-200/50 dark:shadow-purple-900/50">
          <svg className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-[26px] mb-3 font-semibold tracking-tight leading-tight text-zinc-900 dark:text-white">Votes hidden until<br />everyone&apos;s in.</h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-[15px] font-medium">No awkward &quot;who&apos;s actually coming?&quot; energy.</p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">{votedCount} of {members.length} voted</span>
          <span className="text-teal-600 dark:text-teal-400 font-semibold">{Math.round((votedCount / members.length) * 100)}%</span>
        </div>
        <div className="h-2.5 bg-zinc-200 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-300/50 dark:border-zinc-800">
          <div className="h-full bg-gradient-to-r from-teal-600 to-teal-500 transition-all duration-500 shadow-lg shadow-teal-500/50" style={{ width: `${(votedCount / members.length) * 100}%` }} />
        </div>
      </div>

      {/* Members Card */}
      <div className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white rounded-[28px] p-6 mb-5 shadow-lg border border-zinc-200/50 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="text-[11px] text-zinc-500 dark:text-zinc-500 tracking-widest font-bold">BARCELONA · 4 INVITED</div>
          <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 px-3 py-1.5 rounded-lg border border-teal-100/80 dark:border-transparent">
            <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" strokeWidth={3} />
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{votedCount} VOTED</span>
          </div>
        </div>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl ${member.color} flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-zinc-950`}>
                  <span className="text-lg font-bold">{member.initial}</span>
                </div>
                <div className="font-semibold text-[15px] text-zinc-900 dark:text-zinc-100">
                  {member.name} {member.isYou && <span className="text-zinc-500 dark:text-zinc-500 font-normal">(You)</span>}
                </div>
              </div>
              {member.status === "Voted" ? (
                <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 px-3 py-2 rounded-xl border border-teal-100/80 dark:border-teal-800/50">
                  <Check className="w-4 h-4 text-teal-600 dark:text-teal-400" strokeWidth={2.5} />
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 tracking-wide">VOTED</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
                  <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 tracking-wide">WAITING</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {waitingCount > 0 && (
        <button className="w-full bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/30 dark:to-yellow-950/30 border-2 border-yellow-200 dark:border-yellow-700/50 rounded-[20px] p-5 flex items-center gap-3 hover:from-yellow-100 hover:to-yellow-50 dark:hover:from-yellow-900/40 dark:hover:to-yellow-950/40 transition-all shadow-sm dark:shadow-none">
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center flex-shrink-0 border border-yellow-200 dark:border-yellow-700/50">
            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-500" fill="currentColor" />
          </div>
          <div className="text-left flex-1">
            <div className="text-yellow-700 dark:text-yellow-500 text-sm font-semibold">{waitingCount} more vote{waitingCount !== 1 ? 's' : ''} needed</div>
            <div className="text-yellow-600 dark:text-yellow-600/80 text-xs font-medium">Send a friendly reminder</div>
          </div>
          <div className="text-yellow-600 dark:text-yellow-500 font-bold">→</div>
        </button>
      )}

      <div className="mt-8 p-5 bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-[20px] shadow-sm dark:shadow-none">
        <h4 className="text-sm font-semibold mb-2 text-zinc-700 dark:text-zinc-300">How it works</h4>
        <p className="text-sm text-zinc-600 dark:text-zinc-500 leading-relaxed">Everyone votes on dates privately. Results reveal only when all members submit their availability—ensuring genuine input without peer pressure.</p>
      </div>
    </div>
  )
}
