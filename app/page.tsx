'use client'

import { ArrowRight, FileCheck, History, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getDb } from '@/lib/db'
import { DRAFT_ID, useRegisterDraft } from '@/lib/hooks/useRegisterDraft'

// 日付整形ヘルパー関数
const formatUpdateDate = (date: Date) => {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default function LandingPage() {
  const router = useRouter()

  // カスタムフックを使ってIndexedDBの状態を監視
  const { draft, isLoading } = useRegisterDraft()

  // ドラフトが存在するかどうかの判定
  const hasDraft = !!draft

  // 「新規登録」ボタンの処理
  const handleStartFresh = async () => {
    try {
      const db = getDb()
      // 既存のデータを明示的に削除
      await db.registerData.delete(DRAFT_ID)
      router.push('/register/step1-basic')
    } catch (error) {
      console.error('Failed to delete draft:', error)
      // エラーでも遷移はさせる
      router.push('/register/step1-basic')
    }
  }

  // 「続きから」ボタンの処理
  const handleResume = () => {
    router.push('/register/step1-basic')
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 p-4'>
      <div className='max-w-4xl w-full space-y-10 text-center'>
        {/* --- ヒーローセクション --- */}
        <section className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700'>
          <div className='mx-auto bg-white p-4 rounded-full w-20 h-20 flex items-center justify-center shadow-sm mb-6'>
            <FileCheck className='w-10 h-10 text-blue-600' />
          </div>
          <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900'>
            Smart Register Demo
          </h1>
          <p className='text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed'>
            このデモは、Next.js, IndexedDB, Zod を活用した
            <br className='hidden sm:inline' />
            セキュアで高機能なフォームの実現例を示すデモです。
          </p>
          <span className='text-xs text-slate-400'>
            ※入力されたデータはブラウザ内の IndexedDB に一時保存されますが、
            <br className='hidden sm:inline' />
            実際に外部サーバーへ送信されることはありません。
          </span>
        </section>

        {/* --- アクションカードエリア --- */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto'>
          {/* 1. 新規登録カード */}
          <Card className='group hover:shadow-lg transition-all duration-300 border-blue-100 hover:border-blue-300'>
            <CardHeader>
              <CardTitle className='text-xl'>新規登録</CardTitle>
              <CardDescription>新しく手続きを開始します</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleStartFresh}
                size='lg'
                className='w-full bg-blue-600 hover:bg-blue-700 transition-colors'
              >
                登録をスタート <ArrowRight className='ml-2 w-4 h-4' />
              </Button>
              {/* 補足: ドラフトがある場合、ここを押すと消えることを注釈 */}
              {hasDraft && (
                <p className='text-xs text-red-500 mt-3 flex items-center justify-center gap-1'>
                  <Trash2 className='w-3 h-3' />
                  保存されているデータは削除されます
                </p>
              )}
            </CardContent>
          </Card>

          {/* 2. 続きから再開カード */}
          <Card
            className={`transition-all duration-300 ${
              !hasDraft
                ? 'opacity-60 bg-slate-50 cursor-not-allowed'
                : 'hover:shadow-lg border-green-100 hover:border-green-300 bg-white'
            }`}
          >
            <CardHeader>
              <CardTitle className='text-xl flex items-center justify-center gap-2'>
                <History className='w-5 h-5' />
                続きから再開
              </CardTitle>
              <CardDescription className='min-h-5'>
                {isLoading ? (
                  <span className='flex items-center justify-center gap-2 text-blue-600'>
                    <Loader2 className='w-3 h-3 animate-spin' /> 保存データを確認中...
                  </span>
                ) : hasDraft ? (
                  <span className='text-slate-600 font-medium text-sm'>
                    最終更新: {draft!.updatedAt && formatUpdateDate(draft!.updatedAt)}
                  </span>
                ) : (
                  '保存されたデータはありません'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleResume}
                variant={hasDraft ? 'default' : 'outline'}
                className={`w-full ${
                  hasDraft
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                    : 'text-slate-400 border-slate-200'
                }`}
                disabled={!hasDraft || isLoading}
              >
                入力を再開する
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* --- フッター (技術スタック) --- */}
        <footer className='pt-10 border-t border-slate-200/60 mt-12'>
          <p className='text-xs text-slate-400 font-mono'>
            Built with Next.js App Router • TypeScript • Zod • Dexie.js • Shadcn/ui
          </p>
        </footer>
      </div>
    </div>
  )
}
