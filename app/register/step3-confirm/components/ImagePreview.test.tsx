import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { ImagePreview } from './ImagePreview'

// URL.createObjectURLとURL.revokeObjectURLをモック
const mockObjectURL = 'blob:mock-url'
const createObjectURLMock = vi.fn(() => mockObjectURL)
const revokeObjectURLMock = vi.fn()

describe('ImagePreview', () => {
  beforeEach(() => {
    // グローバルなURL APIをモック
    global.URL.createObjectURL = createObjectURLMock
    global.URL.revokeObjectURL = revokeObjectURLMock
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('コンポーネントが正しくレンダリングされる', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { container } = render(<ImagePreview file={mockFile} label='テスト画像' />)

    // メインコンテナが存在する
    const mainContainer = container.querySelector('.border')
    expect(mainContainer).toBeTruthy()
  })

  test('ラベルが表示される', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { container } = render(<ImagePreview file={mockFile} label='表面画像' />)

    // ラベルが表示される
    const text = container.textContent
    expect(text).toContain('表面画像')
  })

  test('画像が表示される', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { container } = render(<ImagePreview file={mockFile} label='テスト画像' />)

    // img要素が存在する
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('src')).toBe(mockObjectURL)
  })

  test('ファイル名が表示される', () => {
    const mockFile = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' })
    const { container } = render(<ImagePreview file={mockFile} label='テスト画像' />)

    // ファイル名が表示される
    const text = container.textContent
    expect(text).toContain('test-image.jpg')
  })

  test('URL.createObjectURLが呼ばれる', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    render(<ImagePreview file={mockFile} label='テスト画像' />)

    // createObjectURLが呼ばれることを確認
    expect(createObjectURLMock).toHaveBeenCalledWith(mockFile)
  })

  test('コンポーネントのアンマウント時にURL.revokeObjectURLが呼ばれる', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { unmount } = render(<ImagePreview file={mockFile} label='テスト画像' />)

    // アンマウント
    unmount()

    // revokeObjectURLが呼ばれることを確認
    expect(revokeObjectURLMock).toHaveBeenCalledWith(mockObjectURL)
  })

  test('aspect-videoクラスが適用されている', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { container } = render(<ImagePreview file={mockFile} label='テスト画像' />)

    // aspect-videoクラスが適用されている
    const aspectVideo = container.querySelector('.aspect-video')
    expect(aspectVideo).toBeTruthy()
  })

  test('画像が中央に配置されている', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { container } = render(<ImagePreview file={mockFile} label='テスト画像' />)

    // items-centerとjustify-centerクラスが適用されている
    const centerContainer = container.querySelector('.items-center.justify-center')
    expect(centerContainer).toBeTruthy()
  })

  test('画像のalt属性が正しく設定されている', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { container } = render(<ImagePreview file={mockFile} label='裏面画像' />)

    // alt属性が正しく設定されている
    const img = container.querySelector('img')
    expect(img?.getAttribute('alt')).toBe('裏面画像')
  })

  test('ボーダーとシャドウが適用されている', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { container } = render(<ImagePreview file={mockFile} label='テスト画像' />)

    // borderとshadow-smクラスが適用されている
    const mainContainer = container.querySelector('.border.shadow-sm')
    expect(mainContainer).toBeTruthy()
  })

  test('ラベルが小さいフォントサイズで表示される', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { container } = render(<ImagePreview file={mockFile} label='テスト画像' />)

    // text-xsクラスが適用されている
    const label = container.querySelector('.text-xs')
    expect(label).toBeTruthy()
  })

  test('ファイル名が省略表示される設定になっている', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const { container } = render(<ImagePreview file={mockFile} label='テスト画像' />)

    // truncateクラスが適用されている
    const fileName = container.querySelector('.truncate')
    expect(fileName).toBeTruthy()
  })
})
