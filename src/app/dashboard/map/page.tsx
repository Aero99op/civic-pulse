'use client'

import dynamic from 'next/dynamic'
import { getReports } from '@/actions/reports'
import { useState, useEffect } from 'react'
import { Report } from '@prisma/client'

// Dynamically import the Map component to avoid SSR issues with Leaflet
const LeafletMap = dynamic(
  () => import('@/components/Map'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center text-muted-foreground">
        Loading Map...
      </div>
    )
  }
)

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([])

  useEffect(() => {
    const fetchReports = async () => {
      const { reports } = await getReports()
      if (reports) setReports(reports)
    }
    fetchReports()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Civic Map</h1>
        <p className="text-muted-foreground">
          Visualizing community issues across the region.
        </p>
      </div>

      <div className="h-[600px] w-full border rounded-lg shadow-sm">
        <LeafletMap reports={reports} />
      </div>
    </div>
  )
}
