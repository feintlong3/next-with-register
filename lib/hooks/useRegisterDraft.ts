import Dexie from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'

import { getDb } from '@/lib/db'

export const DRAFT_ID = 'draft_user_1'
const SESSION_KEY_NAME = 'register_session_id'
const DB_NAME = 'SmartRegisterDB'

export const useRegisterDraft = () => {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [dbExists, setDbExists] = useState<boolean | null>(null)

  // クライアントサイド初期化
  useEffect(() => {
    const initialize = async () => {
      // セッションID取得
      let sid = sessionStorage.getItem(SESSION_KEY_NAME)
      if (!sid) {
        sid = crypto.randomUUID()
        sessionStorage.setItem(SESSION_KEY_NAME, sid)
      }
      setSessionId(sid)

      // ★DBの存在確認（これだけならDBは作成されない）
      const exists = await Dexie.exists(DB_NAME)
      setDbExists(exists)
    }

    initialize()
  }, [])

  // セッション不一致の検出と削除（DBが存在する場合のみ）
  useEffect(() => {
    if (!sessionId || dbExists === null || !dbExists) return

    const checkAndCleanup = async () => {
      try {
        const db = getDb()
        const data = await db.registerData.get(DRAFT_ID)

        if (data && data.sessionId !== sessionId) {
          console.warn('セッション不一致。データを破棄します。')
          await db.registerData.delete(DRAFT_ID)
          console.log('古いドラフトデータが削除されました。')
        }
      } catch (error) {
        console.error('削除エラー:', error)
      }
    }

    checkAndCleanup()
  }, [sessionId, dbExists])

  // useLiveQuery: DBが存在する場合のみ実行
  const draft = useLiveQuery(async () => {
    if (!sessionId || dbExists === null || !dbExists) {
      return null
    }

    try {
      const db = getDb()
      const data = await db.registerData.get(DRAFT_ID)

      if (!data || data.sessionId !== sessionId) {
        return null
      }

      return data
    } catch (error) {
      console.error('Draft取得エラー:', error)
      return null
    }
  }, [sessionId, dbExists])

  return {
    draft,
    sessionId,
    isLoading: dbExists === null || sessionId === null,
  }
}
