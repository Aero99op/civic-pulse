
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const userId = 'cmldjxszh00004vvb96t9vub9'
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                walletBalance: {
                    increment: 10000
                }
            }
        })
        console.log(`Successfully added 10000 points. New balance: ${user.walletBalance}`)
    } catch (error) {
        console.error('Error updating balance:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
