// GET /api/members/[id]/qrcode
// 生成會員專屬 QR Code
import { NextRequest, NextResponse } from 'next/server'
import { connectDB, COLLECTIONS } from '@/shared/db/mongodb'
import { ObjectId } from 'mongodb'
const QRCode = require('qrcode')

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const format = searchParams.get('format') || 'base64'

    const db = await connectDB()
    const members = db.collection(COLLECTIONS.MEMBERS)

    const member = await members.findOne({ _id: new ObjectId(id) }) as any
    if (!member) {
      return NextResponse.json({ success: false, error: '會員不存在' }, { status: 404 })
    }

    const payload = JSON.stringify({
      memberId: id,
      memberNo: member.memberNo,
      phone: member.phone,
      name: member.name,
    })

    if (format === 'svg') {
      const svg = await QRCode.toString(payload, {
        errorCorrectionLevel: 'M',
        type: 'svg',
        margin: 2,
        width: 300,
        color: { dark: '#1F2937', light: '#FFFFFF' },
      })
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    const base64 = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 2,
      width: 300,
      color: { dark: '#1F2937', light: '#FFFFFF' },
    })

    return NextResponse.json({
      success: true,
      memberId: id,
      memberNo: member.memberNo,
      phone: member.phone,
      name: member.name,
      qrcode: base64,
      qrcodeSvg: null,
    })
  } catch (error: any) {
    console.error('[Member QRCode]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
