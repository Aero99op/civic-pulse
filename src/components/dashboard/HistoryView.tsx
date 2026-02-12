'use client'

import { useState } from 'react'
import { Report, User, ReportUpdate } from '@prisma/client'
import { useUserStore } from '@/lib/store'
import { updateReportStatus } from '@/actions/updateReport'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { MapPin, Calendar, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Image as ImageIcon, Video as VideoIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

interface HistoryViewProps {
    reports: (Report & {
        author: { name: string | null; role: string }
        updates: ReportUpdate[]
        _count: { updates: number }
    })[]
}

export function HistoryView({ reports: initialReports }: HistoryViewProps) {
    const { user } = useUserStore()
    const [reports, setReports] = useState(initialReports)

    if (!user) return null
    const isDepartment = user.role === 'DEPARTMENT'

    const handleStatusUpdate = async (formData: FormData) => {
        const reportId = formData.get('reportId') as string

        // Optimistic update could be done here, but sticking to server response for now
        const result = await updateReportStatus(formData)
        if (result.success && result.report) {
            // Update local state to reflect change
            setReports(prev => prev.map(r =>
                r.id === reportId
                    // @ts-ignore - updates type mismatch with prisma client generation lag
                    ? { ...r, status: result.report.status, updates: [result.report.updates[0], ...r.updates] }
                    : r
            ))
            alert('Status updated!')
        } else {
            alert('Failed to update status')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    {isDepartment ? 'Task History & Progress' : 'My Report History'}
                </h1>
                <p className="text-muted-foreground">
                    {isDepartment
                        ? 'Manage and update contents of ongoing and completed tasks.'
                        : 'Track the status and progress of your submitted reports.'}
                </p>
            </div>

            <div className="grid gap-6">
                {reports.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        No history found.
                    </Card>
                ) : (
                    reports.map((report) => (
                        <HistoryCard
                            key={report.id}
                            report={report}
                            isDepartment={isDepartment}
                            onUpdate={handleStatusUpdate}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

function HistoryCard({ report, isDepartment, onUpdate }: {
    report: HistoryViewProps['reports'][0],
    isDepartment: boolean,
    onUpdate: (formData: FormData) => void
}) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [status, setStatus] = useState(report.status)
    const [note, setNote] = useState('')
    const [caption, setCaption] = useState('')
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [inputLocation, setInputLocation] = useState({ manual: false, lat: '', lng: '' })

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by this browser.")
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
            },
            (error) => {
                console.error("Error obtaining location", error.message, error)
                let errorMessage = "Could not get location."
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location permission denied. Please allow location access in your browser settings."
                        break
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information is unavailable. Please check your device settings."
                        break
                    case error.TIMEOUT:
                        errorMessage = "The request to get user location timed out. Please try again."
                        break
                    default:
                        errorMessage = `Location error: ${error.message}`
                }
                alert(errorMessage)
            },
            {
                enableHighAccuracy: false, // Relaxed from true to avoid timeouts
                timeout: 20000, // Increased from 5000
                maximumAge: 0
            }
        )
    }

    const handleUpdate = async () => {
        if (status === report.status && !note && !imageFile && !videoFile) return

        setIsUpdating(true)
        const formData = new FormData()
        formData.append('reportId', report.id)
        formData.append('newStatus', status)
        if (note) formData.append('note', note)
        if (caption) formData.append('caption', caption)
        if (location) {
            formData.append('latitude', location.lat.toString())
            formData.append('longitude', location.lng.toString())
        } else if (inputLocation.manual && inputLocation.lat && inputLocation.lng) {
            formData.append('latitude', inputLocation.lat)
            formData.append('longitude', inputLocation.lng)
        }
        if (imageFile) formData.append('image', imageFile)
        if (videoFile) formData.append('video', videoFile)

        await onUpdate(formData)

        setIsUpdating(false)
        setNote('')
        setCaption('')
        setImageFile(null)
        setVideoFile(null)
        setLocation(null)
        setInputLocation({ manual: false, lat: '', lng: '' })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED': return 'bg-green-500/10 text-green-600 border-green-200'
            case 'VERIFIED': return 'bg-purple-500/10 text-purple-600 border-purple-200'
            case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-600 border-blue-200'
            default: return 'bg-gray-100 text-gray-600 border-gray-200'
        }
    }

    return (
        <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{report.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <CardTitle className="text-lg leading-tight">{report.title}</CardTitle>
                    </div>
                    <Badge className={getStatusColor(report.status)} variant="outline">
                        {report.status}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{report.description}</p>

                {report.address && (
                    <div className="flex items-center text-xs text-muted-foreground mb-4">
                        <MapPin size={14} className="mr-1" />
                        {report.address}
                    </div>
                )}

                <div className="flex items-center justify-between border-t pt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-xs"
                    >
                        {isExpanded ? <ChevronUp size={16} className="mr-1" /> : <ChevronDown size={16} className="mr-1" />}
                        {isExpanded ? 'Hide History' : 'View History & Updates'}
                    </Button>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 space-y-4">
                                {/* Timeline */}
                                <div className="space-y-4 relative pl-4 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                                    {report.updates.map((update) => (
                                        <div key={update.id} className="relative pb-4 last:pb-0">
                                            <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-black" />
                                            <div className="text-sm font-medium">{update.status}</div>

                                            <div className="mt-1 space-y-1">
                                                {update.note && <div className="text-sm text-muted-foreground">&quot;{update.note}&quot;</div>}

                                                {(update as any).caption && <div className="text-sm italic text-gray-600 dark:text-gray-400">{(update as any).caption}</div>}

                                                {((update as any).imageUrl || (update as any).videoUrl) && (
                                                    <div className="flex gap-2 mt-2">
                                                        {(update as any).imageUrl && (
                                                            <a href={(update as any).imageUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                                <ImageIcon size={12} /> View Photo
                                                            </a>
                                                        )}
                                                        {(update as any).videoUrl && (
                                                            <a href={(update as any).videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                                                <VideoIcon size={12} /> View Video
                                                            </a>
                                                        )}
                                                    </div>
                                                )}

                                                {(update as any).latitude && (
                                                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                        <MapPin size={10} /> Location Tagged
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-xs text-slate-400 mt-2">
                                                {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="relative">
                                        <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-black" />
                                        <div className="text-sm font-medium">Report Submitted</div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>

                                {/* Department Action Area */}
                                {isDepartment && (
                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg mt-4 space-y-3">
                                        <h4 className="text-sm font-semibold">Update Bio Data & Status</h4>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium">Status</label>
                                                    <Select value={status} onValueChange={setStatus}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ACCEPTED">Accepted</SelectItem>
                                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                                                            <SelectItem value="VERIFIED">Verified</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium">Caption</label>
                                                    <Input
                                                        placeholder="Short caption..."
                                                        value={caption}
                                                        onChange={(e) => setCaption(e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-xs font-medium">Detailed Note</label>
                                                <Textarea
                                                    placeholder="Detailed work progress note..."
                                                    value={note}
                                                    onChange={(e) => setNote(e.target.value)}
                                                    className="h-20"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium">Photo Proof</label>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                                        className="cursor-pointer file:text-blue-600 file:text-xs text-xs"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-medium">Video Proof</label>
                                                    <Input
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                                        className="cursor-pointer file:text-blue-600 file:text-xs text-xs"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            type="button"
                                                            onClick={handleGetLocation}
                                                            className="flex-1 gap-2"
                                                            disabled={!!location && !inputLocation.manual}
                                                        >
                                                            <MapPin size={14} />
                                                            {location && !inputLocation.manual ? 'Location Tagged' : 'Auto-Tag Location'}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            type="button"
                                                            onClick={() => setInputLocation({ ...inputLocation, manual: !inputLocation.manual })}
                                                            className="text-xs"
                                                        >
                                                            {inputLocation.manual ? 'Use Auto' : 'Enter Manually'}
                                                        </Button>
                                                    </div>

                                                    {inputLocation.manual && (
                                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                                            <Input
                                                                placeholder="Latitude (e.g. 12.97)"
                                                                value={inputLocation.lat}
                                                                onChange={(e) => setInputLocation({ ...inputLocation, lat: e.target.value })}
                                                                className="text-xs"
                                                            />
                                                            <Input
                                                                placeholder="Longitude (e.g. 77.59)"
                                                                value={inputLocation.lng}
                                                                onChange={(e) => setInputLocation({ ...inputLocation, lng: e.target.value })}
                                                                className="text-xs"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleUpdate}
                                            disabled={isUpdating || (status === report.status && !note && !imageFile && !videoFile)}
                                            className="w-full"
                                        >
                                            {isUpdating ? 'Uploading...' : 'Update Status & Bio Data'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}
