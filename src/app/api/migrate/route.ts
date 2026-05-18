// POST /api/migrate
// 遷移舊 POS 會員資料至 WEARMO 會員系統
import { NextRequest, NextResponse } from 'next/server'
import { connectDB, COLLECTIONS } from '@/shared/db/mongodb'

type MigrateMember = {
  memberNo?: string
  name: string
  phone: string
  email?: string
  tier?: string
  balance?: number
  points?: number
}

function genMemberNo(existingNos: string[]): string {
  const nums = existingNos
    .filter(no => no && no.startsWith('WM-'))
    .map(no => parseInt(no.replace('WM-', ''), 10))
    .filter(n => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `WM-${String(next).padStart(5, '0')}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { members }: { members: MigrateMember[] } = body

    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { success: false, error: '請提供有效的會員數據陣列' },
        { status: 400 }
      )
    }

    const db = await connectDB()
    const collection = db.collection(COLLECTIONS.MEMBERS)

    const existingMembers = await collection
      .find({}, { projection: { memberNo: 1, phone: 1 } })
      .toArray()
    const existingNos = existingMembers.map(m => m.memberNo)
    const existingPhones = new Set(existingMembers.map(m => m.phone))

    const TIER_MAP: Record<string, string> = {
      普通: 'normal', normal: 'normal',
      銀卡: 'silver', silver: 'silver',
      金卡: 'gold', gold: 'gold',
      VIP: 'vip', vip: 'vip',
    }

    const now = new Date()
    let imported = 0
    let skipped = 0
    const errors: string[] = []

    for (const item of members) {
      if (!item.phone || !item.name) {
        skipped++
        errors.push(`跳過：缺少電話或姓名`)
        continue
      }

      if (existingPhones.has(item.phone)) {
        skipped++
        continue
      }

      const memberNo = item.memberNo
        ? (existingNos.includes(item.memberNo) ? genMemberNo(existingNos) : item.memberNo)
        : genMemberNo(existingNos)

      const doc = {
        memberNo,
        name: item.name.trim(),
        phone: item.phone.trim(),
        email: item.email?.trim() || null,
        tier: (TIER_MAP[item.tier?.toLowerCase() || ''] || 'normal') as string,
        balance: item.balance ?? 0,
        points: item.points ?? 0,
        status: 'active',
        source: 'import',
        wechatOpenid: null,
        wechatUnionid: null,
        notes: `從舊POS遷移（${now.toLocaleDateString('zh-HK')}）`,
        createdAt: now,
        updatedAt: now,
      }

      try {
        await collection.insertOne(doc as any)
        existingNos.push(memberNo)
        existingPhones.add(item.phone)
        imported++
      } catch (e: any) {
        errors.push(`會員 ${item.name} 寫入失敗：${e.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        imported,
        skipped,
        total: members.length,
        errors: errors.slice(0, 10),
      },
    })
  } catch (error: any) {
    console.error('[Migrate API]', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
