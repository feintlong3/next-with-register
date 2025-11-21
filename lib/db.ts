import Dexie, { type Table } from 'dexie'

import { type RegisterFormValues } from '@/lib/schema/register-schema'

// DBに保存するデータ型定義
export type RegisterDraft = RegisterFormValues & {
  id: string // 固定のID（例: 'current_draft'）を使って「1ユーザー1ドラフト」を管理する場合
  updatedAt: Date
}

class RegisterDatabase extends Dexie {
  // テーブル定義（ジェネリクスで型安全にする）
  registerData!: Table<RegisterDraft, string>

  constructor() {
    super('SmartRegisterDB')

    // スキーマ定義
    this.version(1).stores({
      registerData: 'id, documentType, updatedAt',
    })
  }
}

// シングルトンインスタンスの作成
// Next.jsなどのSSR環境でのエラーを防ぐため、globalスコープ等を利用するか、
// あるいは単純にモジュールレベルで生成してもDexieはブラウザ環境チェックをしてくれますが、
// 明示的にクライアントサイドでのみ利用することを意識します。
export const db = new RegisterDatabase()
