import { type RegisterSchema } from '@/lib/schema/register-schema'

import { decryptString, encryptString } from './encryption'

/**
 * 暗号化対象のフィールド定義
 * - common: 全ての書類タイプで共通のフィールド
 * - documentType別: 各書類タイプ固有のフィールド
 */
const SENSITIVE_FIELDS = {
  common: ['fullName', 'email', 'phoneNumber', 'address'] as const,
  drivers_license: ['licenseNumber'] as const,
  passport: ['passportNumber'] as const,
  my_number: ['myNumber'] as const,
} as const

/**
 * オーバーロードで型を保持
 */
export async function encryptRegisterData(data: RegisterSchema): Promise<RegisterSchema>
export async function encryptRegisterData(
  data: Partial<RegisterSchema>
): Promise<Partial<RegisterSchema>>
export async function encryptRegisterData(
  data: RegisterSchema | Partial<RegisterSchema>
): Promise<RegisterSchema | Partial<RegisterSchema>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const encrypted = { ...data } as any

  // 共通フィールドの暗号化
  for (const field of SENSITIVE_FIELDS.common) {
    if (data[field]) {
      encrypted[field] = await encryptString(String(data[field]))
    }
  }

  // documentType固有のフィールドの暗号化
  if (data.documentType) {
    const documentFields = SENSITIVE_FIELDS[data.documentType]
    if (documentFields) {
      for (const field of documentFields) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = (data as any)[field]
        if (value) {
          encrypted[field] = await encryptString(String(value))
        }
      }
    }
  }

  return encrypted
}

/**
 * 復号化関数もオーバーロード
 */
export async function decryptRegisterData(data: RegisterSchema): Promise<RegisterSchema>
export async function decryptRegisterData(
  data: Partial<RegisterSchema>
): Promise<Partial<RegisterSchema>>
export async function decryptRegisterData(
  data: RegisterSchema | Partial<RegisterSchema>
): Promise<RegisterSchema | Partial<RegisterSchema>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decrypted = { ...data } as any

  try {
    // 共通フィールドの復号化
    for (const field of SENSITIVE_FIELDS.common) {
      if (data[field]) {
        decrypted[field] = await decryptString(String(data[field]))
      }
    }

    // documentType固有のフィールドの復号化
    if (data.documentType) {
      const documentFields = SENSITIVE_FIELDS[data.documentType]
      if (documentFields) {
        for (const field of documentFields) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const value = (data as any)[field]
          if (value) {
            decrypted[field] = await decryptString(String(value))
          }
        }
      }
    }
  } catch (error) {
    console.error('Decryption failed:', error)
    throw error
  }

  return decrypted
}
