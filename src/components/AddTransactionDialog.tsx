'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import AddTransaction from "@/components/AddTransaction"

type Props = {
  onDialogClose?: () => void
}

export default function AddTransactionDialog({
  onDialogClose,
}: Props) {

  const [open, setOpen] = useState(false)
  const handleOpenChange = (value: boolean) => {
    setOpen(value)

    if (!value) {
      onDialogClose?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>

      {/* BUTTON OPEN */}
      <DialogTrigger asChild>
        <Button>
          + Tambah Transaksi
        </Button>
      </DialogTrigger>

      {/* MODAL */}
      <DialogContent className="min-w-8/12 max-h-10/12">
        <DialogHeader>
          <DialogTitle>

          </DialogTitle>
        </DialogHeader>

        <AddTransaction onClose={() => setOpen(false)} />

      </DialogContent>

    </Dialog>
  )
}