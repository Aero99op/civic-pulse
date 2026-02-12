'use server'

import { prisma } from '@/lib/db'

export async function getReports() {
  try {
    const reports = await prisma.report.findMany({
      include: {
        author: {
          select: {
            name: true,
            role: true
          }
        },
        _count: {
          select: { updates: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // JUGAAD: Runtime migration of old Bangalore data to Bhubaneswar
    const migratedReports = reports.map(report => {
      // Check if near Bangalore (Lat 12.9, Lng 77.5)
      if (Math.abs(report.latitude - 12.9716) < 1 && Math.abs(report.longitude - 77.5946) < 1) {
        // Deterministic offset based on ID to avoid hydration/HMR issues
        const seed = report.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const offsetLat = ((seed % 100) / 1000) - 0.05
        const offsetLng = (((seed * 1.5) % 100) / 1000) - 0.05

        return {
          ...report,
          latitude: 20.2961 + offsetLat, // Bhubaneswar
          longitude: 85.8245 + offsetLng,
          address: report.address?.replace('Bangalore', 'Bhubaneswar') || 'Bhubaneswar, Odisha'
        }
      }
      return report
    })

    return { reports: migratedReports }
  } catch (error) {
    console.error('Error fetching reports:', error)
    return { error: 'Failed to fetch reports' }
  }
}

export async function getStats() {
  try {
    const [total, resolved, inProgress] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: 'RESOLVED' } }),
      prisma.report.count({ where: { status: 'IN_PROGRESS' } })
    ])

    return {
      stats: {
        total,
        resolved,
        inProgress,
        pending: total - resolved - inProgress
      }
    }
  } catch {
    return { error: 'Failed to fetch stats' }
  }
}
