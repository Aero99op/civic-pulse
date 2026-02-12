'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createReport(formData: FormData) {
  try {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const address = formData.get('address') as string
    const authorId = formData.get('authorId') as string
    const latitude = Number.parseFloat(formData.get('latitude') as string)
    const longitude = Number.parseFloat(formData.get('longitude') as string)

    if (!title || !description || !category || !authorId) {
      return { error: 'Missing required fields' }
    }

    const report = await prisma.report.create({
      data: {
        title,
        description,
        category,
        address,
        authorId,
        latitude: latitude || 20.2961, // Default to Bhubaneswar if missing
        longitude: longitude || 85.8245,
        status: 'SUBMITTED'
      }
    })

    // Award karma points (simplified)
    await prisma.user.update({
      where: { id: authorId },
      data: {
        walletBalance: {
          increment: 10
        }
      }
    })

    await prisma.transaction.create({
      data: {
        userId: authorId,
        amount: 10,
        type: 'EARNED',
        description: 'Report Submission Reward'
      }
    })

    revalidatePath('/dashboard')
    return { success: true, report }
  } catch (error) {
    console.error('Create report error:', error)
    return { error: 'Failed to create report' }
  }
}
