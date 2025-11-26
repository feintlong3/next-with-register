import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { type RegisterDraft } from '@/lib/db'

import { ConfirmationView } from './ConfirmationView'

// URL.createObjectURLとURL.revokeObjectURLをモック
beforeEach(() => {
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  globalThis.URL.revokeObjectURL = vi.fn()
})

// テスト用のモックデータ
const mockDraftBase = {
  id: '1',
  sessionId: 'test-session',
  fullName: '山田 太郎',
  email: 'test@example.com',
  phoneNumber: '09012345678',
  address: '東京都渋谷区...',
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockDraftDriversLicense: RegisterDraft = {
  ...mockDraftBase,
  documentType: 'drivers_license',
  licenseNumber: '123456789012',
  frontImage: new File(['front'], 'front.jpg', { type: 'image/jpeg' }),
  backImage: new File(['back'], 'back.jpg', { type: 'image/jpeg' }),
}

const mockDraftPassport: RegisterDraft = {
  ...mockDraftBase,
  documentType: 'passport',
  passportNumber: 'TK1234567',
  frontImage: new File(['front'], 'passport.jpg', { type: 'image/jpeg' }),
}

const mockDraftMyNumber: RegisterDraft = {
  ...mockDraftBase,
  documentType: 'my_number',
  myNumber: '123456789012',
  expirationDate: new Date('2030-12-31'),
  frontImage: new File(['front'], 'front.jpg', { type: 'image/jpeg' }),
  backImage: new File(['back'], 'back.jpg', { type: 'image/jpeg' }),
}

describe('ConfirmationView', () => {
  test('運転免許証のデータが正しく表示される', async () => {
    const { container } = await render(
      <ConfirmationView
        draft={mockDraftDriversLicense}
        isSubmitting={false}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )

    // タイトルが表示される
    const title = container.textContent
    expect(title).toContain('最終確認')

    // 基本情報が表示される
    expect(title).toContain('山田 太郎')
    expect(title).toContain('test@example.com')
    expect(title).toContain('09012345678')

    // 書類情報が表示される
    expect(title).toContain('運転免許証')
    expect(title).toContain('123456789012')
  })

  test('パスポートのデータが正しく表示される', async () => {
    const { container } = await render(
      <ConfirmationView
        draft={mockDraftPassport}
        isSubmitting={false}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )

    const text = container.textContent
    expect(text).toContain('パスポート')
    expect(text).toContain('TK1234567')
  })

  test('マイナンバーカードのデータが正しく表示される', async () => {
    const { container } = await render(
      <ConfirmationView
        draft={mockDraftMyNumber}
        isSubmitting={false}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )

    const text = container.textContent
    expect(text).toContain('マイナンバーカード')
    expect(text).toContain('123456789012')
    expect(text).toContain('2030')
  })

  test('ボタンが表示される', async () => {
    const { getByText } = await render(
      <ConfirmationView
        draft={mockDraftDriversLicense}
        isSubmitting={false}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )

    // ボタンが表示される
    await expect.element(getByText('修正する')).toBeInTheDocument()
    await expect.element(getByText('申請を確定する')).toBeInTheDocument()
  })

  test('送信中はローディング状態が表示される', async () => {
    const { getByText } = await render(
      <ConfirmationView
        draft={mockDraftDriversLicense}
        isSubmitting={true}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )

    // ローディング中のテキストが表示される
    await expect.element(getByText('送信中...')).toBeInTheDocument()
  })

  test('送信中はボタンが無効化される', async () => {
    const { getByText } = await render(
      <ConfirmationView
        draft={mockDraftDriversLicense}
        isSubmitting={true}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )

    // 修正するボタンが無効化される
    const backButton = getByText('修正する')
    await expect.element(backButton).toBeDisabled()
  })

  test('基本情報セクションが表示される', async () => {
    const { container } = await render(
      <ConfirmationView
        draft={mockDraftDriversLicense}
        isSubmitting={false}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )

    const text = container.textContent
    expect(text).toContain('基本情報')
    expect(text).toContain('氏名')
    expect(text).toContain('メールアドレス')
    expect(text).toContain('電話番号')
    expect(text).toContain('住所')
  })

  test('書類情報セクションが表示される', async () => {
    const { container } = await render(
      <ConfirmationView
        draft={mockDraftDriversLicense}
        isSubmitting={false}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )

    const text = container.textContent
    expect(text).toContain('本人確認書類')
  })

  test('アイコンが表示される', async () => {
    const { container } = await render(
      <ConfirmationView
        draft={mockDraftDriversLicense}
        isSubmitting={false}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )

    // SVGアイコンが存在する
    const svgElements = container.querySelectorAll('svg')
    expect(svgElements.length).toBeGreaterThanOrEqual(1)
  })

  test('カードレイアウトが適用されている', async () => {
    const { container } = await render(
      <ConfirmationView
        draft={mockDraftDriversLicense}
        isSubmitting={false}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )

    // max-w-2xlクラスが適用されている
    const card = container.querySelector('.max-w-2xl')
    expect(card).toBeTruthy()
  })

  test('アニメーションクラスが適用されている', async () => {
    const { container } = await render(
      <ConfirmationView
        draft={mockDraftDriversLicense}
        isSubmitting={false}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )

    // animate-inクラスが適用されている
    const animated = container.querySelector('.animate-in')
    expect(animated).toBeTruthy()
  })

  test('グリッドレイアウトが適用されている', async () => {
    const { container } = await render(
      <ConfirmationView
        draft={mockDraftDriversLicense}
        isSubmitting={false}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )

    // グリッドレイアウトが存在する
    const grid = container.querySelector('.grid')
    expect(grid).toBeTruthy()
  })

  test('セパレーターが表示される', async () => {
    const { container } = await render(
      <ConfirmationView
        draft={mockDraftDriversLicense}
        isSubmitting={false}
        onSubmit={() => {}}
        onBack={() => {}}
      />
    )

    // セパレーター要素が存在する
    const separator = container.querySelector('[data-slot="separator"]')
    expect(separator).toBeTruthy()
  })
})
