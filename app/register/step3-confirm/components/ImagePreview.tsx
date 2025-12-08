import { useEffect } from 'react'

interface ImagePreviewProps {
  file: File | Blob
  label: string
}

/**
 * 画像プレビューコンポーネント
 * - URL.createObjectURL のメモリ管理を適切に実施
 * - コンポーネントのアンマウント時に URL.revokeObjectURL を呼び出す
 */
export function ImagePreview({ file, label }: ImagePreviewProps) {
  // Object URL を作成
  const objectUrl = URL.createObjectURL(file)

  // クリーンアップ: コンポーネントアンマウント時または objectUrl 変更時に URL を解放
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  return (
    <div className='border rounded-lg p-3 bg-white shadow-sm'>
      <p className='text-xs text-slate-500 mb-2 font-medium'>{label}</p>
      <div className='aspect-video w-full bg-slate-100 rounded border overflow-hidden flex items-center justify-center relative'>
        {objectUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={objectUrl} alt={label} className='w-full h-full object-contain' />
        )}
      </div>
      <p className='text-[10px] text-slate-400 mt-1 truncate text-center'>
        {(file as File).name || 'image.jpg'}
      </p>
    </div>
  )
}
