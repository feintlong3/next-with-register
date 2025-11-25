import { ArrowLeft, CheckCircle2, FileText, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { type RegisterDraft } from '@/lib/db'
import { getDocumentLabel } from '@/lib/utils/document-labels'

import { ImagePreview } from './ImagePreview'

interface ConfirmationViewProps {
  draft: RegisterDraft
  isSubmitting: boolean
  onSubmit: () => void
  onBack: () => void
}

/**
 * 確認画面のメインビュー (Presentational)
 * - 基本情報の表示
 * - 書類情報の表示
 * - 画像プレビュー
 * - 修正/確定ボタン
 */
export function ConfirmationView({ draft, isSubmitting, onSubmit, onBack }: ConfirmationViewProps) {
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
        <Button variant='outline' onClick={onBack} disabled={isSubmitting}>
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
