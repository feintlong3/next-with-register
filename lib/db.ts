import Dexie, { type Table } from 'dexie'

import { type RegisterSchema } from '@/lib/schema/register-schema'

// DBに保存するデータ型定義
export type RegisterDraft = RegisterSchema & {
  id: string
  sessionId: string
  updatedAt: Date
}

class RegisterDatabase extends Dexie {
  registerData!: Table<RegisterDraft, string>

  constructor() {
    super('SmartRegisterDB')

    this.version(1).stores({
      registerData: 'id, sessionId, updatedAt',
    })
  }
}

let dbInstance: RegisterDatabase | null = null

export const getDb = (): RegisterDatabase => {
  if (!dbInstance) {
    dbInstance = new RegisterDatabase()
  }
  return dbInstance
}

export const initializeDb = async () => {
  const db = getDb()
  await db.open()
}

export const deleteDb = async () => {
  try {
    // インスタンスがあれば閉じる
    if (dbInstance) {
      if (dbInstance.isOpen()) {
        dbInstance.close()
      }
      await dbInstance.delete().then(() => {
        console.log('Database deleted successfully')
        dbInstance = null
      })
    }
  } catch (error) {
    console.error('Failed to delete database:', error)
    throw error
  }
}
