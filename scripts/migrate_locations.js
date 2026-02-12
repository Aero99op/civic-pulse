const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Migrating reports to Bhubaneswar...')

    const reports = await prisma.report.findMany()
    console.log(`Found ${reports.length} reports to update.`)

    let updatedCount = 0

    for (const report of reports) {
        // Generate random coordinates around Bhubaneswar (20.2961, 85.8245)
        // Spread is roughly +/- 5km
        const newLat = 20.2961 + (Math.random() - 0.5) * 0.1
        const newLng = 85.8245 + (Math.random() - 0.5) * 0.1

        // Update address if it contains "Bangalore"
        let newAddress = report.address
        if (newAddress && newAddress.includes('Bangalore')) {
            newAddress = newAddress.replace('Bangalore', 'Bhubaneswar')
        } else if (!newAddress) {
            newAddress = 'Bhubaneswar, Odisha'
        }

        await prisma.report.update({
            where: { id: report.id },
            data: {
                latitude: newLat,
                longitude: newLng,
                address: newAddress
            }
        })
        updatedCount++
    }

    console.log(`Successfully migrated ${updatedCount} reports to Bhubaneswar.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
