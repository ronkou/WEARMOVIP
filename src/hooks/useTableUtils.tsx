'use client'

import { useState, useMemo } from 'react'

// ==================== useSort ====================

export type SortDir = 'asc' | 'desc'

export function useSort<T>(data: T[], defaultKey?: string, defaultDir?: SortDir) {
  const [sortKey, setSortKey] = useState<string | undefined>(defaultKey)
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir || 'asc')

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sortedData = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a: any, b: any) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      let cmp = 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        cmp = aVal.localeCompare(bVal, 'zh-HK')
      } else {
        cmp = String(aVal).localeCompare(String(bVal), 'zh-HK')
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  return { sortedData, sortKey, sortDir, toggleSort }
}

// ==================== useFilter ====================

export function useFilter<T>(data: T[], searchFields: (keyof T)[]) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data
    const lower = searchTerm.trim().toLowerCase()
    return data.filter(item =>
      searchFields.some(field => {
        const val = (item as any)[field]
        return val != null && String(val).toLowerCase().includes(lower)
      })
    )
  }, [data, searchTerm, searchFields])

  return { filteredData, searchTerm, setSearchTerm }
}

// ==================== SortHeader ====================

export function SortHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onToggle,
  className,
}: {
  label: string
  sortKey: string
  activeKey?: string
  dir: SortDir
  onToggle: (key: string) => void
  className?: string
}) {
  const isActive = activeKey === sortKey
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider select-none cursor-pointer hover:bg-gray-100 ${
        className || 'text-gray-500'
      }`}
      onClick={() => onToggle(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-gray-400 text-[10px] leading-none">
          {isActive ? (dir === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </span>
    </th>
  )
}

// ==================== SearchBar ====================

export function SearchBar({
  value,
  onChange,
  placeholder = '搜索...',
  className,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={`relative ${className || ''}`}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-600"
      />
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  )
}
