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
  MEMBERS: 'members',
} as const
