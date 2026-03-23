'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AuthProvider } from '@/lib/auth-context'
import Link from 'next/link'
import { Compass, Map, User, Loader2, Shuffle } from 'lucide-react'

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const tabs = [
    { href: '/app/discover', icon: Compass, label: 'Discover' },
    { href: '/app/blind-match', icon: Shuffle, label: 'Blind Match' },
    { href: '/app/trips', icon: Map, label: 'Trips' },
    { href: '/app/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="min-h-screen bg-bg pb-20">
      {/* Page Content */}
      <main className="max-w-lg mx-auto">
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/30">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-1 py-2 px-6 transition-colors ${
                  isActive ? 'text-orange' : 'text-dim hover:text-mid'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setAuthenticated(true)
      }
      setChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/login')
        setAuthenticated(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange animate-spin" />
      </div>
    )
  }

  if (!authenticated) return null

  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  )
}
