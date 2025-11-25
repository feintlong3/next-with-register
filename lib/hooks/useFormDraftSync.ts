import { useEffect } from 'react'
import { type FieldValues, type UseFormReturn } from 'react-hook-form'

/**
 * ドラフトデータをフォームに同期するフック
 * draft が変更されたら自動的にフォームをリセットする
 */
export function useFormDraftSync<T extends FieldValues>(
  form: UseFormReturn<T>,
  draft: Partial<T> | null | undefined
) {
  useEffect(() => {
    if (draft) {
      // draftには他のステップのデータも含まれている可能性があるが、
      // resetはフォーム定義にあるフィールドのみを更新してくれるため安全
      form.reset(draft as T)
    }
  }, [draft, form])
}
