'use client'

import { useState } from 'react'
import { Lock, Shield, ArrowLeft, Crown } from 'lucide-react'
import Link from 'next/link'

const STAFF_PASSWORD = 'WEAR2026vip'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    setLoading(true)

    if (password.trim() === STAFF_PASSWORD) {
      window.location.href = 'https://acc.wearmo.app'
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

          {/* Form */}
          <div className="px-8 py-8">
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
                    跳轉中...
                  </span>
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    進入管理系統
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-xs text-amber-700 font-medium mb-1">📌 提示</p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  此入口僅供 WEARMO 員工使用。密碼由管理員分發，請勿外洩。如有問題請聯絡 IT 部門。
                </p>
              </div>
            </div>
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
