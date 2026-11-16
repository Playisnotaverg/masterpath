import { envReady } from '../supabaseClient'

export default function EnvBanner() {
  if (envReady) return null
  return (
    <div className="envb" role="alert">
      <b>Supabase isn’t configured yet.</b> Add your real anon key to <code>.env</code> and restart <code>npm run dev</code>. Guest mode still works.
    </div>
  )
}
