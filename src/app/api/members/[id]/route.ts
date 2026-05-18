// GET/PUT/DELETE /api/members/[id]
// 會員詳情查詢 / 編輯 / 刪除
import { NextRequest, NextResponse } from 'next/server'
import { connectDB, COLLECTIONS } from '@/shared/db/mongodb'
import type { Member, BalanceTransaction, PointsTransaction } from '@/shared/types/members'
import { ObjectId } from 'mongodb'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params

    const db = await connectDB()
    const members = db.collection(COLLECTIONS.MEMBERS)

    const member = await members.findOne({ _id: new ObjectId(id) }) as Member | null
    if (!member) {
      return NextResponse.json({ success: false, error: '會員不存在' }, { status: 404 })
    }

    const [balanceTxs, pointsTxs] = await Promise.all([
      db.collection(COLLECTIONS.BALANCE_TRANSACTIONS)
        .find({ memberId: id }).sort({ createdAt: -1 }).limit(20).toArray() as unknown as BalanceTransaction[],
      db.collection(COLLECTIONS.POINTS_TRANSACTIONS)
        .find({ memberId: id }).sort({ createdAt: -1 }).limit(20).toArray() as unknown as PointsTransaction[],
    ])

    return NextResponse.json({
      success: true,
      member,
      balanceTransactions: balanceTxs,
      pointsTransactions: pointsTxs,
    })
  } catch (error: any) {
    console.error('[Member GET]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const body = await req.json()

    const db = await connectDB()
    const members = db.collection(COLLECTIONS.MEMBERS)
    const balanceTxs = db.collection(COLLECTIONS.BALANCE_TRANSACTIONS)

    const existing = await members.findOne({ _id: new ObjectId(id) }) as Member | null
    if (!existing) {
      return NextResponse.json({ success: false, error: '會員不存在' }, { status: 404 })
    }

    const now = new Date()
    const updates: Record<string, any> = { updatedAt: now }

    const allowed = ['name', 'email', 'wechatOpenid', 'wechatUnionid', 'tier', 'status', 'notes']
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key]
    }

    if (body.balanceDelta !== undefined && body.balanceDelta !== 0) {
      const newBalance = existing.balance + body.balanceDelta
      if (newBalance < 0) {
        return NextResponse.json({ success: false, error: '餘額不可為負' }, { status: 400 })
      }
      updates.balance = newBalance

      await balanceTxs.insertOne({
        memberId: id,
        type: body.balanceDelta > 0 ? 'topup' : 'deduct',
        amount: Math.abs(body.balanceDelta),
        balanceBefore: existing.balance,
        balanceAfter: newBalance,
        source: 'account_admin',
        remark: body.balanceRemark || '管理員調整',
        createdAt: now,
      } as any)
    }

    await members.updateOne({ _id: new ObjectId(id) }, { $set: updates })

    const updated = await members.findOne({ _id: new ObjectId(id) }) as Member | null

    return NextResponse.json({ success: true, member: updated })
  } catch (error: any) {
    console.error('[Member PUT]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params

    const db = await connectDB()
    const members = db.collection(COLLECTIONS.MEMBERS)

    await members.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: 'inactive', updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Member DELETE]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
