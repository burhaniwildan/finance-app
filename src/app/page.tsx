'use client'
import AddTransaction from '@/components/AddTransaction'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  useEffect(() => {
    const getUser = async () => {
      const response = await supabase.auth.getSession();
      const { data } = response;
      console.log(response.data);
    }

    getUser()
  }, [])

  return (
    <div>
      <h1>
        Dashboard
      </h1>
      <AddTransaction />
    </div>

  )
}