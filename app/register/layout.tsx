'use client'

import { Check } from 'lucide-react'
import { usePathname } from 'next/navigation'

// 作成したヘッダーをインポート
import { SiteHeader } from '@/components/layout/SiteHeader'

// ... steps定義などはそのまま ...
const steps = [
  { id: 'step1', name: '基本情報', path: '/register/step1-basic' },
  { id: 'step2', name: '本人確認', path: '/register/step2-documents' },
  { id: 'step3', name: '最終確認', path: '/register/step3-confirm' },
]

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* ★ ここに追加: 共通ヘッダー */}
      <SiteHeader />

      <div className='py-10 px-4'>
        <div className='max-w-2xl mx-auto space-y-10'>
          {/* プログレスバー (既存のコード) */}
          <nav aria-label='Progress'>
            <ol className='flex items-center w-fit mx-auto'>
              {steps.map((step, index) => {
                const isActive = pathname.includes(step.id)
                // パス文字列の比較ではなくインデックス順序で完了判定をする方がロバスト
                const currentStepIndex = steps.findIndex((s) => pathname.includes(s.id))
                const isCompleted = currentStepIndex > index

                return (
                  <li
                    key={step.name}
                    className={`relative flex-1 ${index !== steps.length - 1 ? 'pr-12 sm:pr-28' : ''}`}
                  >
                    <div className='absolute inset-0 flex items-center' aria-hidden='true'>
                      {index !== steps.length - 1 && (
                        <div
                          className={`h-0.5 w-full ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`}
                        />
                      )}
                    </div>
                    <div
                      className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                        isActive || isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className='h-5 w-5 text-white' />
                      ) : (
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-white' : 'bg-transparent'}`}
                        />
                      )}
                    </div>
                    <span
                      className={`absolute mt-2 text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'} -translate-x-1/4 whitespace-nowrap`}
                    >
                      {step.name}
                    </span>
                  </li>
                )
              })}
            </ol>
          </nav>

          {/* メインコンテンツ */}
          <main className='animate-in fade-in zoom-in-95 duration-500'>{children}</main>
        </div>
      </div>
    </div>
  )
}
