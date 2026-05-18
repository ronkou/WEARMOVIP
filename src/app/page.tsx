'use client'

import { useEffect, useRef } from 'react'
import { Crown, Gift, Star, Ticket, ChevronRight, Sparkles, Lock, Shield, Upload } from 'lucide-react'

const BENEFITS = [
  {
    icon: <Crown className="w-8 h-8 text-amber-500" />,
    title: '專屬折扣',
    desc: '全線正價商品 9 折，每月享有 VIP 專屬優惠日',
    tag: '每月重賞',
  },
  {
    icon: <Ticket className="w-8 h-8 text-purple-500" />,
    title: '優先預購',
    desc: '限量款式優先預購權，新品上架提前 24 小時搶購',
    tag: '搶先一步',
  },
  {
    icon: <Gift className="w-8 h-8 text-pink-500" />,
    title: '生日禮遇',
    desc: '生日月份雙倍積分 + MOP$100 生日禮券',
    tag: '生日專屬',
  },
  {
    icon: <Star className="w-8 h-8 text-blue-500" />,
    title: '私人活動',
    desc: '受邀參加 VIP 限定活動、時裝秀、粉絲聚會',
    tag: '尊享邀請',
  },
]

const EVENTS = [
  {
    date: '6月15日',
    title: '夏季新品搶先預覽',
    tag: '預購活動',
    tagColor: 'bg-purple-100 text-purple-700',
    desc: '2026 夏季系列搶先看，VIP 優先預訂名額',
  },
  {
    date: '7月1日',
    title: '澳門門店 VIP 日',
    tag: '線下活動',
    tagColor: 'bg-amber-100 text-amber-700',
    desc: '門店限定優惠，雙倍積分，限定禮品',
  },
  {
    date: '8月',
    title: '積分兌換特別兌換率',
    tag: '積分活動',
    tagColor: 'bg-green-100 text-green-700',
    desc: 'VIP 等級積分兌換比例提升至 120 分 = MOP$1',
  },
]

export default function HomePage() {
  const benefitsRef = useRef<HTMLDivElement>(null)

  const scrollToBenefits = () => {
    benefitsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleBecomeVip = () => {
    // 跳轉至會員登記頁面
    window.location.href = 'https://acc.wearmo.app/members'
  }

  const handleEventDetail = (title: string) => {
    alert(`「${title}」詳情即將公佈，請留意 WEARMO 最新消息。`)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-amber-600 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 text-sm mb-6">
            <Sparkles className="w-4 h-4 text-amber-300" />
            WEARMO VIP 等級會員專區
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            尊享非凡<br />
            <span className="bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">
              會員專屬禮遇
            </span>
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-8">
            成為 WEARMO VIP，解鎖限時折扣、優先預購、私人活動等尊貴禮遇
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleBecomeVip}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Crown className="w-5 h-5" />
              成為 VIP 會員
            </button>
            <button
              onClick={scrollToBenefits}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/25 backdrop-blur text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/20"
            >
              查看專屬福利
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L48 52C96 44 192 28 288 20C384 12 480 12 576 20C672 28 768 44 864 52C960 60 1056 60 1152 52C1248 44 1344 28 1392 20L1440 12V60H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Benefits */}
      <section ref={benefitsRef} className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">VIP 專屬四大權益</h2>
          <p className="text-gray-500">每項都是我們對 VIP 會員的承諾</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {BENEFITS.map((b, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center">
                  {b.icon}
                </div>
                <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                  {b.tag}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VIP Tiers */}
      <section className="bg-gradient-to-r from-purple-900 to-purple-800 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">VIP 等級說明</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { tier: '普通會員', points: '0+', color: 'from-gray-400 to-gray-500', desc: '免費入會' },
              { tier: '銀卡會員', points: '500+', color: 'from-slate-300 to-slate-400', desc: '銀卡禮遇' },
              { tier: '金卡會員', points: '2,000+', color: 'from-amber-400 to-amber-600', desc: '金卡尊享' },
              { tier: 'VIP會員', points: '10,000+', color: 'from-purple-400 to-purple-700', desc: 'VIP 尊貴', highlight: true },
            ].map((t, i) => (
              <div key={i} className={`text-center p-6 rounded-2xl ${t.highlight ? 'bg-white/20 backdrop-blur ring-2 ring-amber-400' : 'bg-white/10'}`}>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} mx-auto mb-3 flex items-center justify-center`}>
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className={`font-bold mb-1 ${t.highlight ? 'text-amber-300' : 'text-white'}`}>{t.tier}</h3>
                <p className={`text-2xl font-bold mb-1 ${t.highlight ? 'text-white' : 'text-white/90'}`}>{t.points}</p>
                <p className="text-xs text-white/60">積分門檻</p>
                <p className="text-xs mt-1 text-white/70">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">即將舉行</h2>
            <p className="text-sm text-gray-500 mt-1">VIP 限定活動，不容錯過</p>
          </div>
        </div>
        <div className="space-y-4">
          {EVENTS.map((e, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-5 hover:shadow-md transition-shadow">
              <div className="text-center min-w-16">
                <p className="text-xs text-gray-400 font-medium">{e.date.split('月')[0]}月</p>
                <p className="text-2xl font-bold text-gray-900">{e.date.split('月')[1]?.replace('日', '') || e.date}</p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{e.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.tagColor}`}>{e.tag}</span>
                </div>
                <p className="text-sm text-gray-500">{e.desc}</p>
              </div>
              <button
                onClick={() => handleEventDetail(e.title)}
                className="flex-shrink-0 px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium cursor-pointer"
              >
                詳情
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">還不是 VIP？</h2>
          <p className="text-gray-400 mb-8">
            在 WEARMO 消費，累積積分升級會員，解鎖更多尊貴禮遇
          </p>
          <a href="https://acc.wearmo.app/members"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 font-bold rounded-full hover:from-amber-400 hover:to-amber-500 transition-all">
            前往 WEARMO 會員中心
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Floating staff button */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2 z-50">
        <a href="/migrate"
          className="flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 shadow-md border border-amber-200 rounded-full text-sm font-medium text-amber-700 transition-all">
          <Upload className="w-3.5 h-3.5" />
          遷移舊POS
        </a>
        <a href="/admin"
          className="flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur shadow-lg hover:shadow-xl hover:bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:text-purple-700 transition-all">
          <Shield className="w-4 h-4 text-purple-600" />
          員工專區
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-500 py-6 text-center text-sm">
        <p>© 2026 WEARMO. WEARMO Account 提供技術支援。</p>
        <p className="mt-1 text-xs">如有問題，請聯絡門店或發送電郵至 support@wearmo.net</p>
      </footer>
    </div>
  )
}
