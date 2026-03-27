import { NextRequest, NextResponse } from 'next/server'
import { readFile, readdir } from 'fs/promises'
import path from 'path'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import sharp from 'sharp'
import { requireAdminAuth } from '@/lib/adminAuth'
import { adminBackendFetch } from '@/lib/serverBackendApi'

const ELEMENTS_SMALL_DIR = path.join(process.cwd(), 'public', 'elements small')

const FILENAME_DATE = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function buildCsv(entries: { name: string; email: string; phone: string; createdAt: Date; updatedAt: Date }[]): string {
  const headers = ['Name', 'Email', 'Phone', 'Joined', 'Updated']
  const rows = entries.map((e) => [
    escapeCsvField(e.name),
    escapeCsvField(e.email),
    escapeCsvField(e.phone),
    escapeCsvField(new Date(e.createdAt).toISOString()),
    escapeCsvField(new Date(e.updatedAt).toISOString()),
  ])
  const headerLine = headers.join(',')
  const dataLines = rows.map((row) => row.join(','))
  return [headerLine, ...dataLines].join('\r\n')
}

async function getLogoBase64(): Promise<{ data: string; format: 'PNG' | 'JPEG'; width: number; height: number } | null> {
  try {
    const files = await readdir(ELEMENTS_SMALL_DIR)
    const png = files.find((f) => f.toLowerCase().endsWith('.png'))
    const svg = files.find((f) => f.toLowerCase().endsWith('.svg'))
    const file = png ?? svg
    if (!file) return null
    const filePath = path.join(ELEMENTS_SMALL_DIR, file)
    const buffer = await readFile(filePath)
    if (file.toLowerCase().endsWith('.svg')) {
      const pngBuffer = await sharp(buffer).png().toBuffer()
      const meta = await sharp(pngBuffer).metadata()
      return {
        data: pngBuffer.toString('base64'),
        format: 'PNG',
        width: meta.width ?? 1,
        height: meta.height ?? 1,
      }
    }
    const meta = await sharp(buffer).metadata()
    return {
      data: buffer.toString('base64'),
      format: 'PNG',
      width: meta.width ?? 1,
      height: meta.height ?? 1,
    }
  } catch {
    return null
  }
}

const LANDSCAPE_A4_WIDTH_MM = 297

async function buildPdf(entries: { name: string; email: string; phone: string; createdAt: Date; updatedAt: Date }[]): Promise<Buffer> {
  const doc = new jsPDF({ orientation: 'landscape' })
  const pageWidth = LANDSCAPE_A4_WIDTH_MM
  const formatDate = (d: Date) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  let startY = 20
  const logoInfo = await getLogoBase64()
  if (logoInfo) {
    const maxLogoWidthMm = 50
    const maxLogoHeightMm = 22
    const r = logoInfo.height / logoInfo.width
    let imgW = maxLogoWidthMm
    let imgH = maxLogoWidthMm * r
    if (imgH > maxLogoHeightMm) {
      imgH = maxLogoHeightMm
      imgW = maxLogoHeightMm / r
    }
    const x = (pageWidth - imgW) / 2
    doc.addImage(logoInfo.data, logoInfo.format, x, 10, imgW, imgH)
    startY = 10 + imgH + 4
  }

  doc.setFontSize(16)
  doc.text('Ballo Ads waitlist', pageWidth / 2, startY, { align: 'center' })
  startY += 10

  const tableData = entries.length
    ? entries.map((e) => [e.name, e.email, e.phone, formatDate(e.createdAt), formatDate(e.updatedAt)])
    : [['No entries', '', '', '', '']]

  autoTable(doc, {
    head: [['Name', 'Email', 'Phone', 'Joined', 'Updated']],
    body: tableData,
    startY,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  })

  return Buffer.from(doc.output('arraybuffer'))
}

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth()
  if (authError) return authError

  const format = request.nextUrl.searchParams.get('format')?.toLowerCase()
  if (format !== 'csv' && format !== 'pdf') {
    return NextResponse.json({ error: 'Invalid format. Use format=csv or format=pdf' }, { status: 400 })
  }

  try {
    const backendRes = await adminBackendFetch('Backoffice/waitlist/export')
    const backendText = await backendRes.text()
    const rawEntries = (backendText ? JSON.parse(backendText) : []) as Array<{
      name: string
      email: string
      phone: string
      createdAt: string | Date
      updatedAt: string | Date
    }>
    const entries = rawEntries.map((item) => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }))
    if (!backendRes.ok) {
      return NextResponse.json({ error: 'Failed to export waitlist. Please try again.' }, { status: backendRes.status })
    }

    if (format === 'csv') {
      const csv = buildCsv(entries)
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="waitlist-${FILENAME_DATE}.csv"`,
        },
      })
    }

    const pdfBuffer = await buildPdf(entries)
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="waitlist-${FILENAME_DATE}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error exporting waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to export waitlist. Please try again.' },
      { status: 500 }
    )
  }
}
