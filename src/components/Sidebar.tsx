'use client'

import { useRouter } from 'next/navigation'

export default function Sidebar() {
  const router = useRouter();
  return (
    <aside className="w-64 bg-white border-r p-5">
      <h1 className="text-xl font-bold mb-8">finance-app</h1>

      <nav className="space-y-3">
        <p className="font-semibold text-blue-600">Dashboard</p>
        <p onClick={() => router.push('/transaction')} className="text-gray-600 cursor-pointer">Transaksi</p>
        <p className="text-gray-600">Kategori</p>
        <p className="text-gray-600">Budget</p>
        <p className="text-gray-600">Laporan</p>
        <p className="text-gray-600">Pengaturan</p>
      </nav>
    </aside>
  )
}