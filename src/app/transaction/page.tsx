'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import Sidebar from '@/components/Sidebar'

type Transaction = {
  id: string
  amount: number
  type: string
  category: string
  description: string
  date: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transaction')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.log(error)
    } else {
      setTransactions(data)
    }
    setLoading(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount)
  }

  return (
    <div className='flex gap-2 min-h-screen min-w-screen'>
      <Sidebar></Sidebar>
      <Card className='m-6'>
        <CardContent className='min-w-screen p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-2xl font-bold'>Transaksi</h1>

            <Button>
              + Tambah Transaksi
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className='text-right'>Jumlah</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    Loading
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    Tidak ada transaksi
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {transaction.date}
                    </TableCell>

                    <TableCell>
                      {transaction.description}
                    </TableCell>

                    <TableCell>
                      <Badge variant='secondary'>
                        {transaction.category}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span
                        className={
                          transaction.type === 'income' ?
                            'text-green-600 font-medium' :
                            'text-red-600 font-medium'
                        }
                      >
                        {
                          transaction.type === 'income' ?
                            'Pemasukan' :
                            'Pengeluaran'
                        }
                      </span>
                    </TableCell>

                    <TableCell
                      className={
                        `text-right font-semibold 
                        ${transaction.type === 'income' ?
                          'text-green-600' :
                          'text-red-600'
                        }`
                      }>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}