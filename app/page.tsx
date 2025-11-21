'use client'

import { ArrowRight, FileCheck, History, Loader2 } from 'lucide-react'

// import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRegisterDraft } from '@/lib/hooks/useRegisterDraft'

export default function LandingPage() {
  const { draft, isLoading } = useRegisterDraft()
  // データが存在するかどうかの判定ロジック
  // (draftがundefinedでなければデータありとみなす)
  const hasDraft = !!draft

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-slate-50 to-slate-100 p-4'>
      <div className='max-w-3xl w-full space-y-8 text-center'>
        {/* ヒーローセクション */}
        <div className='space-y-4'>
          <div className='mx-auto bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center shadow-sm'>
            <FileCheck className='w-8 h-8 text-blue-600' />
          </div>
          <h1 className='text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900'>
            Smart Register Demo
          </h1>
          <p className='text-lg text-slate-600 max-w-xl mx-auto'>
            ブラウザ完結型の本人確認書類提出アプリです。
            <br />
            IndexedDBを使用したローカル保存により、サーバー通信なしで安全にドラフト保存が可能です。
          </p>
        </div>

        {/* アクションエリア */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-10'>
          {/* 新規登録カード */}
          <Card className='hover:shadow-md transition-shadow border-blue-100'>
            <CardHeader>
              <CardTitle>新規登録</CardTitle>
              <CardDescription>新しく本人確認を始めます</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className='w-full' size='lg'>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href='/'>
                  登録をスタート <ArrowRight className='ml-2 w-4 h-4' />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* 続きから再開カード */}
          <Card
            className={`transition-shadow ${!hasDraft ? 'opacity-60 bg-slate-50' : 'hover:shadow-md border-green-100'}`}
          >
            <CardHeader>
              <CardTitle className='flex items-center justify-center gap-2'>
                <History className='w-5 h-5' />
                続きから
              </CardTitle>
              <CardDescription>
                {/* ローディング表示の出し分けも簡単になります */}
                {isLoading ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Loader2 className='w-3 h-3 animate-spin' /> 確認中...
                  </span>
                ) : hasDraft ? (
                  '保存されたデータがあります'
                ) : (
                  '保存されたデータはありません'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant={hasDraft ? 'default' : 'outline'}
                className={`w-full ${hasDraft ? 'bg-green-600 hover:bg-green-700' : ''}`}
                disabled={!hasDraft || isLoading}
              >
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href='/'>入力を再開する</a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* フッター的な技術アピール */}
        <div className='pt-10 text-xs text-slate-400'>
          <p>Tech Stack: Next.js 16 / TypeScript / Zod / IndexedDB (Dexie.js) / Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}
