import { getReports, getStats } from '@/actions/reports'
import { DashboardView } from '@/components/dashboard/DashboardView'

export default async function DashboardPage() {
  const [reportsData, statsData] = await Promise.all([
    getReports(),
    getStats()
  ])

  if (reportsData.error || statsData.error) {
    return <div>Failed to load dashboard data</div>
  }

  return (
    <DashboardView 
      reports={reportsData.reports || []}
      stats={statsData.stats || { total: 0, resolved: 0, inProgress: 0, pending: 0 }}
    />
  )
}
