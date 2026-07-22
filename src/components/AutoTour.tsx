import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { scrollApi } from './SmoothScroll'
import './AutoTour.css'

gsap.registerPlugin(ScrollTrigger)

/** Film runtime in seconds. The 1× tour maps it across the full page; 2× halves it. */
const FILM_SECONDS = 48

type TourState = 'idle' | 'running' | 'paused' | 'done'

export default function AutoTour() {
  const [state, setState] = useState<TourState>('idle')
  const [speed, setSpeed] = useState<1 | 2>(1)
  const [started, setStarted] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const liveRef = useRef<HTMLSpanElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)
  const proxyRef = useRef({ p: 0 })
  const stateRef = useRef(state)
  stateRef.current = state
  const speedRef = useRef(speed)
  speedRef.current = speed

  const renderProgress = (p: number) => {
    const pct = `${Math.round(p * 100)}%`
    if (pctRef.current) pctRef.current.textContent = pct
    rootRef.current?.style.setProperty('--tour-progress', String(p))
    if (!started && p > 0.02) setStarted(true)
  }

  const killTween = () => {
    tweenRef.current?.kill()
    tweenRef.current = null
  }

  const launch = (fromProgress: number) => {
    killTween()
    const max = ScrollTrigger.maxScroll(window)
    if (max <= 0) return
    proxyRef.current.p = fromProgress
    const remaining = (1 - fromProgress) * (FILM_SECONDS / speedRef.current)
    tweenRef.current = gsap.to(proxyRef.current, {
      p: 1,
      duration: Math.max(0.1, remaining),
      ease: 'none',
      onUpdate: () => {
        scrollApi().scrollTo(proxyRef.current.p * ScrollTrigger.maxScroll(window), true)
        renderProgress(proxyRef.current.p)
      },
      onComplete: () => {
        renderProgress(1)
        setState('done')
        announce('Tour complete')
      },
    })
    setState('running')
  }

  const currentProgress = () => {
    const max = ScrollTrigger.maxScroll(window)
    return max > 0 ? window.scrollY / max : 0
  }

  const announce = (msg: string) => {
    if (liveRef.current) liveRef.current.textContent = msg
  }

  const onPrimary = () => {
    switch (stateRef.current) {
      case 'idle':
        launch(currentProgress())
        announce('Tour started')
        break
      case 'running':
        tweenRef.current?.pause()
        setState('paused')
        announce('Tour paused')
        break
      case 'paused':
        // Resume from wherever the user actually is, not a stale proxy.
        launch(currentProgress())
        announce('Tour resumed')
        break
      case 'done':
        scrollApi().scrollTo(0, true)
        renderProgress(0)
        launch(0)
        announce('Tour replaying')
        break
    }
  }

  const onRestart = () => {
    scrollApi().scrollTo(0, true)
    renderProgress(0)
    launch(0)
    announce('Tour restarted')
  }

  const onSpeed = (next: 1 | 2) => {
    setSpeed(next)
    speedRef.current = next
    if (stateRef.current === 'running') launch(currentProgress())
  }

  useEffect(() => {
    const pauseIfRunning = () => {
      if (stateRef.current === 'running') {
        tweenRef.current?.pause()
        setState('paused')
        announce('Tour paused')
      }
    }
    const onWheel = () => pauseIfRunning()
    const onTouchStart = () => pauseIfRunning()
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return
      pauseIfRunning()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (stateRef.current === 'running' || stateRef.current === 'paused') {
          // Stop entirely but leave the user's scroll position alone.
          killTween()
          setState('idle')
          announce('Tour stopped')
        }
        return
      }
      const scrollKeys = ['PageUp', 'PageDown', 'Home', 'End', ' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
      if (scrollKeys.includes(e.key)) pauseIfRunning()
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
      killTween()
    }
  }, [])

  const primaryLabel =
    state === 'idle' ? 'Begin the journey' : state === 'running' ? 'Pause' : state === 'paused' ? 'Resume' : 'Replay'

  return (
    <div ref={rootRef} className="auto-tour" role="group" aria-label="Journey playback">
      <button type="button" className="auto-tour__primary" onClick={onPrimary}>
        {state === 'running' ? <Pause size={12} aria-hidden /> : <Play size={12} aria-hidden />}
        {primaryLabel}
      </button>
      <span ref={pctRef} className="auto-tour__pct" aria-hidden="true">
        0%
      </span>
      {started && (
        <button type="button" className="auto-tour__restart" onClick={onRestart} aria-label="Restart tour">
          <RotateCcw size={12} aria-hidden />
        </button>
      )}
      <div className="auto-tour__speed" role="group" aria-label="Tour speed">
        <button
          type="button"
          aria-pressed={speed === 1}
          className={speed === 1 ? 'is-active' : ''}
          onClick={() => onSpeed(1)}
        >
          1×
        </button>
        <button
          type="button"
          aria-pressed={speed === 2}
          className={speed === 2 ? 'is-active' : ''}
          onClick={() => onSpeed(2)}
        >
          2×
        </button>
      </div>
      <span ref={liveRef} className="sr-only" aria-live="polite" />
    </div>
  )
}
