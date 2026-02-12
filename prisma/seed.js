/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const REWARDS = [
  { name: "UPI Cashout ₹50", cost: 50, type: "CASH", description: "Direct transfer to your UPI" },
  { name: "CivicPulse Hoodie", cost: 500, type: "MERCH", description: "Premium cotton hoodie" },
  { name: "Coffee Voucher", cost: 30, type: "VOUCHER", description: "Free coffee at partner cafes" },
  { name: "Metro Pass", cost: 100, type: "VOUCHER", description: "One week metro pass" },
  { name: "Tree Planting", cost: 20, type: "OTHER", description: "Plant a tree in your name" },
  // ... more items can be added, keeping it simple for now but ensuring 5 distinct ones
]

async function main() {
  console.log('Seeding database...')

  // Clean up existing data
  await prisma.transaction.deleteMany()
  await prisma.redemption.deleteMany()
  await prisma.reportUpdate.deleteMany()
  await prisma.report.deleteMany()
  await prisma.reward.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const citizen = await prisma.user.create({
    data: {
      email: 'citizen@example.com',
      name: 'John Doe',
      role: 'CITIZEN',
      walletBalance: 150
    }
  })

  await prisma.user.create({
    data: {
      email: 'dept@example.com',
      name: 'Roads Dept',
      role: 'DEPARTMENT',
      department: 'Roads'
    }
  })

  // Create Rewards (Duplicate to reach ~40)
  for (let i = 0; i < 8; i++) {
    for (const reward of REWARDS) {
      await prisma.reward.create({
        data: {
          ...reward,
          name: `${reward.name} ${i > 0 ? '#' + i : ''}`
        }
      })
    }
  }

  // Create Reports
  const categories = ["POTHOLE", "GARBAGE", "LIGHTING", "OTHER"]
  const statuses = ["SUBMITTED", "ACCEPTED", "IN_PROGRESS", "RESOLVED", "VERIFIED"]

  for (let i = 1; i <= 20; i++) {
    const status = statuses[i % statuses.length]
    await prisma.report.create({
      data: {
        title: `Issue Report #${i}`,
        description: `This is a sample description for report #${i}. Please investigate.`,
        category: categories[i % categories.length],
        latitude: 20.2961 + (Math.random() - 0.5) * 0.1, // Bhubaneswar approx
        longitude: 85.8245 + (Math.random() - 0.5) * 0.1,
        address: `Sample Address ${i}, Bhubaneswar`,
        status: status,
        authorId: citizen.id,
        createdAt: new Date(Date.now() - Math.random() * 1000000000)
      }
    })
  }

  // Add some transactions for citizen
  await prisma.transaction.create({
    data: {
      userId: citizen.id,
      amount: 100,
      type: "EARNED",
      description: "Welcome Bonus"
    }
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
