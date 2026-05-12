'use client'

import { useEffect, useState } from 'react'
import {
  useRouter,
  useSearchParams,
  usePathname
} from "next/navigation"
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
import DeleteTransactionDialog from '@/components/DeleteTransactionDialog'
import { span } from 'framer-motion/client'

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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [itemsPerPage, setItemsPerPage] =
    useState(
      Number(searchParams.get('limit')) || 10
    )
  const [currentPage, setCurrentPage] =
    useState(
      Number(searchParams.get('page')) || 1
    )
  const [totalCount, setTotalCount] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] =
    useState(
      searchParams.get('debouncedSearch') || ''
    )
  const [typeFilter, setTypeFilter] =
    useState(
      searchParams.get('type') || 'all'
    )
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(
      searchParams.get('categories')
        ?.split(',')
        .filter(Boolean) || []
    )
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  //Timeout Debounced Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(timeout)
  }, [search])

  //Fetch Transactions
  useEffect(() => {
    fetchTransactions()
  }, [
    debouncedSearch,
    typeFilter,
    selectedCategories,
    sortBy,
    dateRange,
    currentPage
  ])

  //Query Params
  useEffect(() => {
    const params = new URLSearchParams()

    params.set(
      'page',
      currentPage.toString()
    )

    params.set(
      'limit',
      currentPage.toString()
    )

    if (debouncedSearch) {
      params.set('debouncedSearch', debouncedSearch)
    }

    if (typeFilter !== 'all') {
      params.set('type', typeFilter)
    }

    if (sortBy !== 'newest') {
      params.set('sort', sortBy)
    }

    if (selectedCategories.length > 0) {
      params.set(
        'categories',
        selectedCategories.join(',')
      )
    }

    if (dateRange?.from) {
      params.set(
        'from',
        format(dateRange.from, 'yyyy-MM-dd')
      )
    }

    if (dateRange?.to) {
      params.set(
        'to',
        format(dateRange.to, 'yyyy-MM-dd')
      )
    }

    router.replace(
      `${pathname}?${params.toString()}`
    )
  }, [
    debouncedSearch,
    typeFilter,
    sortBy,
    selectedCategories,
    dateRange,
    router,
    pathname
  ])

  //Function Fetch Transactions
  const fetchTransactions = async () => {
    let query = supabase
      .from('transaction')
      .select('*', { count: 'exact' })

    const from = (currentPage - 1) * itemsPerPage
    const to = from + itemsPerPage

    query = query.range(from, to)

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

    const { data, error, count } = await query
    setTotalCount(count || 0)

    if (error) {
      console.log(error)
      toast.error('Gagal mengambil data!')
    } else {
      setTransactions(data)
    }

    setLoading(false)
  }

  //Toggle Category
  const toggleCategory = (
    category: string
  ) => {
    setCurrentPage(1)
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter(
          (item) => item !== category
        )
      }
      return [...prev, category]
    })
  }

  //Format Currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount)
  }

  const handlePageChange = (
    page: number
  ) => {
    setCurrentPage(page)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const generatePagination = () => {
    const pages = []

    pages.push(1)

    if (currentPage > 3) {
      pages.push('...')
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('...')
    }

    if (totalPages > 1) {
      pages.push(totalPages)
    }
    return [...new Set(pages)]
  }

  return (
    <div className='flex gap-2 min-h-screen min-w-screen'>
      <Sidebar></Sidebar>
      <Card className='m-6 w-full'>
        <CardContent className='p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-2xl font-bold'>Transaksi</h1>

            <div>
              <Button
                variant="outline"
                onClick={() => {
                  setDebouncedSearch('')
                  setTypeFilter('all')
                  setSortBy('newest')
                  setSelectedCategories([])
                  setDateRange(undefined)
                }}
                className='mr-2'
              >
                Reset Filter
              </Button>
              <AddTransactionDialog onDialogClose={fetchTransactions} />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-6">

            {/* SEARCH */}
            <Input
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
            />

            {/* FILTER TYPE */}
            <Select
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value)
                setCurrentPage(1)
              }}
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
                  onSelect={(value) => {
                    setDateRange(value)
                    setCurrentPage(1)
                  }}
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

                        <DeleteTransactionDialog
                          transactionId={transaction.id}
                          onSuccess={fetchTransactions}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {

              setItemsPerPage(Number(value))

              setCurrentPage(1)
            }}
          >
            <SelectTrigger >
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="10">
                10 rows
              </SelectItem>

              <SelectItem value="25">
                25 rows
              </SelectItem>

              <SelectItem value="50">
                50 rows
              </SelectItem>
            </SelectContent>
          </Select>

          <div className='flex items-center justify-center gap-2'>
            {/* PREV */}
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              {'<'}
            </Button>

            {/* PAGE NUMBERS */}
            {generatePagination().map(
              (page, index) => {
                if (page === '...') {
                  return (
                    <span
                      key={index}
                      className='px-2'
                    >
                      ...
                    </span>
                  )
                }

                return (
                  <Button
                    key={index}
                    variant={
                      currentPage === page
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() => handlePageChange(Number(page))}
                  >
                    {page}
                  </Button>
                )
              }
            )}

            {/* NEXT */}
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              {'>'}
            </Button>
          </div>
        </CardContent>
      </Card >
    </div >
  )
}