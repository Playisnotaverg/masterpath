import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthScreen({ forced = false }) {
  const { signUpWithEmail, signInWithEmail, continueAsGuest } = useAuth()
  const [mode, setMode] = useState('up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)
  const up = mode === 'up'

  const submit = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    if (up && !name.trim()) return setMsg({ type: 'err', text: 'Please enter your name.' })
    if (password.length < 8) return setMsg({ type: 'err', text: 'Password must be at least 8 characters.' })
    setBusy(true)
    const { data, error } = up
      ? await signUpWithEmail(email.trim(), password, name.trim())
      : await signInWithEmail(email.trim(), password)
    setBusy(false)
    if (error) return setMsg({ type: 'err', text: error.message })
    if (up && data.user && data.user.identities?.length === 0)
      return setMsg({ type: 'err', text: 'An account with that email already exists. Try signing in.' })
    if (up && !data.session)
      setMsg({ type: 'ok', text: 'Check your email to confirm your account, then sign in.' })
  }

  const toggle = () => { setMode(up ? 'in' : 'up'); setMsg({ type: '', text: '' }) }

  return (
    <main className="auth">
      <div className="auth-card">
        <div className="auth-logo">🧭</div>
        <h1>Masterpath</h1>
        {forced && <p className="note err">Your 14-day guest trial has ended. Create a free account to continue.</p>}
        <p className="muted">{up ? 'Create your account to start learning.' : 'Welcome back. Sign in to continue.'}</p>

        <div className="seg" role="tablist">
          <button type="button" className={up ? 'on' : ''} onClick={() => !up && toggle()}>Create Account</button>
          <button type="button" className={!up ? 'on' : ''} onClick={() => up && toggle()}>Sign In</button>
        </div>

        <form onSubmit={submit}>
          {up && (
            <input className="input" placeholder="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <input className="input" type="email" required placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" required placeholder="Password (8+ characters)" autoComplete={up ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
          {msg.text && <p className={msg.type === 'ok' ? 'note ok' : 'note err'}>{msg.text}</p>}
          <button className="btn primary" disabled={busy}>{busy ? 'One moment…' : up ? 'Create Account' : 'Sign In'}</button>
        </form>

        {!forced && <button className="btn ghost" onClick={continueAsGuest}>Continue as Guest</button>}
      </div>
    </main>
  )
}
