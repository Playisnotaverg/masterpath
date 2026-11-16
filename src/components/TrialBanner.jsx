export default function TrialBanner({ status, daysLeft }) {
  if (status !== 'trial' && status !== 'guest-trial') return null
  return (
    <div className="glass trialb">
      <b>Free trial</b> · {daysLeft} day{daysLeft === 1 ? '' : 's'} left, then $1.25/month to keep using the app
      {status === 'guest-trial' && <small className="muted"> You’ll need a free account to continue after your trial.</small>}
    </div>
  )
}
