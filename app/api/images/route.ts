import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { writeFile } from 'fs/promises'

// GET - Hämta alla bilder från en mapp
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || 'Meny-bilder'
    
    const publicPath = path.join(process.cwd(), 'public', folder)
    
    // Kontrollera om mappen finns
    try {
      await fs.access(publicPath)
    } catch {
      return NextResponse.json({ images: [] })
    }
    
    // Läs alla filer i mappen
    const files = await fs.readdir(publicPath)
    
    // Filtrera bara bildfiler
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']
    const images = files.filter(file => 
      imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
    )
    
    // Returnera bilderna med metadata
    const imageData = await Promise.all(
      images.map(async (image) => {
        const imagePath = path.join(publicPath, image)
        const stats = await fs.stat(imagePath)
        
        return {
          name: image,
          path: `/${folder}/${image}`,
          size: Math.round(stats.size / 1024), // KB
          modified: stats.mtime
        }
      })
    )
    
    return NextResponse.json({ 
      images: imageData.sort((a, b) => a.name.localeCompare(b.name))
    })
    
  } catch (error) {
    console.error('Error reading images:', error)
    return NextResponse.json({ error: 'Kunde inte läsa bilder' }, { status: 500 })
  }
}

// POST - Ladda upp en ny bild
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'Meny-bilder'
    
    if (!file) {
      return NextResponse.json({ error: 'Ingen fil vald' }, { status: 400 })
    }
    
    // Validera filtyp
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Ogiltigt filformat. Tillåtna format: JPG, PNG, WebP, SVG' 
      }, { status: 400 })
    }
    
    // Validera filstorlek (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'Filen är för stor. Max storlek: 5MB' 
      }, { status: 400 })
    }
    
    // Skapa säkert filnamn
    const fileName = file.name.replace(/[^a-zA-Z0-9.-_åäöÅÄÖ ]/g, '')
    const publicPath = path.join(process.cwd(), 'public', folder)
    const filePath = path.join(publicPath, fileName)
    
    // Kontrollera om mappen finns, skapa den annars
    try {
      await fs.access(publicPath)
    } catch {
      await fs.mkdir(publicPath, { recursive: true })
    }
    
    // Kontrollera om filen redan finns
    try {
      await fs.access(filePath)
      return NextResponse.json({ 
        error: 'En fil med detta namn finns redan' 
      }, { status: 400 })
    } catch {
      // Filen finns inte, fortsätt
    }
    
    // Konvertera fil till buffer och spara
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)
    
    return NextResponse.json({ 
      message: 'Bild uppladdad!',
      image: {
        name: fileName,
        path: `/${folder}/${fileName}`,
        size: Math.round(file.size / 1024)
      }
    })
    
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Kunde inte ladda upp bild' }, { status: 500 })
  }
}

// DELETE - Ta bort en bild
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imagePath = searchParams.get('path')
    
    if (!imagePath) {
      return NextResponse.json({ error: 'Ingen bildsökväg angiven' }, { status: 400 })
    }
    
    const fullPath = path.join(process.cwd(), 'public', imagePath)
    
    // Kontrollera att filen finns
    try {
      await fs.access(fullPath)
    } catch {
      return NextResponse.json({ error: 'Bilden finns inte' }, { status: 404 })
    }
    
    // Ta bort filen
    await fs.unlink(fullPath)
    
    return NextResponse.json({ message: 'Bild borttagen!' })
    
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json({ error: 'Kunde inte ta bort bild' }, { status: 500 })
  }
} 