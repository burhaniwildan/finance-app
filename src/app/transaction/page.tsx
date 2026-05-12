'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

import { format } from "date-fns"
import { DateRange } from 'react-day-picker'
import {
  Check,
  ChevronsUpDown,
  CalendarIcon,
  Trash2
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/components/ui/command"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import { motion } from "framer-motion"
import Sidebar from '@/components/Sidebar'
import AddTransactionDialog from '@/components/AddTransactionDialog'
import EditTransactionDialog from '@/components/EditTransactionDialog'

type Transaction = {
  id: string
  amount: number
  type: string
  category: string
  description: string
  date: string
}

const categories = [
  'makanan',
  'transport',
  'belanja'
]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    fetchTransactions()
  }, [
    debouncedSearch,
    typeFilter,
    selectedCategories,
    sortBy,
    dateRange
  ])

  const fetchTransactions = async () => {
    let query = supabase
      .from('transaction')
      .select('*')

    if (debouncedSearch) {
      query = query.ilike(
        'description',
        `%${debouncedSearch}%`
      )
    }

    if (typeFilter != 'all') {
      query = query.eq('type', typeFilter)
    }

    if (selectedCategories.length > 0) {
      query = query.in(
        'category',
        selectedCategories
      )
    }

    if (dateRange?.from) {
      query = query.gte(
        'date',
        format(dateRange.from, 'yyyy-MM-dd')
      )
    }

    if (dateRange?.to) {
      query = query.lte(
        'date',
        format(dateRange.to, 'yyyy-MM-dd')
      )
    }

    switch (sortBy) {
      case 'highest':
        query = query.order(
          'amount',
          { ascending: false }
        )
        break

      case 'lowest':
        query = query.order(
          'amount',
          { ascending: true }
        )
        break

      case 'oldest':
        query = query.order(
          'date',
          { ascending: true }
        )

      default:
        query = query.order(
          'date',
          { ascending: false }
        )
    }

    const { data, error } = await query

    if (error) {
      console.log(error)
      toast.error('Gagal mengambil data!')
    } else {
      setTransactions(data)
    }

    setLoading(false)
  }

  /*const fetchTransactions = async () => {
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
  }*/

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('Yakin ingin menghapus transaksi ini?')

    if (!confirmDelete) return

    const { error } = await supabase
      .from('transaction')
      .delete()
      .eq('id', id)

    if (error) {
      console.log(error)
      toast.error('Gagal menghapus data!')
      return
    } else {
      fetchTransactions()
      toast.success('Berhasil menghapus data!')
    }
  }

  const toggleCategory = (
    category: string
  ) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter(
          (item) => item !== category
        )
      }
      return [...prev, category]
    })
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
      <Card className='m-6 w-full'>
        <CardContent className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-2xl font-bold'>Transaksi</h1>

            <AddTransactionDialog onDialogClose={fetchTransactions} />
          </div>

          <div className="grid grid-cols-5 gap-4 mb-6">

            {/* SEARCH */}
            <Input
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* FILTER TYPE */}
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">
                  Semua Tipe
                </SelectItem>

                <SelectItem value="income">
                  Pemasukan
                </SelectItem>

                <SelectItem value="expense">
                  Pengeluaran
                </SelectItem>
              </SelectContent>
            </Select>

            {/* FILTER CATEGORY */}
            <Popover>

              <PopoverTrigger asChild>

                <Button
                  variant="outline"
                  className="justify-between"
                >

                  {selectedCategories.length > 0
                    ? `${selectedCategories.length} kategori dipilih`
                    : 'Pilih kategori'}

                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />

                </Button>

              </PopoverTrigger>

              <PopoverContent className="w-64 p-0">

                <Command>

                  <CommandInput placeholder="Cari kategori..." />

                  <CommandEmpty>
                    Kategori tidak ditemukan
                  </CommandEmpty>

                  <CommandGroup>

                    {categories.map((category) => (

                      <CommandItem
                        key={category}
                        onSelect={() =>
                          toggleCategory(category)
                        }
                      >

                        <div className="flex items-center gap-2">

                          <Checkbox
                            checked={selectedCategories.includes(category)}
                          />

                          <span className="capitalize">
                            {category}
                          </span>

                        </div>

                        {selectedCategories.includes(category) && (
                          <Check className="ml-auto h-4 w-4" />
                        )}

                      </CommandItem>

                    ))}

                  </CommandGroup>

                </Command>

              </PopoverContent>

            </Popover>
            {/*<Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="all">
                  Semua Kategori
                </SelectItem>

                <SelectItem value="makanan">
                  Makanan
                </SelectItem>

                <SelectItem value="transport">
                  Transportasi
                </SelectItem>

                <SelectItem value="belanja">
                  Belanja
                </SelectItem>

              </SelectContent>
            </Select>*/}

            {/* SORT */}
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >

              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="newest">
                  Terbaru
                </SelectItem>

                <SelectItem value="oldest">
                  Terlama
                </SelectItem>

                <SelectItem value="highest">
                  Nominal Tertinggi
                </SelectItem>

                <SelectItem value="lowest">
                  Nominal Terendah
                </SelectItem>

              </SelectContent>

            </Select>

            {/* FILTER DATE */}

            <Popover>

              <PopoverTrigger asChild>

                <Button
                  variant="outline"
                  className="justify-start text-left font-normal "
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd MMM yyyy")} -{" "}
                        {format(dateRange.to, "dd MMM yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd MMM yyyy")
                    )
                  ) : (
                    <span>Pilih rentang tanggal</span>
                  )}
                </Button>

              </PopoverTrigger>

              <PopoverContent
                className="w-auto p-0"
                align="end"
              >

                <Calendar
                  //initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />

              </PopoverContent>

            </Popover>

          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className='text-right'>Jumlah</TableHead>
                <TableHead className='text-center'>Aksi</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>

              {loading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    Loading...
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

                    <TableCell>
                      <div className='flex items-center justify-center gap-2'>
                        <EditTransactionDialog
                          transaction={transaction}
                          onSuccess={fetchTransactions}
                        />

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className='w-4 h-4 text-red-500' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card >
    </div >
  )
}