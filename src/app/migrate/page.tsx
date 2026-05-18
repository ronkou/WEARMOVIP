'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, CheckCircle, AlertCircle, Shield } from 'lucide-react'

const STAFF_PASSWORD = 'WEAR2026vip'

type ImportResult = {
  imported: number
  skipped: number
  total: number
  errors: string[]
}

export default function MigratePage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload')
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // 密碼驗證
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === STAFF_PASSWORD) {
      setAuthenticated(true)
    } else {
      setError('密碼錯誤')
      setPassword('')
    }
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setLoading(true)

    try {
      const { default: XLSX } = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf)
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })

      if (raw.length === 0) {
        setError('檔案中沒有找到數據')
        return
      }

      const hdrs = Object.keys(raw[0])
      setHeaders(hdrs)
      setRows(raw)
      setStep('preview')
    } catch (err: any) {
      setError(`讀取失敗：${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (rows.length === 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: rows }),
      })
      const d = await res.json()
      if (d.success) {
        setResult(d.result)
        setStep('result')
      } else {
        setError(d.error || '導入失敗')
      }
    } catch (err: any) {
      setError(`導入失敗：${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 未認證畫面
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-gray-950 flex items-center justify-center p-4">
        <div className="fixed inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative w-full max-w-sm">
          <Link href="/" className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            返回首頁
          </Link>

          <div className="bg-white rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-8 py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="text-xl font-bold text-white">舊POS資料遷移</h1>
              <p className="text-purple-200 text-sm mt-1">請輸入員工密碼以繼續</p>
            </div>

            <div className="px-8 py-8">
              <form onSubmit={handleAuth} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">員工密碼</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    placeholder="請輸入密碼"
                    className={`w-full px-4 py-3 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                    autoFocus
                  />
                  {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                </div>
                <button
                  type="submit"
                  disabled={!password.trim()}
                  className="w-full py-3 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  驗證身份
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 主體
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white py-6 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">舊POS資料遷移</h1>
              <p className="text-purple-200 text-sm mt-0.5">從金山文檔或 Excel 導入舊會員資料</p>
            </div>
          </div>
          <Link href="/" className="text-sm text-purple-200 hover:text-white transition-colors">
            ← 返回首頁
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* 說明卡片 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm">ℹ️</span>
            </div>
            <div>
              <p className="font-semibold text-blue-900 mb-2">遷移說明</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 支援 <strong>.xlsx / .csv</strong> 格式</li>
                <li>• <strong>必填欄位</strong>：姓名（name）、電話（phone）</li>
                <li>• 可選欄位：會員編號、等級（tier）、電郵、積分、餘額</li>
                <li>• 電話已存在的會員將自動<strong>跳過</strong>（不會覆蓋）</li>
                <li>• 等級關鍵字對照：普通→normal、銀卡→silver、金卡→gold、VIP→vip</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 步驟指示 */}
        <div className="flex items-center gap-2">
          {['上傳檔案', '預覽確認', '完成'].map((label, i) => {
            const steps = ['upload', 'preview', 'result']
            const current = steps.indexOf(step)
            const active = i === current
            const done = i < current
            return (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${done ? 'bg-green-500 text-white' : active ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium ${active ? 'text-purple-700' : done ? 'text-green-600' : 'text-gray-400'}`}>
                  {label}
                </span>
                {i < 2 && <div className={`w-12 h-0.5 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>

        {/* ===== 上傳步驟 ===== */}
        {step === 'upload' && (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200 p-12 text-center hover:border-purple-300 transition-colors">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center">
                <Upload className="w-10 h-10 text-purple-500" />
              </div>
              <div>
                <p className="text-gray-700 font-semibold text-lg">點擊選擇 Excel 檔案</p>
                <p className="text-gray-400 text-sm mt-1">支援 .xlsx / .csv，建議少於 10,000 行</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.csv,.xls"
                onChange={handleFile}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 transition-all shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    讀取中...
                  </span>
                ) : '選擇 Excel 檔案'}
              </button>
            </div>
            {error && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* ===== 預覽步驟 ===== */}
        {step === 'preview' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <p className="font-semibold text-gray-800">資料預覽</p>
                  <p className="text-xs text-gray-500 mt-0.5">共 {rows.length} 行 · 前 20 行預覽</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setStep('upload'); setRows([]) }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    重新選擇
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={loading}
                    className="px-6 py-2 text-sm bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-500 disabled:opacity-50 transition-all font-semibold shadow-sm"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        導入中...
                      </span>
                    ) : `確認導入 ${rows.length} 筆`}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full text-xs divide-y divide-gray-100">
                  <thead className="bg-purple-50 sticky top-0">
                    <tr>
                      {headers.map(h => (
                        <th key={h} className="px-3 py-2.5 text-left font-semibold text-purple-700 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rows.slice(0, 20).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {headers.map(h => (
                          <td key={h} className="px-3 py-2 text-gray-700 whitespace-nowrap">
                            {row[h] || <span className="text-gray-300">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 20 && (
                <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
                  顯示前 20 行，共 {rows.length} 行將全部導入
                </div>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3 border border-red-200">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        )}

        {/* ===== 結果步驟 ===== */}
        {step === 'result' && result && (
          <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">導入完成</h2>
                <p className="text-gray-500 text-sm">共處理 {result.total} 筆記錄</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-5 text-center border border-green-100">
                <p className="text-3xl font-bold text-green-700">{result.imported}</p>
                <p className="text-sm text-green-600 mt-1 font-medium">成功導入</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 text-center border border-gray-200">
                <p className="text-3xl font-bold text-gray-600">{result.skipped}</p>
                <p className="text-sm text-gray-500 mt-1 font-medium">已跳過</p>
                <p className="text-xs text-gray-400 mt-0.5">（電話已存在）</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-5 text-center border border-amber-100">
                <p className="text-3xl font-bold text-amber-700">
                  {result.total - result.imported - result.skipped}
                </p>
                <p className="text-sm text-amber-600 mt-1 font-medium">失敗</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  錯誤記錄
                </p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 font-mono">{e}</p>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Link
                href="/"
                className="px-5 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                返回首頁
              </Link>
              <button
                onClick={() => { setStep('upload'); setRows([]); setResult(null) }}
                className="px-5 py-2.5 text-sm bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl hover:from-purple-500 hover:to-purple-400 transition-all font-semibold shadow-sm"
              >
                繼續導入
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
