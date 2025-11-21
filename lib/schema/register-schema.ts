import { z } from 'zod'

// 1. 再利用可能なファイル検証スキーマ（ここだけでロジックを完結させる）
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const imageFileSchema = z
  .custom<File>((val) => val instanceof File, 'ファイルをアップロードしてください')
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: 'ファイルサイズは5MB以下にしてください',
  })
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: '.jpg, .png, .webp 形式のみ対応しています',
  })

// 2. 書類ごとの固有フィールド定義
// 運転免許証用スキーマ
const driversLicenseSchema = z.object({
  documentType: z.literal('drivers_license'), // 判別用のリテラル型
  licenseNumber: z.string().regex(/^\d{12}$/, '免許証番号は12桁の半角数字で入力してください'),
  frontImage: imageFileSchema,
  backImage: imageFileSchema, // 免許証は裏面も必須とする
})

// パスポート用スキーマ
const passportSchema = z.object({
  documentType: z.literal('passport'),
  passportNumber: z
    .string()
    .regex(/^[A-Z]{2}\d{7}$/, '旅券番号の形式が正しくありません（例: TK1234567）'),
  frontImage: imageFileSchema,
  // パスポートは裏面画像は不要（undefinedを許容、またはフィールド自体なし）
})

// マイナンバーカード用スキーマ
const myNumberSchema = z.object({
  documentType: z.literal('my_number'),

  // 個人番号（12桁）
  myNumber: z.string().regex(/^\d{12}$/, 'マイナンバーは12桁の半角数字で入力してください'),

  // セキュリティコード（署名用電子証明書暗証番号など。今回は4桁の例）
  securityCode: z
    .string()
    .regex(/^\d{4}$/, 'セキュリティコードは4桁の半角数字です')
    .optional(), // 任意項目にする場合

  // 有効期限（カード表面の印字）
  expirationDate: z.coerce.date().refine((date) => date > new Date(), {
    message: '有効期限が切れているカードは使用できません',
  }),

  frontImage: imageFileSchema,
  // マイナンバーカードは裏面（個人番号記載面）のアップロードには法的制約がある場合がありますが、
  // 今回はポートフォリオとして「機能実装」を見せるため必須とします。
  backImage: imageFileSchema,
})

// 3. 統合スキーマ（discriminatedUnionで分岐）
// これにより、documentTypeの値に応じて自動的に型が切り替わります
export const registerFormSchema = z.discriminatedUnion('documentType', [
  driversLicenseSchema,
  passportSchema,
  myNumberSchema,
])

// TypeScriptの型を抽出
export type RegisterFormValues = z.infer<typeof registerFormSchema>
