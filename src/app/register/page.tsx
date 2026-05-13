'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleRegister = async () => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      const user = data.user

      if (user) {
        const { error: balanceError } = await supabase
          .from('user_balance')
          .insert({
            user_id: user.id,
            current_balance: 0
          })

        if (balanceError) {
          console.log(balanceError)
          alert('Gagal membuat balance user')
          return
        }
      }
      alert('Register berhasil, silakan login')
      router.push('/login')
    }
  }

  return (
    <div className="p-5">
      <h1>Register</h1>
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleRegister}>Register</button>
    </div>
  )
}