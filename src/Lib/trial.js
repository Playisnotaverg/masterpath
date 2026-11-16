export const TRIAL_MS = 14 * 24 * 60 * 60 * 1000
const K = 'mp_trial_start'

// Guest trial clock. Kept even after sign-out so "Continue as Guest" can't restart it.
export function guestStart() {
  let s = Number(localStorage.getItem(K))
  if (!s) { s = Date.now(); localStorage.setItem(K, String(s)) }
  return s
}
export const guestStartIfAny = () => Number(localStorage.getItem(K)) || 0
