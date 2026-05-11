'use client'

import { useRouter } from 'next/navigation'
import Sidebar from "@/components/Sidebar"
import DashboardCard from "@/components/DashboardCard"
import TransactionItem from "@/components/TransactionItem"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabaseClient"

export default function Page() {
  const router = useRouter()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-100">

      <Sidebar />

      <main className="flex-1 p-6 space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Halo, Wildan 👋</h2>
            <p className="text-gray-500">Kelola keuanganmu dengan lebih bijak.</p>
          </div>

          <Button variant="outline">Mei 2024</Button>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-3 gap-4">
          <DashboardCard title="Saldo Saat Ini" amount="Rp 5.450.000" color="text-green-600" />
          <DashboardCard title="Total Pemasukan" amount="Rp 8.750.000" color="text-blue-600" />
          <DashboardCard title="Total Pengeluaran" amount="Rp 3.300.000" color="text-red-600" />
        </div>

        {/* CHART SECTION */}
        <div className="grid grid-cols-2 gap-4">

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Ringkasan Bulan Ini</h3>
              <div className="h-40 flex items-center justify-center text-gray-400">
                Chart nanti
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Pengeluaran per Kategori</h3>
              <div className="h-40 flex items-center justify-center text-gray-400">
                Pie chart nanti
              </div>
            </CardContent>
          </Card>

        </div>

        {/* TRANSAKSI */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between">
              <h3 className="font-semibold">Transaksi Terbaru</h3>
              <Button variant="link">Lihat Semua</Button>
            </div>

            <TransactionItem name="Gaji Bulanan" type="Pemasukan" amount="Rp 8.000.000" color="text-green-600" />
            <TransactionItem name="Makan Siang" type="Pengeluaran" amount="Rp 35.000" color="text-red-600" />
            <TransactionItem name="Transportasi" type="Pengeluaran" amount="Rp 15.000" color="text-red-600" />

            <Button onClick={() => router.push('/add-transaction')} className="w-full">+ Tambah Transaksi</Button>
          </CardContent>
        </Card>

        <Button onClick={handleLogout} variant='destructive'>Log Out</Button>
      </main>
    </div>
  )
}