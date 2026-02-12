'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { saveFile } from '@/lib/storage'

export async function updateReportStatus(formData: FormData) {
  try {
    const reportId = formData.get('reportId') as string
    const newStatus = formData.get('newStatus') as string
    const note = formData.get('note') as string
    const caption = formData.get('caption') as string

    // Parse location
    const latStr = formData.get('latitude') as string
    const lngStr = formData.get('longitude') as string
    const latitude = latStr ? parseFloat(latStr) : null
    const longitude = lngStr ? parseFloat(lngStr) : null

    // Handle File Uploads
    const imageFile = formData.get('image') as File | null
    const videoFile = formData.get('video') as File | null

    let imageUrl = null
    let videoUrl = null

    if (imageFile && imageFile.size > 0) {
      imageUrl = await saveFile(imageFile)
    }

    if (videoFile && videoFile.size > 0) {
      videoUrl = await saveFile(videoFile)
    }

    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: newStatus,
        updates: {
          create: {
            status: newStatus,
            note: note,
            // @ts-ignore
            caption: caption,
            imageUrl: imageUrl,
            videoUrl: videoUrl,
            latitude: latitude,
            longitude: longitude
          }
        }
      },
      include: {
        author: true,
        updates: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    // If verified, give extra karma
    if (newStatus === 'VERIFIED') {
      await prisma.user.update({
        where: { id: report.authorId },
        data: {
          walletBalance: { increment: 50 }
        }
      })

      await prisma.transaction.create({
        data: {
          userId: report.authorId,
          amount: 50,
          type: 'EARNED',
          description: `Report Verified: ${report.title}`
        }
      })
    }

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/report/${reportId}`)
    return { success: true, report }
  } catch (error) {
    console.error('Update report error:', error)
    return { error: 'Failed to update report' }
  }
}

export async function getReportDetail(id: string) {
  try {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        author: true,
        updates: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    return { report }
  } catch {
    return { error: 'Failed to fetch report' }
  }
}
