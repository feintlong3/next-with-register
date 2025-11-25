import { getDb } from '@/lib/db'

const DRAFT_ID = 'register-draft'

/**
 * 一定時間経過後にデータを自動削除
 */
export async function setupAutoCleanup() {
  const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24時間

  const db = getDb()
  const draft = await db.registerData.get(DRAFT_ID)

  if (draft) {
    const age = Date.now() - draft.updatedAt.getTime()

    if (age > MAX_AGE_MS) {
      console.log('古いドラフトデータを削除します')
      await db.registerData.delete(DRAFT_ID)
    }
  }
}
