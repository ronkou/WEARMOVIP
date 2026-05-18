// GET/POST /api/members
// 會員列表查詢 + 新增會員
import { NextRequest, NextResponse } from 'next/server'
import { connectDB, COLLECTIONS } from '@/shared/db/mongodb'
import type { Member, MemberSource } from '@/shared/types/members'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const phone = searchParams.get('phone')
    const tier = searchParams.get('tier')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const db = await connectDB()
    const members = db.collection<Member>(COLLECTIONS.MEMBERS)

    const filter: Record<string, any> = {}
    if (phone) filter.phone = { $regex: phone }
    if (tier) filter.tier = tier
    if (status) filter.status = status

    const [data, total] = await Promise.all([
      members.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      members.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error: any) {
    console.error('[Members GET]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

function generateMemberNo(count: number): string {
  return `WM-${String(count + 1).padStart(5, '0')}`
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, wechatOpenid, source = 'manual', notes } = await req.json()

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: '姓名和電話不可為空' }, { status: 400 })
    }

    const db = await connectDB()
    const members = db.collection<Member>(COLLECTIONS.MEMBERS)

    const existing = await members.findOne({ phone: phone.trim() })
    if (existing) {
      return NextResponse.json(
        { success: false, error: '此電話號碼已存在', memberId: existing._id!.toString() },
        { status: 409 }
      )
    }

    const count = await members.countDocuments()
    const memberNo = generateMemberNo(count)
    const now = new Date()

    const newMember: Member = {
      memberNo,
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      wechatOpenid,
      source: source as MemberSource,
      tier: 'normal',
      balance: 0,
      points: 0,
      status: 'active',
      notes,
      createdAt: now,
      updatedAt: now,
    }

    const result = await members.insertOne(newMember)

    return NextResponse.json({
      success: true,
      memberId: result.insertedId.toString(),
      memberNo,
    })
  } catch (error: any) {
    console.error('[Members POST]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
