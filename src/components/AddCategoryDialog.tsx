'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabaseClient'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'

import { Button } from '@/components/ui/button'

type Props = {
  onSuccess?: () => void
  category?: any
}

const icons = [
  '🍔',
  '🚗',
  '🛒',
  '🎮',
  '💡',
  '🏠',
  '💊',
  '📚',
  '✈️',
  '💰'
]

const colors = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6'
]

export default function AddCategoryDialog({
  onSuccess,
  category
}: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(category?.name || '')
  const [icon, setIcon] = useState(category?.icon || '🍔')
  const [color, setColor] = useState(category?.color || '#22c55e')
  const isEdit = !!category

  const handleSubmit = async () => {
    if (!name) {
      toast.error('Nama kategori wajib diisi')
      return
    }

    setLoading(true)

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    let error = null

    if (isEdit) {
      const response = await supabase
        .from('categories')
        .update({
          name,
          icon,
          color
        })
        .eq('id', category.id)

      error = response.error
    } else {
      const response = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name,
          icon,
          color
        })

      error = response.error
    }
    setLoading(false)

    if (error) {
      console.log(error)
      toast.error(
        'Gagal menambahkan kategori'
      )

      return
    }

    toast.success(
      isEdit
        ? 'Kategori berhasil diupdate'
        : 'Kategori berhasil ditambahkan'
    )

    setName('')
    setIcon('🍔')
    setColor('#22c55e')

    setOpen(false)

    onSuccess?.()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >

      <DialogTrigger asChild>
        <Button variant={isEdit ? 'outline' : 'default'}>
          {isEdit ? 'Edit' : '+ Tambah Kategori'}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* NAME */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nama Kategori
            </label>

            <Input
              placeholder="Contoh: Makanan"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />
          </div>

          {/* ICON */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Pilih Icon
            </label>

            <div className="grid grid-cols-5 gap-2">
              {icons.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setIcon(item)
                  }
                  className={`
                    h-12 rounded-xl border text-xl
                    transition
                    hover:bg-gray-100
                    ${icon === item
                      ? 'border-black bg-gray-100'
                      : ''
                    }
                  `}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* COLOR */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Pilih Warna
            </label>

            <div className="flex gap-2 flex-wrap">
              {colors.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setColor(item)
                  }
                  className={`
                    w-10 h-10 rounded-full border-4

                    ${color === item
                      ? 'border-black'
                      : 'border-transparent'
                    }
                  `}
                  style={{
                    backgroundColor: item
                  }}
                />
              ))}
            </div>
          </div>

          {/* BUTTON */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() =>
                setOpen(false)
              }
            >
              Batal
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {
                loading
                  ? 'Menyimpan...'
                  : 'Simpan'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}