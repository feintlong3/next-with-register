import { useEffect } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { type DocumentSchema } from '@/lib/schema/register-schema'

/**
 * 書類フォーム専用のドラフト同期フック
 * step2 固有のロジックを持つ：
 * - File オブジェクトのチェック
 * - デフォルト値とのマージ
 */
export function useDocumentFormDraftSync(
  form: UseFormReturn<DocumentSchema>,
  draft: Record<string, unknown> | null | undefined
) {
  useEffect(() => {
    if (draft) {
      // draftデータとdefaultValuesをマージして、undefinedのフィールドを防ぐ
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const draftAny = draft as any

      const safeData = {
        documentType: (draftAny.documentType ??
          'drivers_license') as DocumentSchema['documentType'],
        licenseNumber: draftAny.licenseNumber ?? '',
        passportNumber: draftAny.passportNumber ?? '',
        myNumber: draftAny.myNumber ?? '',
        expirationDate: draftAny.expirationDate,
        // 画像は有効なFileオブジェクトの場合のみ復元
        frontImage: draftAny.frontImage instanceof File ? draftAny.frontImage : undefined,
        backImage: draftAny.backImage instanceof File ? draftAny.backImage : undefined,
      }

      form.reset(safeData as DocumentSchema)
    }
  }, [draft, form])
}
