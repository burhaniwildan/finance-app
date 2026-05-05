'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AddTransaction() {
  const [amount, setAmount] = useState('')

  const handleAdd = async () => {
    // ambil user login
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      alert('Harus login dulu')
      return
    }

    // insert ke database
    const { error } = await supabase.from('transaction').insert([
      {
        user_id: userData.user.id,
        amount: Number(amount),
        type: 'expense',
      }
    ])

    if (error) {
      console.log(error)
      alert('Gagal tambah data')
    } else {
      alert('Berhasil tambah transaksi')
    }
  }

  return (
    <div>
      <input
        type="number"
        placeholder="Jumlah"
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleAdd}>Tambah</button>
    </div>
  )
}