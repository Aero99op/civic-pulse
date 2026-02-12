'use server'

import { prisma } from '@/lib/db'
import { useUserStore } from '@/lib/store'

export async function getHistoryReports(userId: string, role: string) {
    try {
        let whereClause: any = {}

        if (role === 'DEPARTMENT') {
            // Department sees accepted, in progress, resolved, verified tasks
            whereClause = {
                status: {
                    in: ['ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED']
                }
            }
        } else {
            // Citizen sees their own reports
            whereClause = {
                authorId: userId
            }
        }

        const reports = await prisma.report.findMany({
            where: whereClause,
            include: {
                author: {
                    select: {
                        name: true,
                        role: true
                    }
                },
                updates: {
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: { updates: true }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        })

        return { reports }
    } catch (error) {
        console.error('Error fetching history:', error)
        return { error: 'Failed to fetch history' }
    }
}
