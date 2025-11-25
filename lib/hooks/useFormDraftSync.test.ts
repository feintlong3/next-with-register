import { renderHook } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, test } from 'vitest'

import { useFormDraftSync } from './useFormDraftSync'

interface TestFormData {
  name: string
  email: string
  age?: number
}

describe('useFormDraftSync', () => {
  test('draftがnullの場合、フォームはリセットされない', () => {
    const { result } = renderHook(() => {
      const form = useForm<TestFormData>({
        defaultValues: { name: '', email: '' },
      })
      useFormDraftSync(form, null)
      return form
    })

    expect(result.current.getValues()).toEqual({ name: '', email: '' })
  })

  test('draftがundefinedの場合、フォームはリセットされない', () => {
    const { result } = renderHook(() => {
      const form = useForm<TestFormData>({
        defaultValues: { name: '', email: '' },
      })
      useFormDraftSync(form, undefined)
      return form
    })

    expect(result.current.getValues()).toEqual({ name: '', email: '' })
  })

  test('draftが存在する場合、フォームがリセットされてdraftの値が設定される', () => {
    const draft = {
      name: '山田太郎',
      email: 'test@example.com',
      age: 30,
    }

    const { result } = renderHook(() => {
      const form = useForm<TestFormData>({
        defaultValues: { name: '', email: '' },
      })
      useFormDraftSync(form, draft)
      return form
    })

    const values = result.current.getValues()
    expect(values.name).toBe('山田太郎')
    expect(values.email).toBe('test@example.com')
    expect(values.age).toBe(30)
  })

  test('draftが部分的なデータの場合でも正しく動作する', () => {
    const draft = {
      name: '佐藤花子',
      email: 'draft@example.com',
    }

    const { result } = renderHook(() => {
      const form = useForm<TestFormData>({
        defaultValues: { name: '', email: 'default@example.com' },
      })
      useFormDraftSync(form, draft)
      return form
    })

    const values = result.current.getValues()
    expect(values.name).toBe('佐藤花子')
    expect(values.email).toBe('draft@example.com')
  })

  test('draftが変更されたら、フォームが再度リセットされる', () => {
    const initialDraft = {
      name: '初期値',
      email: 'initial@example.com',
    }

    const { result, rerender } = renderHook(
      ({ draft }) => {
        const form = useForm<TestFormData>({
          defaultValues: { name: '', email: '' },
        })
        useFormDraftSync(form, draft)
        return form
      },
      { initialProps: { draft: initialDraft } }
    )

    expect(result.current.getValues().name).toBe('初期値')
    expect(result.current.getValues().email).toBe('initial@example.com')

    // draftを変更
    const newDraft = {
      name: '更新値',
      email: 'updated@example.com',
    }

    rerender({ draft: newDraft })

    expect(result.current.getValues().name).toBe('更新値')
    expect(result.current.getValues().email).toBe('updated@example.com')
  })
})
