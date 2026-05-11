'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import AddTransaction from './AddTransaction'

type Transaction = {
  id: string
  amount: number
  type: string
  category: string
  description: string
  date: string
}

type Props = {
  transaction: Transaction
  onSuccess?: () => void
}

export default function EditTransactionDialog({
  transaction,
  onSuccess
}: Props) {
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
        >
          <Pencil className='w-4 h-4' />
        </Button>
      </DialogTrigger>

      <DialogContent className='min-w-8/12 max-h-10/12'>
        <DialogHeader>
          <DialogTitle>
          </DialogTitle>
        </DialogHeader>

        <AddTransaction
          transaction={transaction}
          isEdit={true}
          onClose={() => setOpen(false)}
          onSuccess={handleClose}
        />
      </DialogContent>
    </Dialog>
  )
}