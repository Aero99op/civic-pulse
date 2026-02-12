import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  // Fallback for build time or local dev without DB var
  // This prevents build failure when DATABASE_URL is missing during static generation
  try {
    return new PrismaClient()
  } catch (e) {
    console.warn("Failed to initialize PrismaClient, likely due to missing DATABASE_URL during build.")
    return new PrismaClient({ datasourceUrl: "file:./dev.db" })
  }
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
