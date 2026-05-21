import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/alert-dialog'

type Transaction = {
  id: string
  category: string
  amount: number
  type: string
}

type Props = {
  category: any
  transactions: Transaction[]
  onSuccess?: () => void
}

export default function DeleteCategoryDialog({
  category,
  transactions,
  onSuccess
}: Props) {
  const usedTransactions =
    transactions.filter(
      (item) =>
        item.category ===
        category.name
    )


  const handleDelete = async () => {
    if (usedTransactions.length > 0) {
      toast.error('Kategori masih dipakai transaksi')
      return
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id)

    if (error) {
      console.log(error)
      toast.error(
        'Gagal menghapus kategori'
      )

      return
    }
    toast.success(
      'Kategori berhasil dihapus'
    )

    onSuccess?.()
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
            Hapus kategori?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Kategori yang dihapus
            tidak dapat dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Batal
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleDelete}
            className="
              bg-red-500
              hover:bg-red-600
            "
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

