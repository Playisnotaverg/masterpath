import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { guestStart, guestStartIfAny } from '../Lib/trial'

const AuthContext = createContext(null)
const GUEST_KEY = 'mp_guest'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [guest, setGuest] = useState(() => localStorage.getItem(GUEST_KEY) === '1')

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
      if (next) { localStorage.removeItem(GUEST_KEY); setGuest(false) }
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    loading,
    isGuest: guest && !session,
    signUpWithEmail: (email, password, fullName) =>
      supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, ...(guestStartIfAny() ? { guest_trial_started: new Date(guestStartIfAny()).toISOString() } : {}) },
          emailRedirectTo: window.location.origin,
        },
      }),
    signInWithEmail: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    continueAsGuest: () => { guestStart(); localStorage.setItem(GUEST_KEY, '1'); setGuest(true) },
    signOut: async () => {
      localStorage.removeItem(GUEST_KEY)
      setGuest(false)
      return supabase.auth.signOut()
    },
  }), [session, loading, guest])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
