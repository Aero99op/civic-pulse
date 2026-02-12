'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store'
import { Sidebar } from '@/components/layout/Sidebar'
import { CyberDock } from '@/components/layout/CyberDock'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useUserStore()
  // ... existing code ...

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 pointer-events-none" />

      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-xl">
        <Sidebar />
      </div>

      {/* CyberDock for Mobile Navigation & Desktop Shortcuts */}
      <CyberDock />

      {/* Main Content - Full width on mobile, pushed right on desktop */}
      <main className="md:pl-64 min-h-screen relative z-10 transition-all duration-300 pb-24 md:pb-0">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  )
}
