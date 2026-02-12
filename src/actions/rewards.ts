'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getRewards() {
  try {
    const rewards = await prisma.reward.findMany()
    return { rewards }
  } catch {
    return { error: 'Failed to fetch rewards' }
  }
}

export async function getTransactions(userId: string) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })
    return { transactions }
  } catch {
    return { error: 'Failed to fetch transactions' }
  }
}

export async function getRedemptions(userId: string) {
  try {
    const redemptions = await prisma.redemption.findMany({
      where: { userId },
      include: { reward: true },
      orderBy: { createdAt: 'desc' }
    })
    return { redemptions }
  } catch {
    return { error: 'Failed to fetch redemption history' }
  }
}

export async function redeemReward(userId: string, rewardId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const reward = await prisma.reward.findUnique({ where: { id: rewardId } })

    if (!user || !reward) {
      return { error: 'User or reward not found' }
    }

    if (user.walletBalance < reward.cost) {
      return { error: 'Insufficient balance' }
    }

    // Generate a random voucher code
    const uniqueCode = `VOUCHER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    console.log('Redeeming for user:', userId, 'Reward cost:', reward.cost, 'Current balance:', user.walletBalance)

    console.log('Redeeming for user:', userId, 'Reward cost:', reward.cost, 'Current balance:', user.walletBalance)

    // 1. Update User Balance
    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: user.walletBalance - reward.cost }
    })

    // 2. Create Redemption
    await prisma.redemption.create({
      data: {
        userId,
        rewardId,
        code: uniqueCode,
        status: 'COMPLETED',
      }
    })

    // 3. Create Transaction Record
    await prisma.transaction.create({
      data: {
        userId,
        amount: -reward.cost,
        type: 'SPENT',
        description: `Redeemed ${reward.name}`
      }
    })

    revalidatePath('/dashboard/rewards')
    // Re-fetch updated user to update client store
    const updatedUser = await prisma.user.findUnique({ where: { id: userId } })
    return { success: true, user: updatedUser, code: uniqueCode }
  } catch (error) {
    console.error('Redemption error:', error)
    return { error: `Failed to redeem: ${(error as Error).message}` }
  }
}

export async function fixSchema() {
  try {
    // Check if column exists first? No, just try adding it. SQLite ignores if exists? No.
    // Wrap in try-catch so if it exists it just errors and we ignore.
    await prisma.$executeRaw`ALTER TABLE "Redemption" ADD COLUMN "code" TEXT;`
    return { success: true }
  } catch (error) {
    console.error('Schema fix error:', error)
    return { success: false, error: (error as Error).message }
  }
}
