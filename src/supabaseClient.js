import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// true only when both variables exist and the key is not the template placeholder
export const envReady = Boolean(url && anonKey && !anonKey.includes('YOUR_SUPABASE_ANON_KEY'))

if (!envReady) {
  console.warn('[Masterpath] Supabase env not ready. Put your real values in .env (see .env.example) and restart `npm run dev`.')
}

// Fallbacks keep the app from crashing on a blank screen while env is being set up.
export const supabase = createClient(url || 'http://localhost', anonKey || 'missing-anon-key')
