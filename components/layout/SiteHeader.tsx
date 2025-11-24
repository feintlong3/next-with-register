import { FileCheck, Home, X } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className='sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm'>
      <div className='container max-w-4xl mx-auto h-16 flex items-center justify-between px-4'>
        {/* 左側: ロゴ（クリックでTOPへ） */}
        <Link
          href='/'
          className='flex items-center gap-2 font-bold text-slate-800 hover:opacity-80 transition-opacity'
        >
          <div className='bg-blue-600 text-white p-1.5 rounded-md'>
            <FileCheck className='w-5 h-5' />
          </div>
          <span className='hidden sm:inline'>Smart Register Demo</span>
        </Link>

        {/* 右側: TOPに戻るボタン */}
        <div className='flex items-center gap-2'>
          {/* テキストで補足を入れると親切 */}
          <span className='text-xs text-slate-500 hidden sm:inline mr-2'>
            データは自動保存されています
          </span>

          <Button variant='ghost' size='sm' asChild className='text-slate-600'>
            <Link href='/'>
              <Home className='w-4 h-4 mr-2' />
              TOPへ戻る
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
