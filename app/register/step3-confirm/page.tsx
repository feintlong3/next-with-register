'use client'

import { AlertCircle, ArrowLeft, CheckCircle2, FileText, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useFormSubmit } from '@/lib/hooks/useFormSubmit'
import { useRegisterDraft } from '@/lib/hooks/useRegisterDraft'

export default function Step3ConfirmPage() {
  const router = useRouter()
  const { draft, isLoading } = useRegisterDraft()

  // フォーム送信処理
  const { isSubmitting, handleSubmit } = useFormSubmit({
    onSuccess: () => router.push('/'),
    successMessage: '申請を受け付けました！',
    errorMessage: '送信に失敗しました。',
  })

  const onSubmit = () => handleSubmit(draft)

  // ローディング中
  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    )
  }

  // データがない場合（直接URLを叩いた場合など）
  if (!draft) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[300px] text-slate-500 gap-4'>
        <AlertCircle className='w-10 h-10 text-red-500' />
        <p>
          申請データが見つかりません。
          <br />
          最初からやり直してください。
        </p>
        <Button onClick={() => router.push('/register/step1-basic')}>Step 1 へ戻る</Button>
      </div>
    )
  }

  return (
    <Card className='w-full max-w-2xl mx-auto border-blue-200 shadow-md animate-in fade-in zoom-in-95 duration-500'>
      <CardHeader className='bg-blue-50/50 rounded-t-xl border-b'>
        <CardTitle className='flex items-center gap-2 text-blue-800'>
          <FileText className='w-5 h-5' />
          最終確認
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-8 pt-8'>
        {/* 基本情報セクション */}
        <section>
          <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-blue-500 pl-2'>
            基本情報
          </h3>
          <dl className='grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm'>
            <div>
              <dt className='text-slate-500 mb-1'>氏名</dt>
              <dd className='font-medium text-slate-900'>{draft.fullName}</dd>
            </div>
            <div>
              <dt className='text-slate-500 mb-1'>メールアドレス</dt>
              <dd className='font-medium text-slate-900'>{draft.email}</dd>
            </div>
            <div>
              <dt className='text-slate-500 mb-1'>電話番号</dt>
              <dd className='font-medium text-slate-900'>{draft.phoneNumber}</dd>
            </div>
            <div className='sm:col-span-2'>
              <dt className='text-slate-500 mb-1'>住所</dt>
              <dd className='font-medium text-slate-900'>{draft.address}</dd>
            </div>
          </dl>
        </section>

        <Separator />

        {/* 書類情報セクション */}
        <section>
          <h3 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-l-4 border-blue-500 pl-2'>
            本人確認書類：{getDocumentLabel(draft.documentType)}
          </h3>

          <div className='space-y-6'>
            {/* テキスト情報（条件分岐） */}
            <dl className='grid grid-cols-1 gap-4 text-sm'>
              {draft.documentType === 'drivers_license' && (
                <div>
                  <dt className='text-slate-500 mb-1'>免許証番号</dt>
                  <dd className='font-mono text-lg tracking-wider'>{draft.licenseNumber}</dd>
                </div>
              )}
              {draft.documentType === 'passport' && (
                <div>
                  <dt className='text-slate-500 mb-1'>旅券番号</dt>
                  <dd className='font-mono text-lg tracking-wider'>{draft.passportNumber}</dd>
                </div>
              )}
              {draft.documentType === 'my_number' && (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <dt className='text-slate-500 mb-1'>個人番号</dt>
                    <dd className='font-mono text-lg tracking-wider'>{draft.myNumber}</dd>
                  </div>
                  <div>
                    <dt className='text-slate-500 mb-1'>有効期限</dt>
                    <dd>
                      {draft.expirationDate
                        ? new Date(draft.expirationDate).toLocaleDateString()
                        : '-'}
                    </dd>
                  </div>
                </div>
              )}
            </dl>

            {/* 画像プレビュー */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {/* 表面（全タイプ共通で必須） */}
              {draft.frontImage && <ImagePreview file={draft.frontImage} label='表面' />}

              {/* 裏面（パスポート以外は必須） */}
              {draft.documentType !== 'passport' && draft.backImage && (
                <ImagePreview file={draft.backImage} label='裏面' />
              )}
            </div>
          </div>
        </section>
      </CardContent>

      <CardFooter className='flex justify-between border-t pt-6 bg-slate-50/50 rounded-b-xl'>
        <Button
          variant='outline'
          onClick={() => router.push('/register/step2-documents')}
          disabled={isSubmitting}
        >
          <ArrowLeft className='mr-2 w-4 h-4' /> 修正する
        </Button>

        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className='bg-blue-600 hover:bg-blue-700 min-w-40'
        >
          {isSubmitting ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' /> 送信中...
            </>
          ) : (
            <>
              申請を確定する <CheckCircle2 className='ml-2 w-4 h-4' />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

// --- ヘルパー関数 & コンポーネント ---

function getDocumentLabel(type: string | undefined) {
  switch (type) {
    case 'drivers_license':
      return '運転免許証'
    case 'my_number':
      return 'マイナンバーカード'
    case 'passport':
      return 'パスポート'
    default:
      return '未選択'
  }
}

// 画像プレビュー用サブコンポーネント
function ImagePreview({ file, label }: { file: File | Blob; label: string }) {
  // 注: 実務ではメモリリーク防止のため useEffect で createObjectURL / revokeObjectURL を管理するのがベストですが、
  // Step間の移動でコンポーネントが破棄されるため、簡易実装としてインラインで使用しています。
  const url = URL.createObjectURL(file)

  return (
    <div className='border rounded-lg p-3 bg-white shadow-sm'>
      <p className='text-xs text-slate-500 mb-2 font-medium'>{label}</p>
      <div className='aspect-video w-full bg-slate-100 rounded border overflow-hidden flex items-center justify-center relative'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={label} className='w-full h-full object-contain' />
      </div>
      <p className='text-[10px] text-slate-400 mt-1 truncate text-center'>
        {(file as File).name || 'image.jpg'}
      </p>
    </div>
  )
}
