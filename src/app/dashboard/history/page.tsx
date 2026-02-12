'use client'

import { useEffect, useState } from 'react'
import { useUserStore } from '@/lib/store'
import { getHistoryReports } from '@/actions/history'
import { HistoryView } from '@/components/dashboard/HistoryView'
import { Loader2 } from 'lucide-react'

export default function HistoryPage() {
    const { user } = useUserStore()
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            if (user) {
                const { reports } = await getHistoryReports(user.id, user.role)
                if (reports) {
                    setReports(reports)
                }
                setLoading(false)
            }
        }
        loadData()
    }, [user])

    if (!user) return null

    if (loading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return <HistoryView reports={reports} />
}
