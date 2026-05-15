'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

import Sidebar from "@/components/Sidebar"
import DashboardCard from "@/components/DashboardCard"
import TransactionItem from "@/components/TransactionItem"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { toast } from "sonner"

type Transaction = {
  id: string
  amount: number
  type: string
  category: string
  date: string
}

export default function Page() {
  const router = useRouter()
  const [transactions, setTransactions] =
    useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  const month = selectedMonth.getMonth()
  const year = selectedMonth.getFullYear()
  const recentTransactions = transactions.slice(0, 5)

  useEffect(() => {
    const fetchDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await fetchBalance(user.id)
      await fetchTransactions(user)
    }
    fetchDashboard()
  }, [])

  // ambil data balance
  const fetchBalance = async (userId: string) => {
    setLoading(true)

    const { data, error } = await supabase
      .from('user_balance')
      .select('current_balance')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.log(error)
      toast.error('Gagal mengambil balance')
    } else {
      setBalance(Number(data.current_balance))
    }

  }

  // ambil data transaksi
  const fetchTransactions = async (user: any) => {
    setLoading(true)

    //const { data: { user } } = await supabase.auth.getUser()
    //if (!user) return

    const { data, error } = await supabase
      .from('transaction')
      .select('id, amount, type, category, date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (error) {
      console.log(error)
    } else {
      setTransactions(data || [])
    }
    setLoading(false)
  }

  const monthlyTransactions = transactions.filter((transaction => {
    const transactionDate = new Date(transaction.date)

    return (
      transactionDate.getMonth() === month &&
      transactionDate.getFullYear() === year
    )
  }))

  const totalIncome = monthlyTransactions
    .filter(
      (item) => item.type === 'income'
    )
    .reduce(
      (acc, item) => acc + item.amount, 0
    )

  const totalExpense = monthlyTransactions
    .filter(
      (item) => item.type === 'expense'
    )
    .reduce(
      (acc, item) => acc + item.amount, 0
    )

  const monthlyChartData = Array.from(
    { length: 12 },
    (_, index) => {
      const monthTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date)

        return (
          transactionDate.getMonth() === index &&
          transactionDate.getFullYear() === year
        )
      })

      const income = monthTransactions
        .filter(
          (item) => item.type === 'income'
        )
        .reduce(
          (acc, item) => acc + item.amount, 0
        )

      const expense = monthTransactions
        .filter(
          (item) => item.type === 'expense'
        )
        .reduce(
          (acc, item) => acc + item.amount, 0
        )

      return {
        month:
          new Date(0, index).toLocaleString(
            'id-ID',
            {
              month: 'short'
            }
          ),
        income,
        expense
      }
    }
  )

  const categoryData = Object.values(

    monthlyTransactions.reduce(
      (acc, transaction) => {

        if (
          transaction.type !== 'expense'
        ) return acc

        if (!acc[transaction.category]) {

          acc[transaction.category] = {

            name: transaction.category,
            value: 0
          }
        }

        acc[transaction.category].value +=
          transaction.amount

        return acc

      },

      {} as Record<
        string,
        {
          name: string
          value: number
        }
      >
    )
  )

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

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

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {selectedMonth.toLocaleString(
                  'id-ID',
                  {
                    month: 'long',
                    year: 'numeric'
                  }
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className='w-52 p-2' align='end'>
              <div className='grid grid-cols-3 gap-2'>
                {Array.from(
                  { length: 12 },
                  (_, index) => {
                    const date = new Date()
                    date.setMonth(index)

                    return (
                      <Button
                        key={index}
                        variant={
                          selectedMonth.getMonth() === index
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        onClick={() => {
                          const newDate = new Date(selectedMonth)
                          newDate.setMonth(index)
                          setSelectedMonth(newDate)
                        }}
                      >
                        {date.toLocaleString(
                          'id-ID',
                          {
                            month: 'short'
                          }
                        )}
                      </Button>
                    )
                  }
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-3 gap-4">
          <DashboardCard
            title='Saldo Saat Ini'
            amount={loading ? "Memuat..." : formatCurrency(balance)}
            color={loading ? 'text-gray-500' : 'text-green-600'}
          />

          <DashboardCard
            title='Total Pemasukan'
            amount={loading ? "Memuat..." : formatCurrency(totalIncome)}
            color={loading ? 'text-gray-500' : 'text-blue-600'}
          />

          <DashboardCard
            title='Total Pengeluaran'
            amount={loading ? "Memuat..." : formatCurrency(totalExpense)}
            color={loading ? 'text-gray-500' : 'text-red-600'}
          />
        </div>

        {/* CHART SECTION */}
        <div className="grid grid-cols-2 gap-4">
          {
            monthlyChartData.every(
              (item) =>
                item.income === 0 &&
                item.expense === 0
            ) ? (

              <div className="h-72 flex items-center justify-center text-gray-400">

                Belum ada data

              </div>

            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="income"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expense"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          }

          {
            categoryData.length === 0 ? (

              <div className="h-72 flex items-center justify-center text-gray-400">

                Belum ada data pengeluaran

              </div>

            ) : (
              <div className="h-72">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      label
                    >
                      {categoryData.map(
                        (_, index) => (
                          <Cell key={index} />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              // pie chart
            )
          }
        </div>

        {/* TRANSAKSI */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between">
              <h3 className="font-semibold">Transaksi Terbaru</h3>
              <Button
                variant="link"
                onClick={() => router.push('/transaction')}
              >
                Lihat Semua
              </Button>
            </div>

            {loading ?
              (
                <p className='text-gray-500'>Memuat...</p>
              ) :
              recentTransactions.length === 0 ? (
                <div className='text-center py-10 text-gray-400'>
                  Belum ada transaksi
                </div>
              ) : (
                recentTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    name={transaction.category}
                    type={transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                    amount={formatCurrency(transaction.amount)}
                    color={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}
                  />
                ))
              )}

            <Button
              onClick={() => router.push('/transaction')}
              className="w-full"
            >
              + Tambah Transaksi
            </Button>
          </CardContent>
        </Card>

        <Button onClick={handleLogout} variant='destructive'>Log Out</Button>
      </main>
    </div>
  )
}