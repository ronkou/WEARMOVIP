// ============================================================
// WEARMOVIP 會員系統 - 類型定義
// ============================================================

// ========== 會員核心 ==========
export interface Member {
  _id?: string
  memberNo: string           // 會員號 WM-00001
  name: string
  phone: string             // 主鍵（電話登入）
  email?: string
  wechatOpenid?: string     // 微信 OpenID
  wechatUnionid?: string    // UnionID（跨公眾號統一識別）
  source: MemberSource
  tier: MemberTier
  balance: number            // 儲值餘額（MOP）
  points: number             // 積分餘額
  status: MemberStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type MemberSource = 'pos' | 'website' | 'wechat' | 'account' | 'manual'
export type MemberTier = 'normal' | 'silver' | 'gold' | 'vip'
export type MemberStatus = 'active' | 'inactive' | 'blacklist'

// ========== 模組連接器 ==========
export interface ModuleConnector {
  _id?: string
  moduleId: ModuleId
  name: string
  description?: string
  webhookUrl?: string
  apiKey: string
  events: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type ModuleId = 'pos' | 'website' | 'account' | 'weco' | 'kdocs'

// ========== 會員事件日誌 ==========
export interface MemberEvent {
  _id?: string
  memberId: string
  eventType: MemberEventType
  moduleId: ModuleId
  payload: Record<string, any>
  delivered: boolean
  deliveredAt?: Date
  createdAt: Date
}

export type MemberEventType =
  | 'created' | 'updated' | 'tier_changed'
  | 'balance_changed' | 'points_changed' | 'sale'
  | 'coupon_issued' | 'coupon_redeemed'

// ========== 儲值交易 ==========
export interface BalanceTransaction {
  _id?: string
  memberId: string
  type: 'topup' | 'deduct' | 'refund'
  amount: number
  balanceBefore: number
  balanceAfter: number
  source: MemberSource
  storeId?: string
  remark?: string
  createdAt: Date
}

// ========== 積分規則 ==========
export interface PointsRule {
  _id?: string
  name: string
  moduleId: ModuleId
  storeIds: string[]
  pointsPerUnit: number
  minAmountToEarn: number
  tierMultipliers: Record<MemberTier, number>
  dailyMaxPoints?: number
  redeemableAsCash: boolean
  pointsToCashRate: number
  minPointsToRedeem: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ========== 積分交易 ==========
export interface PointsTransaction {
  _id?: string
  memberId: string
  points: number
  balance: number
  type: 'earn' | 'redeem' | 'expire' | 'adjust' | 'refund'
  source: MemberSource
  moduleId?: ModuleId
  storeId?: string
  amount?: number
  ruleId?: string
  redeemUnits?: number
  remark?: string
  createdAt: Date
}

// ========== 優惠券 ==========
export interface Coupon {
  _id?: string
  name: string
  type: CouponType
  value: number
  threshold: number
  maxDiscount?: number
  moduleIds: ModuleId[]
  storeIds: string[]
  tierScope: MemberTier[]
  totalCount: number
  perMemberLimit: number
  currentIssued: number
  validFrom: Date
  validUntil: Date
  status: CouponStatus
  createdAt: Date
  updatedAt: Date
}

export type CouponType = 'discount_amount' | 'discount_percent' | 'threshold_discount' | 'gift'
export type CouponStatus = 'draft' | 'active' | 'paused' | 'expired'

// ========== 已發放優惠券 ==========
export interface CouponInstance {
  _id?: string
  couponId: string
  memberId: string
  couponName: string
  status: CouponInstanceStatus
  issuedBy: 'auto' | 'manual' | 'campaign'
  issuedAt: Date
  usedAt?: Date
  usedAtStoreId?: string
  usedAtModule?: ModuleId
  usedAtAmount?: number
}

export type CouponInstanceStatus = 'unused' | 'used' | 'expired'

// ========== 營銷規則引擎 ==========
export interface MarketingRule {
  _id?: string
  name: string
  moduleId: ModuleId
  trigger: {
    event: 'sale' | 'topup' | 'refund' | 'signup' | 'tier_upgrade'
    conditions: {
      amountMin?: number
      amountMax?: number
      storeIds?: string[]
      memberTiers?: MemberTier[]
    }
  }
  actions: MarketingAction[]
  priority: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MarketingAction {
  type: 'award_points' | 'issue_coupon' | 'upgrade_tier' | 'send_sms' | 'wechat_template'
  value?: number
  couponId?: string
  targetTier?: MemberTier
  template?: string
}

// ========== 等級設定 ==========
export interface TierConfig {
  _id?: string
  tier: MemberTier
  name: string
  thresholdAmount: number
  benefits: string[]
  discountRate?: number
  pointsMultiplier: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ========== 默認等級配置 ==========
export const DEFAULT_TIER_CONFIG: TierConfig[] = [
  { tier: 'normal', name: '普通會員', thresholdAmount: 0, benefits: ['基本積分'], pointsMultiplier: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tier: 'silver', name: '銀卡會員', thresholdAmount: 1000, benefits: ['1.2倍積分', '生日優惠'], pointsMultiplier: 1.2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tier: 'gold', name: '金卡會員', thresholdAmount: 5000, benefits: ['1.5倍積分', '優先客服', '生日禮物'], pointsMultiplier: 1.5, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { tier: 'vip', name: 'VIP會員', thresholdAmount: 20000, benefits: ['2倍積分', '專屬折扣', '優先購買', '生日禮物'], pointsMultiplier: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
]

// ========== POS API 請求/響應 ==========
export interface POSSaleRequest {
  memberId?: string
  phone?: string
  storeId: string
  amount: number
  paymentMethod: string
  items?: POSSaleItem[]
  pointsToRedeem?: number
  couponInstanceId?: string
}

export interface POSSaleItem {
  name: string
  quantity: number
  price: number
}

export interface POSSaleResponse {
  success: boolean
  memberId?: string
  memberNo?: string
  pointsEarned: number
  pointsBalance: number
  balanceAfter: number
  couponIssued?: { name: string; instanceId: string }[]
  error?: string
}

export interface POSMemberLookupResponse {
  found: boolean
  member?: {
    _id: string
    memberNo: string
    name: string
    phone: string
    tier: MemberTier
    balance: number
    points: number
    status: MemberStatus
  }
}

// ========== 默認積分規則 ==========
export const DEFAULT_POINTS_RULES: Omit<PointsRule, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '預設積分規則（全渠道/全門店）',
    moduleId: 'pos',
    storeIds: [],
    pointsPerUnit: 1,
    minAmountToEarn: 10,
    tierMultipliers: { normal: 1, silver: 1.2, gold: 1.5, vip: 2 },
    dailyMaxPoints: -1,
    redeemableAsCash: true,
    pointsToCashRate: 100,
    minPointsToRedeem: 100,
    isActive: true,
  },
]
