'use client'

import { useState } from 'react'
import { Lock, Shield, ArrowLeft, Crown, Users, Upload, ChevronRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const STAFF_PASSWORD = 'WEAR2026vip'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    setLoading(true)

    if (password.trim() === STAFF_PASSWORD) {
      setLoggedIn(true)
      setLoading(false)
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-gray-950 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Back link */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首頁
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-purple-900/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-700 to-purple-600 px-8 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-xl font-bold text-white">員工專區</h1>
            <p className="text-purple-200 text-sm mt-1">WEARMO VIP 管理系統</p>
          </div>

          {/* Form / Dashboard */}
          <div className="px-8 py-8">
            {loggedIn ? (
              // 登入成功：功能面板
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-green-700">身份驗證成功</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">請選擇要使用的功能：</p>

                <a href="/migrate"
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 group-hover:text-purple-700">舊POS資料遷移</p>
                    <p className="text-xs text-gray-400 mt-0.5">從金山文檔或 Excel 導入舊會員資料</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500" />
                </a>

                <a href="https://acc.wearmo.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 group-hover:text-purple-700">會員管理系統</p>
                    <p className="text-xs text-gray-400 mt-0.5">acc.wearmo.app（在新視窗開啟）</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500" />
                </a>

                <button onClick={() => { setLoggedIn(false); setPassword('') }}
                  className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  登出並返回
                </button>
              </div>
            ) : (
              // 登入表單
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    員工密碼
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(false) }}
                      placeholder="請輸入員工密碼"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${error ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      autoFocus
                      autoComplete="current-password"
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      密碼錯誤，請重新輸入
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password.trim()}
                  className="w-full py-3 bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-600 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      驗證中...
                    </span>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      驗證身份
                    </>
                  )}
                </button>
              </form>
            )}

            {!loggedIn && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs text-amber-700 font-medium mb-1">📌 提示</p>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    此入口僅供 WEARMO 員工使用。密碼由管理員分發，請勿外洩。如有問題請聯絡 IT 部門。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-6">
          © 2026 WEARMO. 員工系統受 WEARMO 隱私政策約束。
        </p>
      </div>
    </div>
  )
}
