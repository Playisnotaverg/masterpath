import { useAuth } from '../context/AuthContext'

export default function ProfileCard() {
  const { user, isGuest, signOut } = useAuth()
  const meta = user?.user_metadata || {}
  const name = meta.full_name || meta.name || user?.email?.split('@')[0] || 'Guest'
  const avatar = meta.avatar_url || meta.picture

  return (
    <section className="glass profile">
      <div className="avatar">
        {avatar ? <img src={avatar} alt="" referrerPolicy="no-referrer" /> : <span>{name[0]?.toUpperCase()}</span>}
      </div>
      <div className="who">
        <b>{isGuest ? 'Guest mode' : name}</b>
        <small>{isGuest ? 'Progress is saved on this device only' : user?.email}</small>
      </div>
      <button className="btn ghost small" onClick={signOut}>{isGuest ? 'Sign in' : 'Sign out'}</button>
    </section>
  )
}
