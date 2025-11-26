import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * 画像ファイル検証用の再利用可能なスキーマ
 * - Fileオブジェクトであること
 * - サイズが5MB以下であること
 * - 形式が jpeg, png, webp であること
 */
const imageFileSchema = z
  .custom<File>(
    (val) => typeof window !== 'undefined' && val instanceof File,
    '画像をアップロードしてください'
  )
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: 'ファイルサイズは5MB以下にしてください',
  })
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: '.jpg, .png, .webp 形式のみ対応しています',
  })

// ==========================================
// Step 1: 基本情報 (Personal Info)
// ==========================================
export const personalInfoSchema = z.object({
  fullName: z.string().min(1, '氏名を入力してください'),
  email: z.email('正しいメールアドレス形式で入力してください'),
  phoneNumber: z.string().regex(/^0\d{9,10}$/, 'ハイフンなしの正しい電話番号を入力してください'),
  address: z.string().min(1, '住所を入力してください'),
})

// ==========================================
// Step 2: 書類選択 (Documents)
// ==========================================

// 1. 運転免許証
const driversLicenseSchema = z.object({
  documentType: z.literal('drivers_license'),
  licenseNumber: z.string().regex(/^\d{12}$/, '免許証番号は12桁の半角数字で入力してください'),
  frontImage: imageFileSchema,
  backImage: imageFileSchema, // 免許証は裏面必須
})

// 2. パスポート
const passportSchema = z.object({
  documentType: z.literal('passport'),
  passportNumber: z
    .string()
    .regex(/^[A-Z]{2}\d{7}$/, '旅券番号の形式が正しくありません（例: TK1234567）'),
  frontImage: imageFileSchema,
  // パスポートは裏面不要（フィールド自体が存在しないか、あっても検証しない）
})

// 3. マイナンバーカード
const myNumberSchema = z.object({
  documentType: z.literal('my_number'),
  myNumber: z.string().regex(/^\d{12}$/, 'マイナンバーは12桁の半角数字で入力してください'),
  expirationDate: z
    .custom<Date>((val) => {
      // undefinedまたはnullの場合はエラー
      if (val === undefined || val === null) {
        return false
      }
      // Dateオブジェクトの場合
      if (val instanceof Date) {
        return !isNaN(val.getTime())
      }
      // 文字列の場合は変換を試みる
      if (typeof val === 'string' && val.length > 0) {
        const date = new Date(val)
        return !isNaN(date.getTime())
      }
      return false
    }, '有効な日付を入力してください')
    .transform((val) => {
      if (val instanceof Date) return val
      return new Date(val as string)
    })
    .refine((date) => date > new Date(), {
      message: '有効期限が切れているカードは使用できません',
    }),
  frontImage: imageFileSchema,
  backImage: imageFileSchema, // マイナンバーは裏面必須
})

// 書類スキーマの統合 (Discriminated Union)
// documentType の値によって自動的にバリデーションルールが切り替わります
export const documentSchema = z.discriminatedUnion('documentType', [
  driversLicenseSchema,
  passportSchema,
  myNumberSchema,
])

// ==========================================
// 統合スキーマ (アプリ全体)
// ==========================================
// Step 1 と Step 2 を結合したもの。
// DB保存時の型定義や、確認画面での型定義として使用します。
export const registerSchema = z.intersection(personalInfoSchema, documentSchema)

// --- 型定義のエクスポート ---

// Step 1 用
export type PersonalInfoSchema = z.infer<typeof personalInfoSchema>

// Step 2 用
export type DocumentSchema = z.infer<typeof documentSchema>

// 全体統合型 (DB保存用など)
export type RegisterSchema = z.infer<typeof registerSchema>
