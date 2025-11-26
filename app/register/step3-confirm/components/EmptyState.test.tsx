import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  test('コンポーネントが正しくレンダリングされる', () => {
    const { container } = render(<EmptyState onBackToStep1={() => {}} />)

    // メインコンテナが存在する
    const mainContainer = container.querySelector('.min-h-\\[300px\\]')
    expect(mainContainer).toBeTruthy()
  })

  test('エラーアイコンが表示される', () => {
    const { container } = render(<EmptyState onBackToStep1={() => {}} />)

    // SVGアイコンが存在する
    const svgElements = container.querySelectorAll('svg')
    expect(svgElements.length).toBeGreaterThanOrEqual(1)
  })

  test('エラーメッセージが表示される', () => {
    const { container } = render(<EmptyState onBackToStep1={() => {}} />)

    // エラーメッセージの一部が表示される
    const text = container.textContent
    expect(text).toContain('申請データが見つかりません')
    expect(text).toContain('最初からやり直してください')
  })

  test('Step 1 へ戻るボタンが表示される', () => {
    render(<EmptyState onBackToStep1={() => {}} />)

    // ボタンが表示される
    const buttons = screen.getAllByText('Step 1 へ戻る')
    expect(buttons.length).toBeGreaterThan(0)
  })

  test('ボタンクリック時にonBackToStep1が呼ばれる', () => {
    const onBackToStep1 = vi.fn()
    const { container } = render(<EmptyState onBackToStep1={onBackToStep1} />)

    // ボタンをクリック（最初のボタン要素を取得）
    const button = container.querySelector('button')
    expect(button).toBeTruthy()
    fireEvent.click(button!)

    // コールバックが呼ばれることを確認（React Strict Modeで2回呼ばれる可能性がある）
    expect(onBackToStep1).toHaveBeenCalled()
  })

  test('中央揃えのレイアウトが適用されている', () => {
    const { container } = render(<EmptyState onBackToStep1={() => {}} />)

    // flex、items-center、justify-centerクラスが適用されている
    const mainContainer = container.querySelector('.flex')
    expect(mainContainer).toBeTruthy()
    expect(mainContainer?.classList.contains('items-center')).toBe(true)
    expect(mainContainer?.classList.contains('justify-center')).toBe(true)
  })

  test('エラーアイコンに赤色のスタイルが適用されている', () => {
    const { container } = render(<EmptyState onBackToStep1={() => {}} />)

    // text-red-500クラスが適用されている
    const redIcon = container.querySelector('.text-red-500')
    expect(redIcon).toBeTruthy()
  })

  test('テキストがグレーのスタイルになっている', () => {
    const { container } = render(<EmptyState onBackToStep1={() => {}} />)

    // text-slate-500クラスが適用されている
    const greyText = container.querySelector('.text-slate-500')
    expect(greyText).toBeTruthy()
  })

  test('適切な余白とギャップが設定されている', () => {
    const { container } = render(<EmptyState onBackToStep1={() => {}} />)

    // gap-4クラスが適用されている
    const gapContainer = container.querySelector('.gap-4')
    expect(gapContainer).toBeTruthy()
  })
})
