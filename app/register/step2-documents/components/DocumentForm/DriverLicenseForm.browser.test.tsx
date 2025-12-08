import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, test, vi } from 'vitest'

import { Form } from '@/components/ui/form'
import { type DocumentSchema, documentSchema } from '@/lib/schema/register-schema'

import { DriverLicenseForm } from './DriverLicenseForm'

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
      documentType: 'drivers_license',
      licenseNumber: '',
      frontImage: undefined,
      backImage: undefined,
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <DriverLicenseForm form={form} imageKeys={imageKeys} onImageDelete={onImageDelete} />
    </Form>
  )
}

describe('DriverLicenseForm', () => {
  test('コンポーネントが正しくレンダリングされる', () => {
    render(<TestWrapper />)

    // 免許証番号フィールドが表示される
    expect(screen.getByLabelText('免許証番号 (12桁)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('123456789012')).toBeInTheDocument()

    // 説明文が表示される
    expect(screen.getByText('ハイフンなしで入力してください')).toBeInTheDocument()

    // 画像アップロードフィールドが表示される
    expect(screen.getByText('表面画像')).toBeInTheDocument()
    expect(screen.getByText('裏面画像')).toBeInTheDocument()
  })

  test('フォームがanimate-inクラスを持つ', () => {
    const { container } = render(<TestWrapper />)

    const formDiv = container.querySelector('.animate-in')
    expect(formDiv).toBeInTheDocument()
    expect(formDiv).toHaveClass('fade-in')
    expect(formDiv).toHaveClass('slide-in-from-top-2')
  })
})
