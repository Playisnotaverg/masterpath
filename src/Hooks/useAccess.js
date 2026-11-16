import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { loadProfile } from '../lib/sync'
import { TRIAL_MS, guestStart } from '../lib/trial'

const DAY = 24 * 60 * 60 * 1000

/* status: loading | activating | guest-trial | guest-expired | trial | expired | pro */
export function useAccess() {
  const { user, isGuest } = useAuth()
  const [profile, setProfile] = useState(null)
  const [ready, setReady] = useState(false)
  const returning = new URLSearchParams(window.location.search).get('checkout') === 'success'
  const [activating, setActivating] = useState(returning)

  useEffect(() => {
    let alive = true
    setReady(false)
    if (!user) { setProfile(null); setReady(true); return }
    loadProfile(user.id).then((p) => alive && setProfile(p)).catch(() => {}).finally(() => alive && setReady(true))
    return () => { alive = false }
  }, [user?.id])

  // Back from Stripe: wait briefly for the webhook to flip is_pro.
  useEffect(() => {
    if (!user || !returning) return
    let n = 0
    const t = setInterval(async () => {
      n += 1
      const p = await loadProfile(user.id).catch(() => null)
      if (p) setProfile(p)
      if (p?.is_pro || n >= 12) { clearInterval(t); setActivating(false); window.history.replaceState({}, '', window.location.pathname) }
    }, 2000)
    return () => clearInterval(t)
  }, [user?.id])

  const now = Date.now()
  let status = 'loading', endsAt = 0
  if (user) {
    if (!ready) status = 'loading'
    else if (profile?.is_pro) status = 'pro'
    else if (activating) status = 'activating'
    else {
      endsAt = profile?.trial_ends_at ? Date.parse(profile.trial_ends_at) : Date.parse(user.created_at) + TRIAL_MS
      status = endsAt > now ? 'trial' : 'expired'
    }
  } else if (isGuest) {
    endsAt = guestStart() + TRIAL_MS
    status = endsAt > now ? 'guest-trial' : 'guest-expired'
  }
  return { status, daysLeft: Math.max(0, Math.ceil((endsAt - now) / DAY)), profile }
}
