'use server'

import { prisma } from '@/lib/db'
import { UserRole } from '@/lib/store'

export async function loginAsRole(role: UserRole) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        role: role
      }
    })
    
    if (!user) {
      return { error: 'No user found with this role. Please seed the database.' }
    }
    
    return { user }
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Failed to login' }
  }
}

export async function getUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    return user
  } catch {
    return null
  }
}
