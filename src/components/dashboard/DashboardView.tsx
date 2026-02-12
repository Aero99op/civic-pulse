'use client'

import { useUserStore } from '@/lib/store'
import { ReportCard } from '@/components/ReportCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusCircle, Activity, CheckCircle, Clock, Award, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Report } from '@prisma/client'
import { motion } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'
import { getReports, getStats } from '@/actions/reports'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DashboardViewProps {
  reports: (Report & { author: { name: string | null; role: string }; _count: { updates: number } })[]
  stats: {
    total: number
    resolved: number
    inProgress: number
    pending: number
  }
}

export function DashboardView({ reports: initialReports, stats: initialStats }: DashboardViewProps) {
  const { user } = useUserStore()
  const [reports, setReports] = useState(initialReports)
  const [stats, setStats] = useState(initialStats)
  const [filter, setFilter] = useState('ALL')
  const [locationFilter, setLocationFilter] = useState('')

  useEffect(() => {
    // Poll for updates every 5 seconds
    const interval = setInterval(async () => {
      const [newReports, newStats] = await Promise.all([
        getReports(),
        getStats()
      ])

      if (newReports.reports) {
        setReports(newReports.reports)
      }
      if (newStats.stats) {
        setStats(newStats.stats)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!user) return null

  const isDepartment = user.role === 'DEPARTMENT'

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const filteredReports = reports.filter(report => {
    const statusMatch = filter === 'ALL' || report.status === filter
    const locationMatch = locationFilter === '' ||
      (report.address?.toLowerCase().includes(locationFilter.toLowerCase()) ?? false)

    return statusMatch && locationMatch
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 mb-2">
            {isDepartment ? `${user.name} Dashboard` : `Welcome back, ${user.name}`}
          </h1>
          <p className="text-muted-foreground text-lg font-light">
            {isDepartment
              ? 'Manage and resolve civic issues in your jurisdiction.'
              : 'Here\'s what\'s happening in your community.'}
          </p>
        </motion.div>
        {!isDepartment && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button asChild size="lg" className="gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
              <Link href="/dashboard/report">
                <PlusCircle size={20} />
                New Report
              </Link>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Stats Overview */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-4"
      >
        <StatsCard
          title="Total Reports"
          value={stats.total}
          icon={<Activity className="text-blue-500" />}
          gradient="from-blue-500/10 to-blue-500/5"
        />
        <StatsCard
          title="Resolved"
          value={stats.resolved}
          icon={<CheckCircle className="text-green-500" />}
          gradient="from-green-500/10 to-green-500/5"
          textColor="text-green-600 dark:text-green-400"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Clock className="text-orange-500" />}
          gradient="from-orange-500/10 to-orange-500/5"
          textColor="text-orange-600 dark:text-orange-400"
        />
        <StatsCard
          title={isDepartment ? 'Pending Action' : 'Your Impact'}
          value={isDepartment ? stats.pending : user.walletBalance}
          icon={<Award className="text-purple-500" />}
          gradient="from-purple-500/10 to-purple-500/5"
          textColor="text-purple-600 dark:text-purple-400"
          subtext={!isDepartment ? 'Tokens earned' : undefined}
        />
      </motion.div>

      {/* Notifications Area */}
      {!isDepartment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                Latest Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.slice(0, 3).map(report => (
                  <div key={report.id} className="flex flex-col gap-1 border-b border-blue-100 dark:border-blue-900/50 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-sm">{report.title}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {report._count?.updates > 0 ? 'Updated recently' : 'Submitted'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Status: <span className="font-semibold text-blue-600 dark:text-blue-400">{report.status}</span>
                    </div>
                  </div>
                ))}
                {reports.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No recent activity.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Recent Reports</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by city..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-[200px] pl-9"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Reports</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredReports.map((report, index) => (
            <ReportCard key={report.id} report={report} index={index} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: number | string
  icon: ReactNode
  gradient: string
  textColor?: string
  subtext?: string
}

function StatsCard({ title, value, icon, gradient, textColor, subtext }: StatsCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      <Card className="overflow-hidden border-none shadow-md bg-white/50 dark:bg-black/20 backdrop-blur-xl relative group hover:shadow-lg transition-all duration-300">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent className="relative z-10">
          <div className={`text-4xl font-bold ${textColor || ''}`}>{value}</div>
          {subtext && <p className="text-xs text-muted-foreground mt-1 font-medium">{subtext}</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}
