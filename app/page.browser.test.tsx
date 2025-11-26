import { expect, test, vi } from 'vitest'
import { render } from 'vitest-browser-react'

import { LandingPageContent } from './components/LandingPageContent'

// デフォルトのprops
const defaultProps = {
  hasDraft: false,
  isLoading: false,
  draftUpdatedAt: undefined,
  onStartFresh: vi.fn(),
  onResume: vi.fn(),
}

test('ランディングページが正しくレンダリングされる', async () => {
  const { container } = await render(<LandingPageContent {...defaultProps} />)

  // メインコンテナが存在する
  const mainContainer = container.querySelector('.min-h-screen')
  expect(mainContainer).toBeTruthy()
})

test('タイトルが表示される', async () => {
  const { getByText } = await render(<LandingPageContent {...defaultProps} />)

  // タイトルが表示される
  await expect.element(getByText('Smart Register Demo')).toBeInTheDocument()
})

test('説明文が表示される', async () => {
  const { container } = await render(<LandingPageContent {...defaultProps} />)

  // 説明文の一部が表示される
  const description = container.textContent
  expect(description).toContain('Next.js, IndexedDB, Zod')
})

test('注意事項が表示される', async () => {
  const { container } = await render(<LandingPageContent {...defaultProps} />)

  // 注意事項が表示される
  const notice = container.textContent
  expect(notice).toContain('IndexedDB に一時保存されますが')
})

test('新規登録ボタンが表示される', async () => {
  const { getByText } = await render(<LandingPageContent {...defaultProps} />)

  // 新規登録ボタンが表示される
  await expect.element(getByText('登録をスタート')).toBeInTheDocument()
})

test('続きから再開ボタンが表示される', async () => {
  const { getByText } = await render(<LandingPageContent {...defaultProps} />)

  // 続きから再開ボタンが表示される
  await expect.element(getByText('入力を再開する')).toBeInTheDocument()
})

test('アイコンが表示される', async () => {
  const { container } = await render(<LandingPageContent {...defaultProps} />)

  // SVGアイコンが存在する
  const svgElements = container.querySelectorAll('svg')
  expect(svgElements.length).toBeGreaterThanOrEqual(1)
})

test('カードが2つ表示される', async () => {
  const { container } = await render(<LandingPageContent {...defaultProps} />)

  // 新規登録と続きから再開のカードタイトルが存在する
  const cardTitles = container.textContent
  expect(cardTitles).toContain('新規登録')
  expect(cardTitles).toContain('続きから再開')
})

test('フッターが表示される', async () => {
  const { container } = await render(<LandingPageContent {...defaultProps} />)

  // フッターのテキストが表示される
  const footer = container.querySelector('footer')
  expect(footer).toBeTruthy()
  expect(footer?.textContent).toContain('Built with Next.js App Router')
})

test('技術スタックが表示される', async () => {
  const { container } = await render(<LandingPageContent {...defaultProps} />)

  // 技術スタックのリストが表示される
  const footer = container.textContent
  expect(footer).toContain('TypeScript')
  expect(footer).toContain('Zod')
  expect(footer).toContain('Dexie.js')
  expect(footer).toContain('Shadcn/ui')
})

test('グリッドレイアウトが適用されている', async () => {
  const { container } = await render(<LandingPageContent {...defaultProps} />)

  // グリッドレイアウトのコンテナが存在する
  const gridContainer = container.querySelector('.grid')
  expect(gridContainer).toBeTruthy()
  expect(gridContainer?.classList.contains('grid-cols-1')).toBe(true)
  expect(gridContainer?.classList.contains('md:grid-cols-2')).toBe(true)
})

test('ドラフトがある場合は警告メッセージが表示される', async () => {
  const { container } = await render(<LandingPageContent {...defaultProps} hasDraft={true} />)

  // 警告メッセージが表示される
  const warning = container.textContent
  expect(warning).toContain('保存されているデータは削除されます')
})

test('ドラフトがない場合は保存データなしメッセージが表示される', async () => {
  const { container } = await render(<LandingPageContent {...defaultProps} />)

  // 保存データなしメッセージが表示される
  const message = container.textContent
  expect(message).toContain('保存されたデータはありません')
})

test('ドラフトがある場合は最終更新日時が表示される', async () => {
  const testDate = new Date('2024-12-31T10:30:00')
  const { container } = await render(
    <LandingPageContent {...defaultProps} hasDraft={true} draftUpdatedAt={testDate} />
  )

  // 最終更新日時が表示される
  const message = container.textContent
  expect(message).toContain('最終更新')
})

test('ローディング中はスピナーが表示される', async () => {
  const { container } = await render(<LandingPageContent {...defaultProps} isLoading={true} />)

  // ローディングメッセージが表示される
  const message = container.textContent
  expect(message).toContain('保存データを確認中')
})

test('続きから再開ボタンはドラフトがない場合は無効化される', async () => {
  const { getByText } = await render(<LandingPageContent {...defaultProps} />)

  // ボタンが無効化されている
  const button = getByText('入力を再開する')
  await expect.element(button).toBeDisabled()
})
