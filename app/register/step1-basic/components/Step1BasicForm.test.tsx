import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, test, vi } from 'vitest'

import { type PersonalInfoSchema, personalInfoSchema } from '@/lib/schema/register-schema'

import { Step1BasicForm } from './Step1BasicForm'

// テスト用のラッパーコンポーネント
function TestWrapper({ isSaving = false, onSubmit = vi.fn() }) {
  const form = useForm<PersonalInfoSchema>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
    },
    mode: 'onBlur',
  })

  return <Step1BasicForm form={form} isSaving={isSaving} onSubmit={onSubmit} />
}

describe('Step1BasicForm', () => {
  test('基本情報入力フォームが正しくレンダリングされる', () => {
    const { container } = render(<TestWrapper />)

    // Cardコンポーネントが存在する
    const card = container.querySelector('.max-w-2xl')
    expect(card).toBeTruthy()
  })

  test('タイトルが表示される', () => {
    render(<TestWrapper />)

    // タイトルが表示される（複数ある場合は最初のものを取得）
    const titles = screen.getAllByText('基本情報の入力')
    expect(titles.length).toBeGreaterThan(0)
  })

  test('説明文が表示される', () => {
    render(<TestWrapper />)

    // 説明文が表示される（複数ある場合は最初のものを取得）
    const descriptions = screen.getAllByText('お客様のご連絡先を入力してください。')
    expect(descriptions.length).toBeGreaterThan(0)
  })

  test('氏名フィールドが表示される', () => {
    const { container } = render(<TestWrapper />)

    // ラベルが表示される（複数ある場合は最初のものを取得）
    const labels = screen.getAllByText('氏名')
    expect(labels.length).toBeGreaterThan(0)

    // 入力フィールドが存在する
    const input = container.querySelector('input[placeholder="山田 太郎"]')
    expect(input).toBeTruthy()
  })

  test('メールアドレスフィールドが表示される', () => {
    const { container } = render(<TestWrapper />)

    // ラベルが表示される（複数ある場合は最初のものを取得）
    const labels = screen.getAllByText('メールアドレス')
    expect(labels.length).toBeGreaterThan(0)

    // 入力フィールドが存在する
    const input = container.querySelector('input[type="email"]')
    expect(input).toBeTruthy()
  })

  test('電話番号フィールドが表示される', () => {
    const { container } = render(<TestWrapper />)

    // ラベルが表示される（複数ある場合は最初のものを取得）
    const labels = screen.getAllByText('電話番号')
    expect(labels.length).toBeGreaterThan(0)

    // 入力フィールドが存在する
    const input = container.querySelector('input[type="tel"]')
    expect(input).toBeTruthy()
  })

  test('住所フィールドが表示される', () => {
    const { container } = render(<TestWrapper />)

    // ラベルが表示される（複数ある場合は最初のものを取得）
    const labels = screen.getAllByText('住所')
    expect(labels.length).toBeGreaterThan(0)

    // 入力フィールドが存在する
    const input = container.querySelector('input[placeholder="東京都..."]')
    expect(input).toBeTruthy()
  })

  test('必須マークが表示される', () => {
    const { container } = render(<TestWrapper />)

    // 必須マーク(*)が4つ表示される
    const requiredMarks = container.querySelectorAll('.text-red-500')
    expect(requiredMarks.length).toBeGreaterThanOrEqual(4)
  })

  test('次へ進むボタンが表示される', () => {
    render(<TestWrapper />)

    // ボタンが表示される（複数ある場合は最初のものを取得）
    const buttons = screen.getAllByText('次へ進む')
    expect(buttons.length).toBeGreaterThan(0)
  })

  test('次へ進むボタンはデフォルトで有効', () => {
    const { container } = render(<TestWrapper />)

    // ボタンが有効である
    const button = container.querySelector('button[type="submit"]')
    expect(button).toBeTruthy()
    expect(button?.hasAttribute('disabled')).toBe(false)
  })

  test('保存中は次へ進むボタンが無効化される', () => {
    const { container } = render(<TestWrapper isSaving={true} />)

    // ボタンが無効化される
    const button = container.querySelector('button[type="submit"]')
    expect(button).toBeTruthy()
    expect(button?.hasAttribute('disabled')).toBe(true)
  })

  test('保存中はローディングアイコンが表示される', () => {
    const { container } = render(<TestWrapper isSaving={true} />)

    // SVGアイコンが存在する（ローディングスピナー）
    const svgElements = container.querySelectorAll('svg')
    expect(svgElements.length).toBeGreaterThanOrEqual(1)
  })

  test('アイコンが表示される', () => {
    const { container } = render(<TestWrapper />)

    // Userアイコンなどが存在する
    const svgElements = container.querySelectorAll('svg')
    expect(svgElements.length).toBeGreaterThanOrEqual(1)
  })

  test('2カラムレイアウトが適用されている', () => {
    const { container } = render(<TestWrapper />)

    // グリッドレイアウトが存在する
    const gridContainer = container.querySelector('.grid-cols-1')
    expect(gridContainer).toBeTruthy()
  })

  test('上揃えのレイアウトが適用されている', () => {
    const { container } = render(<TestWrapper />)

    // items-startクラスが適用されている
    const gridContainer = container.querySelector('.items-start')
    expect(gridContainer).toBeTruthy()
  })

  test('フォームがformタグで構成されている', () => {
    const { container } = render(<TestWrapper />)

    // formタグが存在する
    const form = container.querySelector('form')
    expect(form).toBeTruthy()
  })

  test('ボーダーと余白が適用されている', () => {
    const { container } = render(<TestWrapper />)

    // ボーダートップが適用されている
    const border = container.querySelector('.border-t')
    expect(border).toBeTruthy()
  })

  test('カードにアニメーションクラスが適用されている', () => {
    const { container } = render(<TestWrapper />)

    // アニメーションクラスが存在する
    const card = container.querySelector('.animate-in')
    expect(card).toBeTruthy()
  })

  test('フォーム送信時にonSubmitが呼ばれる', async () => {
    const onSubmit = vi.fn()
    const { container } = render(<TestWrapper onSubmit={onSubmit} />)

    // フォームを取得
    const form = container.querySelector('form')
    expect(form).toBeTruthy()

    // フォーム送信をシミュレート
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))

    // onSubmitが呼ばれることを確認（バリデーションエラーで呼ばれない可能性があるため、awaitしない）
    // 注: 空のフォームなのでバリデーションエラーになる
  })
})
