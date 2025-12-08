import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, test, vi } from 'vitest'

import { Form } from '@/components/ui/form'
import { type DocumentSchema, documentSchema } from '@/lib/schema/register-schema'

import { MyNumberForm } from './MyNumberForm'

// テスト用のラッパーコンポーネント
function TestWrapper({
  defaultValues,
  imageKeys = { frontImage: 0, backImage: 0 },
  onImageDelete = vi.fn(),
}: {
  defaultValues?: Partial<DocumentSchema>
  imageKeys?: { frontImage: number; backImage: number }
  onImageDelete?: (fieldName: 'frontImage' | 'backImage') => Promise<void>
}) {
  const form = useForm<DocumentSchema>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentType: 'my_number',
      myNumber: '',
      expirationDate: undefined,
      frontImage: undefined,
      backImage: undefined,
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <MyNumberForm form={form} imageKeys={imageKeys} onImageDelete={onImageDelete} />
    </Form>
  )
}

describe('MyNumberForm', () => {
  test('コンポーネントが正しくレンダリングされる', () => {
    render(<TestWrapper />)

    // 個人番号フィールドが表示される
    expect(screen.getByLabelText('個人番号 (12桁)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('123456789012')).toBeInTheDocument()

    // 有効期限フィールドが表示される
    expect(screen.getByLabelText('有効期限')).toBeInTheDocument()

    // 画像アップロードフィールドが表示される
    expect(screen.getByText('表面 (顔写真)')).toBeInTheDocument()
    expect(screen.getByText('裏面 (個人番号)')).toBeInTheDocument()
  })

  test('フォームがanimate-inクラスを持つ', () => {
    const { container } = render(<TestWrapper />)

    const formDiv = container.querySelector('.animate-in')
    expect(formDiv).toBeInTheDocument()
    expect(formDiv).toHaveClass('fade-in')
    expect(formDiv).toHaveClass('slide-in-from-top-2')
  })
})
