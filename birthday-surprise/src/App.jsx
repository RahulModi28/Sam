import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import Lenis from '@studio-freight/lenis'
import EscapeRoom from './components/EscapeRoom'
import Transition from './components/Transition'
import Scrapbook from './components/Scrapbook'

function App() {
  const [phase, setPhase] = useState(() => {
    // Check if user has already unlocked the scrapbook previously
    return localStorage.getItem('birthday_unlocked') === 'true' ? 'scrapbook' : 'escape'
  })
  const appRef = useRef(null)

  useEffect(() => {
    // Initialize Lenis smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  const handleEscapeComplete = () => {
    setPhase('transition')
  }

  const handleTransitionComplete = () => {
    localStorage.setItem('birthday_unlocked', 'true')
    setPhase('scrapbook')
  }

  return (
    <div ref={appRef} className="app">
      {phase === 'escape' && (
        <EscapeRoom onComplete={handleEscapeComplete} />
      )}
      {phase === 'transition' && (
        <Transition onComplete={handleTransitionComplete} />
      )}
      {phase === 'scrapbook' && (
        <Scrapbook />
      )}
    </div>
  )
}

export default App
