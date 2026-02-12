'use client'

import { Badge } from "./ui/badge"
import { CardContent, CardFooter, CardHeader } from "./ui/card"
import { MapPin, Calendar, MessageSquare, ArrowUp, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Report } from "@prisma/client"
import { motion } from "framer-motion"

interface ReportCardProps {
  readonly report: Report & { 
    author: { name: string | null }
    _count?: { updates: number }
  }
  index?: number
}

export function ReportCard({ report, index = 0 }: ReportCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20'
      case 'IN_PROGRESS': return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20'
      case 'VERIFIED': return 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20'
      case 'ACCEPTED': return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
      default: return 'bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED': return <CheckCircle2 size={14} className="mr-1.5" />
      case 'IN_PROGRESS': return <Clock size={14} className="mr-1.5" />
      default: return <AlertCircle size={14} className="mr-1.5" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link href={`/dashboard/report/${report.id}`} className="block h-full group">
        <div className="h-full flex flex-col relative overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-blue-500/30 dark:hover:border-blue-400/30">
          
          {/* Decorative Gradient Blob */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-500" />
          
          <CardHeader className="p-5 pb-3 relative z-10">
            <div className="flex justify-between items-start mb-3">
              <Badge variant="outline" className={`${getStatusColor(report.status)} px-2.5 py-0.5 backdrop-blur-md border`}>
                {getStatusIcon(report.status)}
                {report.status}
              </Badge>
              <span className="text-xs font-medium text-muted-foreground/80 flex items-center bg-secondary/30 px-2 py-1 rounded-full">
                <Calendar size={12} className="mr-1.5" />
                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
              </span>
            </div>
            <h3 className="font-bold text-lg leading-tight line-clamp-2 text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {report.title}
            </h3>
          </CardHeader>
          
          <CardContent className="p-5 pt-0 pb-4 flex-1 relative z-10">
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
              {report.description}
            </p>
            
            {report.address && (
              <div className="flex items-start text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <MapPin size={14} className="mr-2 mt-0.5 shrink-0 text-blue-500" />
                <span className="line-clamp-1">{report.address}</span>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="p-4 flex justify-between items-center text-xs font-medium text-muted-foreground border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30 mt-auto">
            <div className="flex items-center gap-4">
              <span className="flex items-center text-slate-700 dark:text-slate-300">
                <ArrowUp size={14} className="mr-1.5 text-green-500" />
                12
              </span>
              <span className="flex items-center text-slate-700 dark:text-slate-300">
                <MessageSquare size={14} className="mr-1.5 text-blue-500" />
                {report._count?.updates || 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-400 flex items-center justify-center text-[10px] text-white font-bold">
                {report.author.name?.[0] || 'U'}
              </span>
              <span>{report.author.name}</span>
            </div>
          </CardFooter>
        </div>
      </Link>
    </motion.div>
  )
}
