import { useEffect, useState } from 'react'

const WORDS = ['quantum computing', 'boxing footwork', 'sourdough bread', 'financial accounting', 'sprinting', 'public speaking', 'guitar chords', 'Python basics']

// "Master ___" with the example word sliding out and the next one sliding in (iOS-style).
export default function RotatingHint({ hidden }) {
  const [i, setI] = useState(0)
  const [phase, setPhase] = useState('in')
  useEffect(() => {
    const t = setInterval(() => {
      setPhase('out')
      setTimeout(() => {
        setI((x) => (x + 1) % WORDS.length)
        setPhase('pre')
        requestAnimationFrame(() => requestAnimationFrame(() => setPhase('in')))
      }, 400)
    }, 2600)
    return () => clearInterval(t)
  }, [])
  return (
    <div className={'ph' + (hidden ? ' gone' : '')} aria-hidden="true">
      <span>Master</span><span className={'phw ' + phase}>{WORDS[i]}</span>
    </div>
  )
}
