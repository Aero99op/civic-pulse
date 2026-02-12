import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function saveFile(file: File): Promise<string | null> {
    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure upload directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        return `/uploads/${filename}`
    } catch (error) {
        console.error('Error saving file:', error)
        return null
    }
}
