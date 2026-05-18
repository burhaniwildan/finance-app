'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { div } from 'framer-motion/client'

type Budget = {
  id: string
  category: string
  amount: number
  month: number
  year: number
}

type Transaction = {
  id: string
  category: string
  amount: number
  type: string
  date: string
}

const categories = [
  'makanan',
  'transport',
  'belanja'
]

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const selectedDate = new Date()
  const month = selectedDate.getMonth() + 1
  const year = selectedDate.getFullYear()
  const router = useRouter()

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat(
      'id-ID',
      {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }
    ).format(value)
  }

  const fetchBudgets = async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data, error } =
      await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('month', month)
        .eq('year', year)

    if (error) {
      console.log(error)
      return
    }

    setBudgets(data || [])
  }

  const fetchTransactions = async () => {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data, error } =
      await supabase
        .from('transaction')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('type', 'expense')

    if (error) {
      console.log(error)
      return
    }

    setTransactions(data || [])
  }

  const handleAddBudget = async () => {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      toast.error('Harus login dulu')
      setLoading(false)
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('budgets')
      .insert({
        user_id: userData.user.id,
        category,
        amount: Number(amount),
        month,
        year
      })

    if (error) {
      console.log(error)
      toast.error('Gagal menambahkan budget')
      setLoading(false)
      return
    } else {
      toast.success('Berhasil menambahkan budget')
      setCategory('')
      setAmount('')

      setOpen(false)
      fetchBudgets()
      setLoading(false)
    }
  }

  const getCategoryExpense = (category: string) => {
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)

      return (
        transaction.category === category &&
        transactionDate.getMonth() + 1 === month &&
        transactionDate.getFullYear() === year
      )
    })
      .reduce(
        (acc, transaction) => acc + transaction.amount, 0
      )
  }

  useEffect(() => {
    fetchBudgets()
    fetchTransactions()
  }, [])

  return (
    <div className='flex min-h-screen bg-gray-100'>
      <Sidebar />

      <main className='flex-1 p-6 space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3x1 font-bold'>
              Budget
            </h1>
            <p className='text-gray-500 mt-1'>
              Kelola budget bulananmu
            </p>
          </div>

          <Dialog
            open={open}
            onOpenChange={setOpen}
          >
            <DialogTrigger asChild>
              <Button>
                +Tambah Budget
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Tambah Budget
                </DialogTitle>
              </DialogHeader>

              <div className='space-y-4'>
                {/* CATEGORY */}
                <div>
                  <label className='text-sm'>
                    Kategori
                  </label>

                  <Select
                    value={category}
                    onValueChange={setCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>

                    <SelectContent>
                      {categories.map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                        >
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* AMOUNT */}
                <div>
                  <label className='text-sm'>
                    Nominal Budget
                  </label>

                  <Input
                    type="number"
                    placeholder="1000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <Button
                  className='w-full'
                  onClick={handleAddBudget}
                  disabled={loading}
                >
                  {
                    loading ? 'Menyimpan...' : 'Simpan Budget'
                  }
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* BUDGET LIST */}
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
          {budgets.map((budget) => {
            const expense = getCategoryExpense(budget.category)
            const percentage =
              Math.min(
                (expense / budget.amount) * 100,
                100
              )
            const remaining = budget.amount - expense

            return (
              <Card
                key={budget.id}
                className='shadow-sm'
              >
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='capitalize'>
                      {budget.category}
                    </CardTitle>

                    <div className='text-sm text-gray-500'>
                      {Math.round(percentage)}%
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {/* PROGRESS */}
                  <Progress
                    value={percentage}
                  />

                  {/* INFO */}
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-500'>
                        Terpakai
                      </span>

                      <span>
                        {formatRupiah(expense)}
                      </span>
                    </div>

                    <div className='flex justify-between'>
                      <span className='text-gray-500'>
                        Budget
                      </span>

                      <span>
                        {formatRupiah(budget.amount)}
                      </span>
                    </div>

                    <div className='flex justify-between font-medium'>
                      <span>
                        Sisa
                      </span>

                      <span
                        className={
                          remaining < 0
                            ? 'text-red-500'
                            : 'text-green-600'
                        }
                      >
                        {formatRupiah(remaining)}
                      </span>
                    </div>
                  </div>

                  {/* WARNING */}
                  {
                    percentage >= 100 && (
                      <div className='text-sm text-red-500 font-medium'>
                        Budget telah terlampaui
                      </div>
                    )
                  }

                  {
                    percentage >= 80 &&
                    percentage < 100 && (
                      <div className='text-sm text-yellow-500 font-medium'>
                        Budget hampir habis
                      </div>
                    )
                  }
                </CardContent>
              </Card>
            )
          })}
        </div>

        {
          budgets.length === 0 && (
            <Card>
              <CardContent className='h-69 flex items-center justify-center text-gray-400'>
                Belum ada budget bulan ini
              </CardContent>
            </Card>
          )
        }
      </main>
    </div>
  )
}