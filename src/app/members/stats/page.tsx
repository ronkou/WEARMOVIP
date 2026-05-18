'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch } from '@/shared/utils/api'

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  normal: { bg: 'bg-gray-100', text: 'text-gray-700' },
  silver: { bg: 'bg-slate-100', text: 'text-slate-700' },
  gold: { bg: 'bg-amber-100', text: 'text-amber-700' },
  vip: { bg: 'bg-purple-100', text: 'text-purple-700' },
}
const TIER_LABELS: Record<string, string> = {
  normal: '普通會員', silver: '銀卡會員', gold: '金卡會員', vip: 'VIP會員',
}

type Stats = {
  total: number; newThisMonth: number; newThisWeek: number; active: number
  totalPoints: number; totalBalance: number
  tierDistribution: Array<{ tier: string; label: string; count: number }>
  sourceDistribution: Array<{ source: string; label: string; count: number }>
  recentMembers: Array<{ _id: string; name: string; phone: string; memberNo: string; tier: string; createdAt: string }>
  topPointsMembers: Array<{ _id: string; name: string; phone: string; memberNo: string; tier: string; points: number }>
}

export default function MemberStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/members/stats').then(r => r.json()).then(d => {
      if (d.success) setStats(d.stats)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← 員工專區</Link>
            <h1 className="text-xl font-bold text-gray-900">會員統計</h1>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-32 animate-pulse border" />
          ))}
        </div>
      </main>
    </div>
  )
  if (!stats) return <div className="min-h-screen flex items-center justify-center text-gray-500">無法載入統計數據</div>

  const kpiCards = [
    { label: '總會員數', value: stats.total.toLocaleString(), sub: `${stats.newThisMonth} 本月新增`, color: 'border-gray-300' },
    { label: '本月新增', value: stats.newThisMonth.toLocaleString(), sub: `${stats.newThisWeek} 本週新增`, color: 'border-blue-400' },
    { label: '活躍會員', value: stats.active.toLocaleString(), sub: '近90天有操作', color: 'border-green-400' },
    { label: '總積分', value: stats.totalPoints.toLocaleString(), sub: `總餘額 MOP$${stats.totalBalance.toFixed(2)}`, color: 'border-amber-400' },
  ]

  const maxTierCount = Math.max(...stats.tierDistribution.map(t => t.count), 1)
  const maxSourceCount = Math.max(...stats.sourceDistribution.map(s => s.count), 1)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/members" className="text-sm text-gray-400 hover:text-gray-600">← 會員列表</Link>
            <h1 className="text-xl font-bold text-gray-900">會員統計</h1>
          </div>
          <p className="text-sm text-gray-500">實時數據概覽</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map(card => (
            <div key={card.label} className={`bg-white rounded-xl border-l-4 shadow-sm p-5 ${card.color}`}>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">等級分佈</h2>
            <div className="space-y-3">
              {stats.tierDistribution.map(t => (
                <div key={t.tier}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[t.tier]?.bg} ${TIER_COLORS[t.tier]?.text}`}>
                      {t.label}
                    </span>
                    <span className="text-gray-600 font-medium">{t.count} 人</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${(t.count / maxTierCount) * 100}%` }} />
                  </div>
                </div>
              ))}
              {stats.tierDistribution.length === 0 && <p className="text-sm text-gray-400">暫無數據</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">來源分佈</h2>
            <div className="space-y-3">
              {stats.sourceDistribution.map(s => (
                <div key={s.source}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">{s.label}</span>
                    <span className="text-gray-600">{s.count} 人</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${(s.count / maxSourceCount) * 100}%` }} />
                  </div>
                </div>
              ))}
              {stats.sourceDistribution.length === 0 && <p className="text-sm text-gray-400">暫無數據</p>}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 最近入會 */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">最近入會</h2>
              <Link href="/members" className="text-xs text-amber-600 hover:text-amber-700">查看全部 →</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {stats.recentMembers.map(m => (
                <Link key={m._id} href={`/members/${m._id}`} className="flex items-center justify-between px-6 py-3 hover:bg-amber-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-medium text-sm">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${TIER_COLORS[m.tier]?.bg} ${TIER_COLORS[m.tier]?.text}`}>
                      {TIER_LABELS[m.tier]}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(m.createdAt).toLocaleDateString('zh-HK')}</p>
                  </div>
                </Link>
              ))}
              {stats.recentMembers.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">暫無會員</p>}
            </div>
          </div>

          {/* 積分排行榜 */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">積分排行 TOP 5</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {stats.topPointsMembers.map((m, i) => (
                <Link key={m._id} href={`/members/${m._id}`} className="flex items-center justify-between px-6 py-3 hover:bg-amber-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-amber-400 text-white' :
                      i === 1 ? 'bg-gray-300 text-gray-700' :
                      i === 2 ? 'bg-orange-300 text-orange-800' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.phone}</p>
                    </div>
                  </div>
                  <p className="text-amber-600 font-bold text-sm">{m.points.toLocaleString()} pts</p>
                </Link>
              ))}
              {stats.topPointsMembers.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">暫無數據</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
