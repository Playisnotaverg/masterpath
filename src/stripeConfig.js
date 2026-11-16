// Publishable key only. Safe in the browser. The secret key lives in supabase/functions/.env.
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY
export const stripeReady = Boolean(STRIPE_PUBLIC_KEY && STRIPE_PUBLIC_KEY.startsWith('pk_') && !STRIPE_PUBLIC_KEY.includes('REPLACE_ME'))
if (!stripeReady) console.warn('[Masterpath] VITE_STRIPE_PUBLIC_KEY is missing or still a placeholder.')
