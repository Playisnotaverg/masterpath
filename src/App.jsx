import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import AuthScreen from './components/AuthScreen'
import ProfileCard from './components/ProfileCard'
import { useRoadmaps, percent } from './hooks/useRoadmaps'
import { saveLearningStyle } from './lib/sync'
import PaywallModal from './components/PaywallModal'
import TrialBanner from './components/TrialBanner'
import { useAccess } from './hooks/useAccess'
import RotatingHint from './components/RotatingHint'

const STYLES = ['Visual', 'Auditory', 'Reading/Writing', 'Hands On']

// Stand-in generator. Swap for your AI roadmap call; the saved shape is what matters.
const sample = (topic, learning_style) => ({
  topic, learning_style, intensity: 1, baseline: 'Total beginner',
  phases: ['Foundations', 'Build skill', 'Mastery'].map((title, p) => ({
    title, milestones: [1, 2].map((n) => ({ id: `p${p}m${n}`, title: `${topic}: milestone ${p * 2 + n}` })),
  })),
})

export default function App() {
  const { user, isGuest, loading } = useAuth()
  const { items, busy, error, add, toggleMilestone, remove } = useRoadmaps()
  const access = useAccess()
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState(() => localStorage.getItem('mp_style') || 'Visual')

  if (loading) return <main className="auth"><div className="spin" /></main>
  if (!user && !isGuest) return <AuthScreen />
  if (access.status === 'guest-expired') return <AuthScreen forced />        // guests must create a free account
  if (access.status === 'loading') return <main className="auth"><div className="spin" /></main>
  if (access.status === 'activating') return <main className="auth"><div className="auth-card"><div className="spin" /><p className="muted">Payment received. Activating your subscription…</p></div></main>
  if (access.status === 'expired') return <PaywallModal />                  // trial over, not subscribed

  const pick = (s) => { setStyle(s); localStorage.setItem('mp_style', s); if (user) saveLearningStyle(user.id, s).catch(() => {}) }
  const create = () => { if (topic.trim()) { add(sample(topic.trim(), style)); setTopic('') } }

  return (
    <main className="page">
      <TrialBanner status={access.status} daysLeft={access.daysLeft} />
      <ProfileCard />
      <h1>What do you want to master today?</h1>
      <div className="chips">{STYLES.map((s) => <button key={s} className={'chip' + (s === style ? ' on' : '')} onClick={() => pick(s)}>{s}</button>)}</div>
      <div className="glass row">
        <div className="field"><RotatingHint hidden={!!topic} /><input className="input" aria-label="What do you want to master?" value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()} /></div>
        <button className="btn primary small" onClick={create}>Start</button>
      </div>
      {error && <p className="note err">{error}</p>}
      {busy && <div className="spin" />}
      {items.map((r) => (
        <article className="glass" key={r.id}>
          <div className="row"><h3>{r.topic}</h3><button className="link" onClick={() => remove(r.id)}>Delete</button></div>
          <div className="bar"><i style={{ width: percent(r) + '%' }} /></div>
          <small className="muted">{percent(r)}% to Mastery</small>
          {r.phases.map((p) => (
            <div key={p.title}><h4>{p.title}</h4>
              {p.milestones.map((m) => (
                <label className="ms" key={m.id}>
                  <input type="checkbox" checked={r.completed_milestones.includes(m.id)} onChange={() => toggleMilestone(r.id, m.id)} /> {m.title}
                </label>
              ))}
            </div>
          ))}
        </article>
      ))}
    </main>
  )
}
