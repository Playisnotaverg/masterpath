import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

// Shown when the 14-day trial is over and the user hasn't subscribed. It can't be dismissed.
export default function PaywallModal() {
  const { signOut } = useAuth()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const subscribe = async () => {
    setErr(''); setBusy(true)
    // The function reads the user's id and email from their login token (not from the request body).
    const { data, error } = await supabase.functions.invoke('create-checkout')
    if (error || !data?.url) { setBusy(false); return setErr(error?.message || data?.error || 'Could not start checkout. Try again.') }
    window.location.href = data.url
  }

  return (
    <main className="auth">
      <div className="auth-card">
        <div className="auth-logo">⏳</div>
        <h1>Your free trial has ended</h1>
        <p className="muted">Subscribe now to continue using Masterpath.</p>
        <div className="glass price">
          <div className="amt">$1.25<span> / month</span></div>
          <small className="muted">Your paths, badges and progress are saved and waiting for you.</small>
        </div>
        {err && <p className="note err">{err}</p>}
        <button className="btn primary" onClick={subscribe} disabled={busy}>{busy ? 'Opening secure checkout…' : 'Subscribe now'}</button>
        <small className="muted fine">Billed monthly until you cancel. Payment is handled securely by Stripe.</small>
        <button className="link" onClick={signOut}>Sign out</button>
      </div>
    </main>
  )
}
