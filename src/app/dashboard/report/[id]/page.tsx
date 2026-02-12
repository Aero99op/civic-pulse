'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getReportDetail, updateReportStatus } from '@/actions/updateReport'
import { useUserStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ArrowLeft, MapPin, Calendar, User as UserIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Report, User, ReportUpdate } from '@prisma/client'

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUserStore()
  const [report, setReport] = useState<Report & { author: User; updates: ReportUpdate[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [note, setNote] = useState('')

  const id = params.id as string

  useEffect(() => {
    const fetchReport = async () => {
      const { report } = await getReportDetail(id)
      if (report) {
        setReport(report)
        setNewStatus(report.status)
      }
      setLoading(false)
    }
    fetchReport()
  }, [id])

  const handleUpdateStatus = async () => {
    if (!report || !newStatus || newStatus === report.status) return

    setUpdating(true)
    try {
      const formData = new FormData()
      formData.append('reportId', id)
      formData.append('newStatus', newStatus)
      if (note) formData.append('note', note)

      const result = await updateReportStatus(formData)
      if (result.success && result.report) {
        // @ts-ignore
        setReport(result.report)
        setNote('')
        alert('Status updated successfully!')
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error(error)
      alert('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
  if (!report) return <div>Report not found</div>

  const isDepartment = user?.role === 'DEPARTMENT'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2 pl-0">
        <ArrowLeft size={16} /> Back
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2">{report.category}</Badge>
                  <CardTitle className="text-2xl">{report.title}</CardTitle>
                </div>
                <Badge className="text-sm px-3 py-1">{report.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                <p>{report.description}</p>
              </div>

              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  {report.address || 'No address provided'}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-1">
                  <UserIcon size={16} />
                  {report.author.name}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.updates.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No updates yet.</p>
                ) : (
                  report.updates.map((update: ReportUpdate) => (
                    <div key={update.id} className="border-l-2 border-primary pl-4 py-1">
                      <p className="font-medium text-sm">Status changed to {update.status}</p>
                      {update.note && <p className="text-sm text-muted-foreground mt-1">{update.note}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {isDepartment ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUBMITTED">Submitted</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note" className="text-sm font-medium">Note (Optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Add a note about this update..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleUpdateStatus}
                  disabled={updating || newStatus === report.status}
                >
                  {updating ? <Loader2 className="animate-spin mr-2" /> : null}
                  Update Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  You can track the progress of your report here. Once resolved, you may be asked to verify the fix.
                </p>
                {report.status === 'RESOLVED' && (
                  <Button
                    className="w-full"
                    variant="outline"
                    disabled={updating}
                    onClick={() => {
                      const formData = new FormData()
                      formData.append('reportId', id)
                      formData.append('newStatus', 'VERIFIED')
                      formData.append('note', 'Verified by citizen')

                      setUpdating(true)
                      updateReportStatus(formData)
                        .then(result => {
                          if (result.success && result.report) {
                            // @ts-ignore
                            setReport(result.report)
                            alert('Verified successfully!')
                          } else {
                            alert(result.error)
                          }
                        })
                        .catch(() => alert('Failed to verify'))
                        .finally(() => setUpdating(false))
                    }}
                  >
                    {updating ? <Loader2 className="animate-spin mr-2" /> : null}
                    Verify Fix
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
