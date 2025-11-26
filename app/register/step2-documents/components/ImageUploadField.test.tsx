import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, test, vi } from 'vitest'

import { Form } from '@/components/ui/form'
import { type DocumentSchema, documentSchema } from '@/lib/schema/register-schema'

import { ImageUploadField } from './ImageUploadField'

// テスト用のラッパーコンポーネント
function TestWrapper({
  name = 'frontImage' as const,
  label = '表面画像',
  handleImageDelete = vi.fn(),
  defaultFile,
}: {
  name?: 'frontImage' | 'backImage'
  label?: string
  handleImageDelete?: (fieldName: 'frontImage' | 'backImage') => Promise<void>
  defaultFile?: File
}) {
  const form = useForm<DocumentSchema>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentType: 'drivers_license',
      licenseNumber: '',
      frontImage: defaultFile,
      backImage: undefined,
    },
  })

  return (
    <Form {...form}>
      <ImageUploadField
        form={form}
        name={name}
        label={label}
        handleImageDelete={handleImageDelete}
      />
    </Form>
  )
}

describe('ImageUploadField', () => {
  test('コンポーネントが正しくレンダリングされる', () => {
    const { container } = render(<TestWrapper />)

    // FormItemが存在する
    const formItem = container.querySelector('[data-slot="form-item"]')
    expect(formItem).toBeTruthy()
  })

  test('ラベルが表示される', () => {
    render(<TestWrapper label='表面画像' />)

    // ラベルが表示される
    const labels = screen.getAllByText('表面画像')
    expect(labels.length).toBeGreaterThan(0)
  })

  test('未選択時のUIが表示される', () => {
    const { container } = render(<TestWrapper />)

    // アップロードアイコンが表示される
    const uploadText = screen.getAllByText('クリックして画像を選択')
    expect(uploadText.length).toBeGreaterThan(0)

    // ファイル入力が存在する
    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).toBeTruthy()
  })

  test('ファイル入力のaccept属性が設定されている', () => {
    const { container } = render(<TestWrapper />)

    // ファイル入力のaccept属性が"image/*"である
    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput?.getAttribute('accept')).toBe('image/*')
  })

  test('アップロードアイコンが表示される', () => {
    const { container } = render(<TestWrapper />)

    // SVGアイコンが存在する
    const svgElements = container.querySelectorAll('svg')
    expect(svgElements.length).toBeGreaterThanOrEqual(1)
  })

  test('点線のボーダーが適用されている', () => {
    const { container } = render(<TestWrapper />)

    // border-dashedクラスが適用されている
    const dashedBorder = container.querySelector('.border-dashed')
    expect(dashedBorder).toBeTruthy()
  })

  test('カスタムラベルが正しく表示される', () => {
    render(<TestWrapper label='裏面画像' />)

    // カスタムラベルが表示される
    const labels = screen.getAllByText('裏面画像')
    expect(labels.length).toBeGreaterThan(0)
  })

  test('別のname属性でレンダリングできる', () => {
    const { container } = render(<TestWrapper name='backImage' />)

    // コンポーネントが正しくレンダリングされる
    const formItem = container.querySelector('[data-slot="form-item"]')
    expect(formItem).toBeTruthy()
  })

  test('ホバー効果のクラスが適用されている', () => {
    const { container } = render(<TestWrapper />)

    // hover:bg-slate-50クラスが適用されている
    const hoverElement = container.querySelector('.hover\\:bg-slate-50')
    expect(hoverElement).toBeTruthy()
  })

  test('inputが非表示（opacity-0）になっている', () => {
    const { container } = render(<TestWrapper />)

    // opacity-0クラスが適用されている
    const hiddenInput = container.querySelector('.opacity-0')
    expect(hiddenInput).toBeTruthy()
  })

  test('複数のフィールドを同時にレンダリングできる', () => {
    render(
      <>
        <TestWrapper name='frontImage' label='表面画像' />
        <TestWrapper name='backImage' label='裏面画像' />
      </>
    )

    // 両方のフィールドが表示される
    const frontLabels = screen.getAllByText('表面画像')
    const backLabels = screen.getAllByText('裏面画像')
    expect(frontLabels.length).toBeGreaterThan(0)
    expect(backLabels.length).toBeGreaterThan(0)
  })
})
