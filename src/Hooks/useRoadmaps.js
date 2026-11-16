import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { loadRoadmaps, saveRoadmap, saveCompleted, deleteRoadmap, migrateGuestRoadmaps } from '../lib/sync'

const GUEST_ROADMAPS = 'mp_guest_roadmaps'
const readGuest = () => { try { return JSON.parse(localStorage.getItem(GUEST_ROADMAPS) || '[]') } catch { return [] } }
const writeGuest = (list) => localStorage.setItem(GUEST_ROADMAPS, JSON.stringify(list))

export const percent = (r) => {
  const all = (r.phases || []).flatMap((p) => p.milestones || [])
  return all.length ? Math.round((r.completed_milestones.length / all.length) * 100) : 0
}

/* Cloud when signed in, localStorage when in guest mode. Guest roadmaps move to the cloud on sign-in. */
export function useRoadmaps() {
  const { user, isGuest } = useAuth()
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    ;(async () => {
      setError('')
      try {
        if (user) {
          setBusy(true)
          const guest = readGuest()
          if (guest.length) { await migrateGuestRoadmaps(user.id, guest); localStorage.removeItem(GUEST_ROADMAPS) }
          const rows = await loadRoadmaps(user.id)
          if (active) setItems(rows)
        } else if (active) setItems(isGuest ? readGuest() : [])
      } catch (e) { if (active) setError(e.message) }
      finally { if (active) setBusy(false) }
    })()
    return () => { active = false }
  }, [user?.id, isGuest])

  const add = useCallback(async (r) => {
    const base = { ...r, id: crypto.randomUUID(), completed_milestones: [], created_at: new Date().toISOString() }
    try {
      if (user) { const saved = await saveRoadmap(user.id, base); setItems((i) => [saved, ...i]) }
      else setItems((i) => { const n = [base, ...i]; writeGuest(n); return n })
    } catch (e) { setError(e.message) }
  }, [user])

  const toggleMilestone = useCallback(async (id, mid) => {
    const r = items.find((x) => x.id === id); if (!r) return
    const done = r.completed_milestones.includes(mid) ? r.completed_milestones.filter((x) => x !== mid) : [...r.completed_milestones, mid]
    const next = items.map((x) => (x.id === id ? { ...x, completed_milestones: done } : x))
    setItems(next)
    try { user ? await saveCompleted(id, done) : writeGuest(next) } catch (e) { setError(e.message) }
  }, [items, user])

  const remove = useCallback(async (id) => {
    const next = items.filter((x) => x.id !== id)
    setItems(next)
    try { user ? await deleteRoadmap(id) : writeGuest(next) } catch (e) { setError(e.message) }
  }, [items, user])

  return { items, busy, error, add, toggleMilestone, remove }
}
