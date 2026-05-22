'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabaseClient'
import { Category } from '@/types/category'

import AddCategoryDialog from '@/components/AddCategoryDialog'
import DeleteCategoryDialog from '@/components/DeleteCategoryDialog'

import {
  Card,
  CardContent
} from '@/components/ui/card'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

export default function CategoryPage() {
  const [categories, setCategories] =
    useState<Category[]>([])
  const [transactions, setTransactions] =
    useState<any[]>([])

  const fetchCategories = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } =
      await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', {
          ascending: false
        })

    if (error) {
      console.log(error)
      return
    }

    setCategories(data || [])
  }

  const fetchTransactions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('transaction')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.log(error)
      toast.error('Gagal mengambil data transaksi')
      return
    }
    setTransactions(data || [])
  }

  useEffect(() => {
    fetchCategories()
    fetchTransactions()
  }, [])

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat(
      'id-ID',
      {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }
    ).format(amount)
  }

  return (

    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Categories
            </h1>

            <p className="text-gray-500">
              Kelola kategori transaksi
            </p>
          </div>

          <AddCategoryDialog onSuccess={fetchCategories} />
        </div>

        {/* LIST */}
        <div className="grid md:grid-cols-3 gap-4">
          {categories.map((category) => {
            const categoryTransactions = transactions
              .filter(
                (transaction) => transaction.category === category.name
              )

            const totalExpense = categoryTransactions
              .filter(
                (item) => item.type === 'expense'
              )
              .reduce(
                (acc, item) => acc + item.amount, 0
              )

            return (
              <Card
                key={category.id}
                className="shadow-sm border-0"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{
                        backgroundColor:
                          category.color
                      }}
                    >
                      {category.icon || '📂'}
                    </div>

                    <div>
                      <h3 className="font-semibold capitalize">
                        {category.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {formatRupiah(totalExpense)}
                      </p>

                      <p className='text-xs text-gray-400'>
                        {categoryTransactions.length} transaksi
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <AddCategoryDialog
                      category={category}
                      onSuccess={() => {
                        fetchCategories()
                      }}
                    />

                    <DeleteCategoryDialog
                      category={category}
                      transactions={transactions}
                      onSuccess={() => {
                        fetchCategories()
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          }
          )}
        </div>
      </main>
    </div>
  )
}