import type { Metadata } from 'next'
import AdminLogin from './AdminLogin'

export const metadata: Metadata = {
  title: '員工專區 - WEARMO VIP',
  description: 'WEARMO VIP 管理系統員工入口',
}

export default function AdminPage() {
  return <AdminLogin />
}
