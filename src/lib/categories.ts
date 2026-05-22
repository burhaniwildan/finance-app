import { supabase } from '@/lib/supabaseClient'

export async function fetchCategories() {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  if (error) {
    console.error(error)
    return []
  }

  return data
}