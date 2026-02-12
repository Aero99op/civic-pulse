'use server'

import { prisma } from '@/lib/db'

export async function getUser(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })
        return user
    } catch (error) {
        console.error('Failed to fetch user:', error)
        return null
    }
}

export async function addPoints(userId: string, amount: number) {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                walletBalance: { increment: amount }
            }
        })
        return { success: true, newBalance: user.walletBalance }
    } catch (error) {
        console.error('Failed to add points:', error)
        return { success: false, error: (error as Error).message }
    }
}
