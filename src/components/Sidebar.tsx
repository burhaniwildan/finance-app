'use client'

import { useRouter } from 'next/navigation'

export default function Sidebar() {
  const router = useRouter();
  return (
    <aside className="w-[15%] bg-white border-r p-5">
      <h1 className="text-xl font-bold mb-8">finance-app</h1>

      <nav className="space-y-3">
        <p onClick={() => router.push('/')} className="font-semibold text-blue-600 cursor-pointer">Dashboard</p>
        <p onClick={() => router.push('/transaction')} className="text-gray-600 cursor-pointer">Transaksi</p>
        <p onClick={() => router.push('/category')} className="text-gray-600 cursor-pointer">Kategori</p>
        <p onClick={() => router.push('/budget')} className="text-gray-600 cursor-pointer">Budget</p>
      </nav>
    </aside>
  )
}