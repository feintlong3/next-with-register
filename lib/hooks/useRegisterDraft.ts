import { useLiveQuery } from 'dexie-react-hooks'

import { db } from '@/lib/db'

// ドラフトデータのID
export const DRAFT_ID = 'draft_user_1'

export const useRegisterDraft = () => {
  // useLiveQuery: DBの変更をリアルタイムに監視・取得するフック
  const draft = useLiveQuery(async () => {
    const data = await db.registerData.get(DRAFT_ID)
    return data
  }, [])

  return {
    draft,
    isLoading: draft === undefined,
  }
}
