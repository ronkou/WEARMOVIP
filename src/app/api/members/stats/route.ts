// GET /api/members/stats
// 會員統計數據（用於儀表板）
import { NextResponse } from 'next/server'
import { connectDB, COLLECTIONS } from '@/shared/db/mongodb'

export async function GET() {
  try {
    const db = await connectDB()
    const members = db.collection(COLLECTIONS.MEMBERS)

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalCount,
      newThisMonth,
      newThisWeek,
      activeCount,
      tierStats,
      sourceStats,
      recentMembers,
      topPointsMembers,
    ] = await Promise.all([
      members.countDocuments(),
      members.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      members.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      members.countDocuments({
        updatedAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
      }),
      members.aggregate([
        { $group: { _id: '$tier', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]).toArray(),
      members.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).toArray(),
      members
        .find({}, { projection: { name: 1, phone: 1, tier: 1, memberNo: 1, createdAt: 1, points: 1, balance: 1 } })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
      members
        .find({ status: 'active' }, { projection: { name: 1, phone: 1, tier: 1, memberNo: 1, points: 1 } })
        .sort({ points: -1 })
        .limit(5)
        .toArray(),
    ])

    const [totalPointsRes, totalBalanceRes] = await Promise.all([
      members.aggregate([{ $group: { _id: null, total: { $sum: '$points' } } }]).toArray(),
      members.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]).toArray(),
    ])

    const TIER_LABELS: Record<string, string> = {
      normal: '普通會員', silver: '銀卡會員', gold: '金卡會員', vip: 'VIP會員',
    }
    const SOURCE_LABELS: Record<string, string> = {
      pos: 'POS', wechat: '微信', website: '網站', account: '帳戶', manual: '手動',
    }

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCount,
        newThisMonth,
        newThisWeek,
        active: activeCount,
        totalPoints: totalPointsRes[0]?.total || 0,
        totalBalance: totalBalanceRes[0]?.total || 0,
        tierDistribution: tierStats.map((t: any) => ({
          tier: t._id,
          label: TIER_LABELS[t._id] || t._id,
          count: t.count,
        })),
        sourceDistribution: sourceStats.map((s: any) => ({
          source: s._id,
          label: SOURCE_LABELS[s._id] || s._id,
          count: s.count,
        })),
        recentMembers: recentMembers.map((m: any) => ({
          _id: m._id.toString(),
          name: m.name,
          phone: m.phone,
          memberNo: m.memberNo,
          tier: m.tier,
          createdAt: m.createdAt,
        })),
        topPointsMembers: topPointsMembers.map((m: any) => ({
          _id: m._id.toString(),
          name: m.name,
          phone: m.phone,
          memberNo: m.memberNo,
          tier: m.tier,
          points: m.points,
        })),
      },
    })
  } catch (error: any) {
    console.error('[Member Stats]', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
