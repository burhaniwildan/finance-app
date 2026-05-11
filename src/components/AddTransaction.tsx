'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Props = {
  onClose: () => void
}

export default function AddTransactionForm({
  onClose,
}: Props) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()


  const handleSubmit = async () => {
    setLoading(true)

    // ambil user login
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      alert('Harus login dulu')
      setLoading(false)
      return
    }

    // insert ke database
    const { error } = await supabase.from('transaction').insert([
      {
        user_id: userData.user.id,
        amount: Number(amount),
        type,
        category,
        description: note,
        date,
      }
    ])

    if (error) {
      console.log(error)
      toast.error('Transaksi gagal disimpan.')
    } else {
      toast.success('Transaksi berhasil disimpan.')

      // reset form
      setAmount('')
      setCategory('')
      setDate('')
      setNote('')
    }

    setLoading(false)
  }

  return (
    <div className="flex gap-6">

      {/* LEFT FORM */}
      <Card className="w-2/3">
        <CardContent className="p-6 space-y-5 h-full flex flex-col">

          <h2 className="text-xl font-semibold">Tambah Transaksi</h2>

          {/* TYPE */}
          <div className="flex gap-4">
            <Button
              variant={type === 'income' ? 'green' : 'outline'}
              className="w-1/2"
              onClick={() => setType('income')}
            >
              Pemasukan
            </Button>

            <Button
              variant={type === 'expense' ? 'destructive' : 'outline'}
              className="w-1/2"
              onClick={() => setType('expense')}
            >
              Pengeluaran
            </Button>
          </div>

          {/* JUMLAH */}
          <div>
            <label className="text-sm">Jumlah</label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Rp 0"
            />
          </div>

          {/* KATEGORI & TANGGAL */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Kategori</label>
              <Select onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="makanan">Makan & Minum</SelectItem>
                  <SelectItem value="transport">Transportasi</SelectItem>
                  <SelectItem value="belanja">Belanja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm">Tanggal</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* CATATAN */}
          <div>
            <label className="text-sm">Catatan (Opsional)</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* BUTTON */}
          <div className="flex justify-end gap-3 mt-auto">
            <Button onClick={onClose} variant="destructive">Batal</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RIGHT INFO */}
      <Card className="w-1/3 flex items-center justify-center text-center p-6">
        <CardContent>
          <div className="text-4xl mb-4">📋</div>
          <h3 className="font-semibold mb-2">Catat setiap transaksi</h3>
          <p className="text-sm text-gray-500">
            Dengan mencatat transaksi, kamu bisa lebih mudah mengelola keuangan dan mencapai tujuan finansialmu.
          </p>
        </CardContent>
      </Card>

    </div>
  )
}