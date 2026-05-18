// GET /api/members/export
// 導出會員列表為 Excel
import { NextRequest, NextResponse } from 'next/server'
import { connectDB, COLLECTIONS } from '@/shared/db/mongodb'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const tier = searchParams.get('tier') || ''

    const db = await connectDB()
    const members = db.collection(COLLECTIONS.MEMBERS)

    const filter: Record<string, unknown> = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { memberNo: { $regex: search, $options: 'i' } },
      ]
    }
    if (status) filter.status = status
    if (tier) filter.tier = tier

    const rows = await members
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(10000)
      .toArray()

    const TIER_LABELS: Record<string, string> = {
      normal: '普通會員', silver: '銀卡會員', gold: '金卡會員', vip: 'VIP會員',
    }
    const STATUS_LABELS: Record<string, string> = {
      active: '正常', inactive: '停用', blacklist: '黑名單',
    }

    const data = rows.map(m => ({
      '會員編號': m.memberNo,
      '姓名': m.name,
      '電話': m.phone,
      '電郵': m.email || '',
      '等級': TIER_LABELS[m.tier] || m.tier,
      '狀態': STATUS_LABELS[m.status] || m.status,
      '積分': m.points,
      '餘額(MOP)': m.balance,
      '來源': m.source?.toUpperCase(),
      '微信OpenID': m.wechatOpenid || '',
      '入會日期': new Date(m.createdAt).toLocaleDateString('zh-HK'),
      '最後更新': new Date(m.updatedAt || m.createdAt).toLocaleDateString('zh-HK'),
      '備註': m.notes || '',
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)

    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key as keyof typeof data[0]] || '').length)) + 2,
    }))
    ws['!cols'] = colWidths

    XLSX.utils.book_append_sheet(wb, ws, '會員列表')

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })
    const filename = `會員列表_${new Date().toISOString().slice(0, 10)}.xlsx`

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (error: any) {
    console.error('[Members Export]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
