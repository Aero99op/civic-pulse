'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Map as MapIcon,
  PlusCircle,
  Award,
  LogOut,
  ClipboardList
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useUserStore()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const citizenLinks = [
    { href: '/dashboard', label: 'Feed', icon: LayoutDashboard },
    { href: '/dashboard/map', label: 'Map View', icon: MapIcon },
    { href: '/dashboard/report', label: 'New Report', icon: PlusCircle },
    { href: '/dashboard/history', label: 'History', icon: ClipboardList },
    { href: '/dashboard/rewards', label: 'Rewards', icon: Award },
  ]

  const deptLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/map', label: 'Task Map', icon: MapIcon },
    { href: '/dashboard/history', label: 'History', icon: ClipboardList },
    { href: '/dashboard/rewards', label: 'Rewards', icon: Award },
    // { href: '/dashboard/tasks', label: 'My Tasks', icon: ClipboardList },
  ]

  const links = user?.role === 'DEPARTMENT' ? deptLinks : citizenLinks

  return (
    <div className="flex h-screen flex-col justify-between border-r border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-xl w-64 fixed left-0 top-0 overflow-y-auto z-50 shadow-sm transition-all duration-300">
      <div className="px-4 py-6">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-blue-500/20 shadow-lg">
            CP
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            CivicPulse
          </span>
        </div>

        <div className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Button
                key={link.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 mb-1 transition-all duration-200",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                )}
                asChild
              >
                <Link href={link.href}>
                  <Icon size={20} className={cn(isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-500")} />
                  {link.label}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>

      <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6 px-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{user?.name}</span>
            <span className="text-xs text-muted-foreground truncate capitalize">{user?.role?.toLowerCase()}</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900/30"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
