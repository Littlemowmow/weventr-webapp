'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Compass, Plane, User } from 'lucide-react'
import { TripProvider, useTrip } from '@/lib/trip-context'
import { BudgetProvider } from '@/lib/budget-context'

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { activeTrip } = useTrip()

  const navItems = [
    { path: "/app/discover", label: "Discover", icon: Compass },
    { path: "/app/trips", label: activeTrip ? activeTrip.name : "Trips", icon: Plane, isContextual: true },
    { path: "/app/profile", label: "Profile", icon: User },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white pb-24">
      <main className="max-w-md mx-auto">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-zinc-950/95 border-t border-zinc-200/60 dark:border-zinc-800/50 backdrop-blur-xl shadow-2xl z-50">
        <div className="max-w-md mx-auto flex justify-around items-center h-20 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path ||
              (item.path === "/app/trips" && pathname.startsWith("/app/trips"))

            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex flex-col items-center gap-1.5 py-2 px-3 rounded-2xl transition-all relative"
              >
                {isActive && (
                  <div className="absolute inset-0 bg-orange-600/10 rounded-2xl" />
                )}
                <Icon
                  className={`w-6 h-6 transition-all relative z-10 ${
                    isActive ? 'text-orange-500' : 'text-zinc-500 dark:text-zinc-500'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-[11px] font-medium transition-all relative z-10 truncate max-w-[70px] ${
                  isActive ? 'text-orange-500' : 'text-zinc-500 dark:text-zinc-500'
                }`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TripProvider>
      <BudgetProvider>
        <AppShell>{children}</AppShell>
      </BudgetProvider>
    </TripProvider>
  )
}
