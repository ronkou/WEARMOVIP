'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Modal from '@/components/Modal'
import { apiFetch } from '@/shared/utils/api'
import type {
  Member, MemberTier, MemberStatus,
  BalanceTransaction, PointsTransaction,
  CouponInstance, Coupon,
} from '@/shared/types/members'

const TIER_LABELS: Record<MemberTier, string> = {
  normal: '普通', silver: '銀卡', gold: '金卡', vip: 'VIP',
}
const TIER_COLORS: Record<MemberTier, string> = {
  normal: 'bg-gray-100 text-gray-700',
  silver: 'bg-slate-100 text-slate-700',
  gold: 'bg-amber-100 text-amber-700',
  vip: 'bg-purple-100 text-purple-700',
}
const TIER_THRESHOLDS: Record<MemberTier, number> = {
  normal: 0, silver: 500, gold: 2000, vip: 10000,
}
const TIER_ORDER: MemberTier[] = ['normal', 'silver', 'gold', 'vip']
const STATUS_LABELS: Record<MemberStatus, string> = {
  active: '正常', inactive: '停用', blacklist: '黑名單',
}
const STATUS_COLORS: Record<MemberStatus, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  blacklist: 'bg-red-100 text-red-700',
}

type Tab = 'info' | 'points' | 'balance' | 'coupons'

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [member, setMember] = useState<Member | null>(null)
  const [balanceTxs, setBalanceTxs] = useState<BalanceTransaction[]>([])
  const [pointsTxs, setPointsTxs] = useState<PointsTransaction[]>([])
  const [coupons, setCoupons] = useState<Array<CouponInstance & { template?: Coupon }>>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [editModal, setEditModal] = useState(false)
  const [topupModal, setTopupModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', tier: 'normal' as MemberTier, status: 'active' as MemberStatus, notes: '' })
  const [topup, setTopup] = useState({ delta: '', remark: '' })
  const [issueCouponModal, setIssueCouponModal] = useState(false)
  const [couponTemplates, setCouponTemplates] = useState<Coupon[]>([])
  const [selectedCouponId, setSelectedCouponId] = useState('')
  const [issueSaving, setIssueSaving] = useState(false)
  const [qrcode, setQrcode] = useState<string | null>(null)
  const [qrcodeLoading, setQrcodeLoading] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)

  const openQrModal = async () => {
    setShowQrModal(true)
    if (qrcode) return
    setQrcodeLoading(true)
    try {
      const res = await apiFetch(`/api/members/${id}/qrcode`)
      const d = await res.json()
      if (d.success) setQrcode(d.qrcode)
    } catch (e) {
      console.error(e)
    } finally {
      setQrcodeLoading(false)
    }
  }

  const handleDownloadQr = () => {
    if (!qrcode) return
    const a = document.createElement('a')
    a.href = qrcode
    a.download = `member-${member?.memberNo}-qr.png`
    a.click()
  }

  const fetchAll = async () => {
    try {
      const [detailRes, instancesRes] = await Promise.all([
        apiFetch(`/api/members/${id}`),
        apiFetch(`/api/coupon-instances?memberId=${id}`),
      ])
      const detail = await detailRes.json()
      const instances = await instancesRes.json()

      if (detail.success) {
        setMember(detail.member)
        setBalanceTxs(detail.balanceTransactions || [])
        setPointsTxs(detail.pointsTransactions || [])
      }
      if (instances.success) {
        setCoupons(instances.instances || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    apiFetch('/api/coupons').then(r => r.json()).then(d => {
      if (d.success) setCouponTemplates(d.coupons || [])
    })
  }, [id])

  const openEdit = () => {
    if (!member) return
    setForm({ name: member.name, email: member.email || '', tier: member.tier, status: member.status, notes: member.notes || '' })
    setEditModal(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await apiFetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { await fetchAll(); setEditModal(false) }
    } finally {
      setSaving(false)
    }
  }

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault()
    const delta = parseFloat(topup.delta)
    if (isNaN(delta) || delta === 0) return
    setSaving(true)
    try {
      const res = await apiFetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balanceDelta: delta, balanceRemark: topup.remark }),
      })
      if (res.ok) {
        await fetchAll()
        setTopupModal(false)
        setTopup({ delta: '', remark: '' })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleIssueCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCouponId) return
    setIssueSaving(true)
    try {
      const res = await apiFetch('/api/coupon-instances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: id, couponId: selectedCouponId, issuedBy: 'manual' }),
      })
      if (res.ok) {
        await fetchAll()
        setIssueCouponModal(false)
        setSelectedCouponId('')
      } else {
        const d = await res.json()
        alert(d.error)
      }
    } finally {
      setIssueSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">載入中...</div>
  if (!member) return <div className="min-h-screen flex items-center justify-center text-gray-500">會員不存在</div>

  const TABS: { key: Tab; label: string }[] = [
    { key: 'info', label: '基本資料' },
    { key: 'points', label: `積分記錄 (${pointsTxs.length})` },
    { key: 'balance', label: `餘額記錄 (${balanceTxs.length})` },
    { key: 'coupons', label: `優惠券 (${coupons.length})` },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/members" className="text-sm text-gray-400 hover:text-gray-600">← 返回會員列表</Link>
            <h1 className="text-xl font-bold text-gray-900">{member.name}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS[member.tier]}`}>
              {TIER_LABELS[member.tier]}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[member.status]}`}>
              {STATUS_LABELS[member.status]}
            </span>
          </div>
          <div className="flex gap-2">
            <button onClick={openQrModal} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              QR Code
            </button>
            <button onClick={openEdit} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              編輯資料
            </button>
            <button onClick={() => setTopupModal(true)} className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">
              調整餘額
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <p className="text-xs text-amber-600 font-medium">積分餘額</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">{member.points.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-xs text-green-600 font-medium">儲值餘額</p>
              <p className="text-2xl font-bold text-green-700 mt-1">MOP${member.balance.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-xs text-blue-600 font-medium">來源</p>
              <p className="text-lg font-bold text-blue-700 mt-1">{member.source.toUpperCase()}</p>
            </div>
          </div>

          {/* 等級進度條 */}
          {(() => {
            const currentIdx = TIER_ORDER.indexOf(member.tier)
            if (currentIdx >= TIER_ORDER.length - 1) return null
            const nextTier = TIER_ORDER[currentIdx + 1]
            const nextThreshold = TIER_THRESHOLDS[nextTier]
            const range = nextThreshold - TIER_THRESHOLDS[member.tier]
            const progress = Math.min(100, Math.max(0, ((member.points - TIER_THRESHOLDS[member.tier]) / range) * 100))
            const needed = Math.max(0, nextThreshold - member.points)
            return (
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500">距離升級至 <span className="font-medium text-amber-700">{TIER_LABELS[nextTier]}</span></span>
                  <span className="text-gray-600 font-medium">還需 {needed.toLocaleString()} 積分</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-6">{member.points.toLocaleString()}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-6 text-right">{nextThreshold.toLocaleString()}</span>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div><dt className="text-gray-500">會員編號</dt><dd className="font-medium text-gray-900 mt-0.5 font-mono">{member.memberNo}</dd></div>
              <div><dt className="text-gray-500">電話</dt><dd className="font-medium text-gray-900 mt-0.5">{member.phone}</dd></div>
              <div><dt className="text-gray-500">姓名</dt><dd className="font-medium text-gray-900 mt-0.5">{member.name}</dd></div>
              <div><dt className="text-gray-500">電郵</dt><dd className="font-medium text-gray-900 mt-0.5">{member.email || '—'}</dd></div>
              <div><dt className="text-gray-500">等級</dt><dd className="font-medium text-gray-900 mt-0.5">{TIER_LABELS[member.tier]}</dd></div>
              <div><dt className="text-gray-500">狀態</dt><dd className="font-medium text-gray-900 mt-0.5">{STATUS_LABELS[member.status]}</dd></div>
              <div><dt className="text-gray-500">微信 OpenID</dt><dd className="font-medium text-gray-900 mt-0.5 font-mono text-xs">{member.wechatOpenid || '—'}</dd></div>
              <div><dt className="text-gray-500">入會日期</dt><dd className="font-medium text-gray-900 mt-0.5">{new Date(member.createdAt).toLocaleString('zh-HK')}</dd></div>
              <div className="col-span-2"><dt className="text-gray-500">備註</dt><dd className="font-medium text-gray-900 mt-0.5">{member.notes || '—'}</dd></div>
            </dl>
          </div>
        )}

        {activeTab === 'points' && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">時間</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">類型</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">積分變動</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">餘額</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">備註</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pointsTxs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">暫無記錄</td></tr>
                ) : pointsTxs.map(tx => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-500">{new Date(tx.createdAt).toLocaleString('zh-HK')}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${tx.points > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-4 py-2.5 text-right font-medium ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.points > 0 ? '+' : ''}{tx.points.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{tx.balance.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-gray-500">{tx.remark || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'balance' && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">時間</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">類型</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">金額</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">餘額</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">備註</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {balanceTxs.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400">暫無記錄</td></tr>
                ) : balanceTxs.map(tx => (
                  <tr key={tx._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-500">{new Date(tx.createdAt).toLocaleString('zh-HK')}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${tx.amount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{tx.type}</span>
                    </td>
                    <td className={`px-4 py-2.5 text-right font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}MOP${tx.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-700">MOP${tx.balanceAfter.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-gray-500">{tx.remark || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={() => setIssueCouponModal(true)}
                className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                發放優惠券
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">優惠券名稱</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">領取方式</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">領取時間</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">狀態</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">使用時間</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-400">暫無優惠券</td></tr>
                  ) : coupons.map(c => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-900">{c.couponName}</td>
                      <td className="px-4 py-2.5 text-gray-500">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${c.issuedBy === 'auto' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{c.issuedBy}</span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">{new Date(c.issuedAt).toLocaleDateString('zh-HK')}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          c.status === 'unused' ? 'bg-green-100 text-green-700' :
                          c.status === 'used' ? 'bg-gray-100 text-gray-500' :
                          'bg-red-100 text-red-700'
                        }`}>{c.status}</span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">{c.usedAt ? new Date(c.usedAt).toLocaleDateString('zh-HK') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* 編輯 Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="編輯會員資料" size="md">
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input type="text" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電郵</label>
            <input type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">等級</label>
              <select value={form.tier}
                onChange={e => setForm(f => ({ ...f, tier: e.target.value as MemberTier }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="normal">普通會員</option>
                <option value="silver">銀卡會員</option>
                <option value="gold">金卡會員</option>
                <option value="vip">VIP會員</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
              <select value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as MemberStatus }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="active">正常</option>
                <option value="inactive">停用</option>
                <option value="blacklist">黑名單</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
            <textarea value={form.notes} rows={2}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">取消</button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50">
              {saving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 調整餘額 Modal */}
      <Modal isOpen={topupModal} onClose={() => setTopupModal(false)} title="調整儲值餘額" size="sm">
        <form onSubmit={handleTopup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">變動金額（MOP）</label>
            <input type="number" step="0.01" required placeholder="正數=充值，負數=扣款"
              value={topup.delta}
              onChange={e => setTopup(t => ({ ...t, delta: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <p className="text-xs text-gray-500 mt-1">當前餘額：MOP${member.balance.toFixed(2)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
            <input type="text" value={topup.remark}
              onChange={e => setTopup(t => ({ ...t, remark: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setTopupModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">取消</button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50">
              {saving ? '處理中...' : '確認'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 發放優惠券 Modal */}
      <Modal isOpen={issueCouponModal} onClose={() => setIssueCouponModal(false)} title="發放優惠券" size="sm">
        <form onSubmit={handleIssueCoupon} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">選擇優惠券</label>
            <select required value={selectedCouponId}
              onChange={e => setSelectedCouponId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="">— 選擇優惠券模板 —</option>
              {couponTemplates.filter(c => c.status === 'active').map(c => (
                <option key={c._id} value={c._id}>{c.name}（{c.type} / MOP${c.value}）</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIssueCouponModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">取消</button>
            <button type="submit" disabled={issueSaving || !selectedCouponId}
              className="flex-1 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50">
              {issueSaving ? '發放中...' : '發放'}
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)} title="會員二維碼" size="sm">
        <div className="flex flex-col items-center gap-4 py-2">
          {qrcodeLoading ? (
            <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <span className="text-gray-400">生成中...</span>
            </div>
          ) : qrcode ? (
            <div className="flex flex-col items-center gap-3">
              <img src={qrcode} alt="會員二維碼" className="w-64 h-64 object-contain border rounded-lg" />
              <div className="text-center">
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500 font-mono">{member.memberNo}</p>
                <p className="text-xs text-gray-400">{member.phone}</p>
              </div>
              <button onClick={handleDownloadQr}
                className="w-full px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700">
                下載 PNG
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">無法生成二維碼</div>
          )}
        </div>
      </Modal>
    </div>
  )
}
