import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, test, vi } from 'vitest'

import { Form } from '@/components/ui/form'
import { type DocumentSchema, documentSchema } from '@/lib/schema/register-schema'

import { DocumentFormRenderer } from './DocumentFormRenderer'

// テスト用のラッパーコンポーネント
function TestWrapper({
  documentType,
  defaultValues,
  imageKeys = { frontImage: 0, backImage: 0 },
  onImageDelete = vi.fn(),
}: {
  documentType: DocumentSchema['documentType']
  defaultValues?: Partial<DocumentSchema>
  imageKeys?: { frontImage: number; backImage: number }
  onImageDelete?: (fieldName: 'frontImage' | 'backImage') => Promise<void>
}) {
  const form = useForm<DocumentSchema>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentType,
      licenseNumber: '',
      passportNumber: '',
      myNumber: '',
      expirationDate: undefined,
      frontImage: undefined,
      backImage: undefined,
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <DocumentFormRenderer
        documentType={documentType}
        form={form}
        imageKeys={imageKeys}
        onImageDelete={onImageDelete}
      />
    </Form>
  )
}

describe('DocumentFormRenderer', () => {
  test('documentType="drivers_license"の場合、DriverLicenseFormが表示される', () => {
    render(<TestWrapper documentType='drivers_license' />)

    // 運転免許証特有のフィールドが表示される
    expect(screen.getByLabelText('免許証番号 (12桁)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('123456789012')).toBeInTheDocument()
  })

  test('documentType="passport"の場合、PassportFormが表示される', () => {
    render(<TestWrapper documentType='passport' />)

    // パスポート特有のフィールドが表示される
    expect(screen.getByLabelText('旅券番号')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('TK1234567')).toBeInTheDocument()
  })

  test('documentType="my_number"の場合、MyNumberFormが表示される', () => {
    render(<TestWrapper documentType='my_number' />)

    // マイナンバーカード特有のフィールドが表示される
    expect(screen.getByLabelText('個人番号 (12桁)')).toBeInTheDocument()
    expect(screen.getByLabelText('有効期限')).toBeInTheDocument()
  })

  test('各書類タイプでanimate-inアニメーションが適用される', () => {
    const { container } = render(<TestWrapper documentType='drivers_license' />)

    const formDiv = container.querySelector('.animate-in')
    expect(formDiv).toBeInTheDocument()
    expect(formDiv).toHaveClass('fade-in')
    expect(formDiv).toHaveClass('slide-in-from-top-2')
  })
})
