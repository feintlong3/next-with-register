import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, test, vi } from 'vitest'

import { Form } from '@/components/ui/form'
import { type DocumentSchema, documentSchema } from '@/lib/schema/register-schema'

import { PassportForm } from './PassportForm'

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
      documentType: 'passport',
      passportNumber: '',
      frontImage: undefined,
      backImage: undefined,
      ...defaultValues,
    } as DocumentSchema,
  })

  return (
    <Form {...form}>
      <PassportForm form={form} imageKeys={imageKeys} onImageDelete={onImageDelete} />
    </Form>
  )
}

describe('PassportForm', () => {
  test('コンポーネントが正しくレンダリングされる', () => {
    render(<TestWrapper />)

    // 旅券番号フィールドが表示される
    expect(screen.getByLabelText('旅券番号')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('TK1234567')).toBeInTheDocument()

    // 画像アップロードフィールドが表示される（パスポートは1つだけ）
    expect(screen.getByText('顔写真ページ')).toBeInTheDocument()
  })

  test('フォームがanimate-inクラスを持つ', () => {
    const { container } = render(<TestWrapper />)

    const formDiv = container.querySelector('.animate-in')
    expect(formDiv).toBeInTheDocument()
    expect(formDiv).toHaveClass('fade-in')
    expect(formDiv).toHaveClass('slide-in-from-top-2')
  })
})
