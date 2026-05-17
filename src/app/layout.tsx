import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WEARMO VIP - 尊享會員',
  description: 'WEARMO VIP 等級會員尊享專屬福利與活動',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className="min-h-screen bg-gray-50 antialiased">
        {children}
      </body>
    </html>
  )
}
