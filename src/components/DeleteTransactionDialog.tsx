'use client'

import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"

type Transaction = {
  id: string
  amount: number
  type: string
}

type Props = {
  transaction: Transaction
  onSuccess?: () => void
}

export default function DeleteTransactionDialog({
  transaction,
  onSuccess
}: Props) {

  const handleDelete = async () => {
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      toast.error('Harus login dulu')
      return
    }

    const {
      data: balanceData,
      error: balanceFetchError
    } =
      await supabase
        .from('user_balance')
        .select('current_balance')
        .eq('user_id', userData.user.id)
        .single()

    if (balanceFetchError || !balanceData) {
      toast.error('Balance user tidak ditemukan')
      return
    }

    const balanceChange =
      transaction.type === 'income'
        ? -transaction.amount
        : transaction.amount

    const { error: balanceError } = await supabase
      .from('user_balance')
      .update({
        current_balance:
          Number(balanceData.current_balance)
          + balanceChange
      })
      .eq('user_id', userData.user.id)

    if (balanceError) {
      console.log(balanceError)
      toast.error('Gagal update balance')
      return
    }

    const { error } = await supabase
      .from('transaction')
      .delete()
      .eq('id', transaction.id)

    if (error) {
      console.log(error)
      toast.error('Gagal menghapus transaksi')
      return
    } else {
      toast.success('Berhasil menghapus transaksi')
      onSuccess?.()
    }
  }


  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Hapus transaksi?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Data transaksi yang dihapus tidak dapat
            dikembalikan lagi.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Batal
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}