import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'
import { D1Database } from '@cloudflare/workers-types'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  // Check if we are running in a Cloudflare Worker environment with D1
  if (process.env.DB) {
    const adapter = new PrismaD1(process.env.DB as unknown as D1Database)
    // @ts-ignore
    return new PrismaClient({ adapter })
  }

  // Fallback for build time or local dev without DB var
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "file:./dev.db"
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
