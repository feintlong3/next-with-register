import { describe, expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  test('コンポーネントが正しくレンダリングされる', async () => {
    const { container } = await render(<EmptyState onBackToStep1={() => {}} />)

    // メインコンテナが存在する
    const mainContainer = container.querySelector('.min-h-\\[300px\\]')
    expect(mainContainer).toBeTruthy()
  })

  test('エラーアイコンが表示される', async () => {
    const { container } = await render(<EmptyState onBackToStep1={() => {}} />)

    // SVGアイコンが存在する
    const svgElements = container.querySelectorAll('svg')
    expect(svgElements.length).toBeGreaterThanOrEqual(1)
  })

  test('エラーメッセージが表示される', async () => {
    const { container } = await render(<EmptyState onBackToStep1={() => {}} />)

    // エラーメッセージの一部が表示される
    const text = container.textContent
    expect(text).toContain('申請データが見つかりません')
    expect(text).toContain('最初からやり直してください')
  })

  test('Step 1 へ戻るボタンが表示される', async () => {
    const { getByText } = await render(<EmptyState onBackToStep1={() => {}} />)

    // ボタンが表示される
    await expect.element(getByText('Step 1 へ戻る')).toBeInTheDocument()
  })

  test('ボタンクリック時にonBackToStep1が呼ばれる', async () => {
    const onBackToStep1 = vi.fn()
    const { getByText } = await render(<EmptyState onBackToStep1={onBackToStep1} />)

    // ボタンをクリック
    const button = getByText('Step 1 へ戻る')
    await button.click()

    // コールバックが呼ばれることを確認
    expect(onBackToStep1).toHaveBeenCalled()
  })

  test('中央揃えのレイアウトが適用されている', async () => {
    const { container } = await render(<EmptyState onBackToStep1={() => {}} />)

    // flex、items-center、justify-centerクラスが適用されている
    const mainContainer = container.querySelector('.flex')
    expect(mainContainer).toBeTruthy()
    expect(mainContainer?.classList.contains('items-center')).toBe(true)
    expect(mainContainer?.classList.contains('justify-center')).toBe(true)
  })

  test('エラーアイコンに赤色のスタイルが適用されている', async () => {
    const { container } = await render(<EmptyState onBackToStep1={() => {}} />)

    // text-red-500クラスが適用されている
    const redIcon = container.querySelector('.text-red-500')
    expect(redIcon).toBeTruthy()
  })

  test('テキストがグレーのスタイルになっている', async () => {
    const { container } = await render(<EmptyState onBackToStep1={() => {}} />)

    // text-slate-500クラスが適用されている
    const greyText = container.querySelector('.text-slate-500')
    expect(greyText).toBeTruthy()
  })

  test('適切な余白とギャップが設定されている', async () => {
    const { container } = await render(<EmptyState onBackToStep1={() => {}} />)

    // gap-4クラスが適用されている
    const gapContainer = container.querySelector('.gap-4')
    expect(gapContainer).toBeTruthy()
  })
})
