'use client'

import { useState } from 'react'
import { useSort, useFilter, SortHeader, SearchBar } from '@/hooks/useTableUtils'
import type { SortDir } from '@/hooks/useTableUtils'

type Column<T> = {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  sortKey?: string
  sortable?: boolean
}

type Props<T> = {
  columns: Column<T>[]
  data: T[]
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  emptyMessage?: string
  sortable?: boolean
  defaultSortKey?: string
  searchable?: boolean
  searchFields?: string[]
  searchPlaceholder?: string
  searchClassName?: string
}

export default function DataTable<T extends { _id?: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  emptyMessage = '暫無數據',
  sortable: enableSort = true,
  defaultSortKey,
  searchable = false,
  searchFields,
  searchPlaceholder = '搜索...',
  searchClassName,
}: Props<T>) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { filteredData, searchTerm, setSearchTerm } = useFilter(
    data,
    (searchFields || (searchable ? columns.map(c => c.key) : [])) as any,
  )

  const { sortedData, sortKey, sortDir, toggleSort } = useSort(
    filteredData,
    defaultSortKey,
  )

  const displayData = enableSort ? sortedData : filteredData

  const handleDelete = async (item: T) => {
    if (!item._id) return
    if (confirm('確認刪除？')) {
      setDeletingId(item._id)
      await onDelete(item)
      setDeletingId(null)
    }
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div>
      {searchable && (
        <div className="mb-3">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={searchPlaceholder}
            className={searchClassName || 'max-w-xs'}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => {
                const colSortable = enableSort && col.sortable !== false
                const colSortKey = col.sortKey || col.key
                return colSortable ? (
                  <SortHeader
                    key={col.key}
                    label={col.label}
                    sortKey={colSortKey}
                    activeKey={sortKey}
                    dir={sortDir as SortDir}
                    onToggle={toggleSort}
                  />
                ) : (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                )
              })}
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                  無匹配結果
                </td>
              </tr>
            ) : (
              displayData.map((item) => (
                <tr key={item._id || JSON.stringify(item)} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right text-sm space-x-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-amber-700 hover:text-blue-800 font-medium"
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item._id}
                      className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                    >
                      {deletingId === item._id ? '刪除中...' : '刪除'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
