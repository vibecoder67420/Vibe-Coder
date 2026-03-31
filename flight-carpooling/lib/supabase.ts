import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Missing Supabase env vars')
    _supabase = createClient(url, key)
  }
  return _supabase
}

// Convenience alias — only safe to call after env vars are loaded (client-side or with .env.local)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export type Traveler = {
  id: string
  name: string
  email: string
  phone: string
  arrival_flight: string | null
  arrival_time: string
  departure_time: string
  luggage: 'carry-on only' | '1 checked bag' | '2+ checked bags'
  notes: string | null
  created_at: string
}
