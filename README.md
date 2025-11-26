# Smart Register Demo

本人確認を想定した登録フォームのWebアプリケーションデモ。クライアントサイドでのデータ暗号化とIndexedDBを活用したドラフト保存機能を実装しています。

## デモ

<p align="center">
  <strong>Live Demo</strong>: <a href="https://volume.next-with-register.workers.dev">https://volume.next-with-register.workers.dev</a>
</p>

<div align="center">
  <img src=".github/images/register.png" alt="トップページ" width="600">
</div>

## 主な機能

- **3ステップの登録フロー**
  - Step 1: 基本情報入力（氏名、メールアドレス、電話番号、住所）
  - Step 2: 本人確認書類アップロード（運転免許証、パスポート、マイナンバーカード）
  - Step 3: 入力内容の確認と送信

- **セキュリティ**
  - クライアントサイドでのデータ暗号化（Web Crypto API）
  - セッションベースの暗号鍵管理

- **UX機能**
  - ドラフト自動保存（IndexedDB）
  - 24時間後の自動クリーンアップ
  - レスポンシブデザイン
  - リアルタイムバリデーション

## 技術スタック

### フロントエンド

- **Next.js 16**
- **TypeScript**
- **React Hook Form** + **Zod** (フォーム管理・バリデーション)
- **Tailwind CSS** (スタイリング)

### データ管理

- **Dexie.js** (IndexedDB ラッパー)
- **Web Crypto API** (クライアントサイド暗号化)

### インフラ・デプロイ

- **Cloudflare Workers**
- **GitHub Actions** (CI/CD)

### テスト・品質管理

- **Vitest**
  - Browser Mode: ブラウザ環境でのコンポーネントテスト
  - JSDOM: React Hook Formを使用したコンポーネントのテスト
- **Playwright** (ブラウザ自動化)
- **ESLint** + **Prettier** (コード品質)
- **TypeScript** (型安全性)

## プロジェクト構成

```
next-with-register/
├── app/                          # Next.js App Router
│   ├── register/
│   │   ├── step1-basic/         # Step 1: 基本情報入力
│   │   ├── step2-documents/     # Step 2: 書類アップロード
│   │   └── step3-confirm/       # Step 3: 確認画面
│   └── api/                     # API Routes
├── lib/
│   ├── db.ts                    # Dexie.js データベース定義
│   ├── hooks/                   # カスタムフック
│   ├── schema/                  # Zodスキーマ定義
│   └── utils/                   # ユーティリティ関数
├── components/                  # 共通コンポーネント
└── .github/workflows/           # GitHub Actions CI/CD
```

## 開発環境のセットアップ

### 必要な環境

- **Bun** (推奨)

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/next-with-register.git
cd next-with-register

# 依存関係のインストール
bun install

# 開発サーバーの起動
bun run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## テスト

```bash
# テストを実行
bun run test

# 型チェック
bun run typecheck

# Lint
bun run lint

# フォーマット
bun run format
```

### テストカバレッジ

- **181テスト** (JSDOMテスト: 135 / ブラウザテスト: 46)
- コンポーネントテスト
- カスタムフックテスト
- ユーティリティ関数テスト

## ビルドとデプロイ

```bash
# プロダクションビルド
bun run build

# Cloudflare Workersへのデプロイ
bun run deploy
```

### CI/CD

GitHub Actionsによる自動デプロイを実装：

- **PR作成時**: テスト・型チェック・Lintを自動実行
- **mainブランチへのマージ時**: テスト成功後、Cloudflare Workersへ自動デプロイ

ワークフロー設定: `.github/workflows/`

## 主要な実装ポイント

### 1. クライアントサイド暗号化

```typescript
// Web Crypto APIを使用した暗号化
export async function encryptString(text: string, sessionId: string): Promise<string> {
  const key = await deriveKey(sessionId)
  // AES-GCM暗号化
  // ...
}
```

### 2. IndexedDBによるドラフト保存

```typescript
export const db = new Dexie('RegisterDatabase') as RegisterDatabase
db.version(1).stores({
  registerData: '&id, sessionId, updatedAt',
})
```

### 3. 型安全なフォームバリデーション

```typescript
// Zodスキーマによる厳密なバリデーション
export const personalInfoSchema = z.object({
  fullName: z.string().min(1, '氏名を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  // ...
})
```
