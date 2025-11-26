import { describe, expect, test } from 'vitest'
import { render } from 'vitest-browser-react'

import { SiteHeader } from './SiteHeader'

describe('SiteHeader', () => {
  test('SiteHeaderが正しくレンダリングされる', async () => {
    const { container } = await render(<SiteHeader />)

    // ヘッダー要素が存在する
    const header = container.querySelector('header')
    expect(header).toBeTruthy()
  })

  test('ロゴとアプリ名が表示される', async () => {
    const { getByText } = await render(<SiteHeader />)

    // アプリ名が表示される
    await expect.element(getByText('Smart Register Demo')).toBeInTheDocument()
  })

  test('ホームへのリンクが2つ存在する', async () => {
    const { container } = await render(<SiteHeader />)

    // / へのリンクが存在する
    const links = container.querySelectorAll('a[href="/"]')
    expect(links.length).toBe(2) // ロゴとTOPへ戻るボタン
  })

  test('TOPへ戻るボタンが表示される', async () => {
    const { getByText } = await render(<SiteHeader />)

    // TOPへ戻るボタンのテキストが表示される
    await expect.element(getByText('TOPへ戻る')).toBeInTheDocument()
  })

  test('自動保存メッセージが表示される', async () => {
    const { getByText } = await render(<SiteHeader />)

    // 自動保存メッセージが表示される
    await expect.element(getByText('データは自動保存されています')).toBeInTheDocument()
  })

  test('アイコンが表示される', async () => {
    const { container } = await render(<SiteHeader />)

    // FileCheckアイコンとHomeアイコンのSVGが存在する
    const svgElements = container.querySelectorAll('svg')
    expect(svgElements.length).toBeGreaterThanOrEqual(2)
  })

  test('ヘッダーにstickyクラスが適用されている', async () => {
    const { container } = await render(<SiteHeader />)

    const header = container.querySelector('header')
    expect(header?.classList.contains('sticky')).toBe(true)
    expect(header?.classList.contains('top-0')).toBe(true)
  })

  test('コンテナの最大幅が設定されている', async () => {
    const { container } = await render(<SiteHeader />)

    const innerContainer = container.querySelector('.max-w-4xl')
    expect(innerContainer).toBeTruthy()
  })
})
