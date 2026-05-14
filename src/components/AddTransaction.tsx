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

type Transaction = {
  id: string
  amount: number
  type: string
  category: string
  description: string
  date: string
}

type Props = {
  onClose: () => void
  onSuccess?: () => void
  transaction?: Transaction
  isEdit?: boolean
}

export default function AddTransactionForm({
  onClose,
  onSuccess,
  transaction,
  isEdit = false
}: Props) {
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [amount, setAmount] = useState(
    transaction?.amount?.toString() || '')
  const [category, setCategory] = useState(
    transaction?.category?.toString() || '')
  const [date, setDate] = useState(
    transaction?.date?.toString() || '')
  const [note, setNote] = useState(
    transaction?.description?.toString() || '')
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

    // update transaction
    if (isEdit && transaction) {
      // update transaksi
      const { error } = await supabase
        .from('transaction')
        .update({
          amount: Number(amount),
          type,
          category,
          description: note,
          date
        })
        .eq('id', transaction?.id)

      if (error) {
        console.log(error)
        toast.error('Gagal mengupdate data!')
        setLoading(false)
        return

      } else {
        toast.success('Berhasil mengupdate data!')
        setAmount('')
        setCategory('')
        setDate('')
        setNote('')
        onSuccess?.()
      }

    } else {
      // insert transaksi
      const { error } = await supabase
        .from('transaction')
        .insert({
          amount: Number(amount),
          type,
          category,
          description: note,
          date,
          user_id: userData?.user.id
        })

      if (error) {
        console.log(error)
        toast.error('Gagal menambahkan data!')
        setLoading(false)
        return

      } else {
        toast.success('Berhasil menambahkan data!')
        setAmount('')
        setCategory('')
        setDate('')
        setNote('')
      }
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
              <Select onValueChange={setCategory} value={category}>
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