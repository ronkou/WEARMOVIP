'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DataTable from '@/components/DataTable'
import Modal from '@/components/Modal'
import { SearchBar } from '@/hooks/useTableUtils'
import { apiFetch, apiDelete } from '@/shared/utils/api'
import type { Member, MemberTier, MemberStatus } from '@/shared/types/members'

const TIER_LABELS: Record<MemberTier, string> = {
  normal: '普通',
  silver: '銀卡',
  gold: '金卡',
  vip: 'VIP',
}
const TIER_COLORS: Record<MemberTier, string> = {
  normal: 'bg-gray-100 text-gray-700',
  silver: 'bg-slate-100 text-slate-700',
  gold: 'bg-amber-100 text-amber-700',
  vip: 'bg-purple-100 text-purple-700',
}
const STATUS_LABELS: Record<MemberStatus, string> = {
  active: '正常',
  inactive: '停用',
  blacklist: '黑名單',
}
const STATUS_COLORS: Record<MemberStatus, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  blacklist: 'bg-red-100 text-red-700',
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', tier: 'normal' as MemberTier })

  const fetchMembers = async () => {
    try {
      const res = await apiFetch('/api/members')
      const data = await res.json()
      if (data.success) setMembers(data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMembers() }, [])

  const filtered = members.filter(m => {
    const q = search.trim().toLowerCase()
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.phone.includes(q) || m.memberNo.toLowerCase().includes(q)
    const matchTier = !tierFilter || m.tier === tierFilter
    const matchStatus = !statusFilter || m.status === statusFilter
    return matchSearch && matchTier && matchStatus
  })

  const columns = [
    {
      key: 'memberNo',
      label: '會員號',
      render: (m: Member) => (
        <span className="font-mono text-xs font-medium text-gray-500">{m.memberNo}</span>
      ),
    },
    { key: 'name', label: '姓名' },
    { key: 'phone', label: '電話' },
    {
      key: 'tier',
      label: '等級',
      render: (m: Member) => (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${TIER_COLORS[m.tier]}`}>
          {TIER_LABELS[m.tier]}
        </span>
      ),
    },
    {
      key: 'points',
      label: '積分',
      render: (m: Member) => <span className="font-medium">{m.points.toLocaleString()}</span>,
    },
    {
      key: 'balance',
      label: '餘額',
      render: (m: Member) => <span className="text-amber-700 font-medium">MOP${m.balance.toFixed(2)}</span>,
    },
    {
      key: 'status',
      label: '狀態',
      render: (m: Member) => (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[m.status]}`}>
          {STATUS_LABELS[m.status]}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: '入會日期',
      render: (m: Member) => new Date(m.createdAt).toLocaleDateString('zh-HK'),
    },
  ]

  const handleOpenModal = (member?: Member) => {
    if (member) {
      setEditingMember(member)
      setForm({ name: member.name, phone: member.phone, email: member.email || '', tier: member.tier })
    } else {
      setEditingMember(null)
      setForm({ name: '', phone: '', email: '', tier: 'normal' })
    }
    setIsModalOpen(true)
  }

  const handleClose = () => { setIsModalOpen(false); setEditingMember(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingMember?._id ? `/api/members/${editingMember._id}` : '/api/members'
      const method = editingMember?._id ? 'PUT' : 'POST'
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        await fetchMembers()
        handleClose()
      } else {
        const d = await res.json()
        alert(d.error || '儲存失敗')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (tierFilter) params.set('tier', tierFilter)
    if (statusFilter) params.set('status', statusFilter)
    window.open(`/api/members/export?${params.toString()}`, '_blank')
  }

  const handleDelete = async (member: Member) => {
    try {
      await apiDelete(`/api/members/${member._id}`)
      await fetchMembers()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">← 員工專區</Link>
              <h1 className="text-xl font-bold text-gray-900">會員管理</h1>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">共 {filtered.length} 位會員</p>
          </div>
          <div className="flex gap-2">
            <Link href="/members/stats"
              className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
              📊 統計儀表板
            </Link>
            <button
              onClick={handleExport}
              className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-1.5">
              📥 導出 Excel
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors">
              + 新建會員
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-lg shadow-sm border">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="搜尋姓名/電話/會員號..."
            className="w-64"
          />
          <select
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">全部等級</option>
            <option value="normal">普通</option>
            <option value="silver">銀卡</option>
            <option value="gold">金卡</option>
            <option value="vip">VIP</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">全部狀態</option>
            <option value="active">正常</option>
            <option value="inactive">停用</option>
            <option value="blacklist">黑名單</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500">載入中...</div>
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              emptyMessage="暫無會員資料"
              searchable={false}
            />
          )}
        </div>
      </main>

      {/* 新建/編輯 Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingMember ? '編輯會員' : '新建會員'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="會員姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話 *</label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="如：6823-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電郵</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="可選"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">等級</label>
            <select
              value={form.tier}
              onChange={e => setForm(f => ({ ...f, tier: e.target.value as MemberTier }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="normal">普通會員</option>
              <option value="silver">銀卡會員</option>
              <option value="gold">金卡會員</option>
              <option value="vip">VIP會員</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
