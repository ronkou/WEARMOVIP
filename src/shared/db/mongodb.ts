import { MongoClient, Db } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const DB_NAME = 'wearmo-account'

let client: MongoClient | null = null
let db: Db | null = null

export async function connectDB(): Promise<Db> {
  if (db) return db

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    db = client.db(DB_NAME)
    return db
  } catch (error) {
    console.error('[MongoDB] Connection error:', error)
    throw error
  }
}

export const COLLECTIONS = {
  // 會員系統集合
  MEMBERS: 'members',
  MODULE_CONNECTORS: 'module_connectors',
  MEMBER_EVENTS: 'member_events',
  BALANCE_TRANSACTIONS: 'balance_transactions',
  POINTS_RULES: 'points_rules',
  POINTS_TRANSACTIONS: 'points_transactions',
  COUPONS: 'coupons',
  COUPON_INSTANCES: 'coupon_instances',
  MARKETING_RULES: 'marketing_rules',
  TIER_CONFIG: 'tier_config',
} as const
