import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowUp, Wallet } from 'lucide-react'
import { scrollApi } from '../components/SmoothScroll'
import Barter from './chapters/Barter'
import Coin from './chapters/Coin'
import Paper from './chapters/Paper'
import Plastic from './chapters/Plastic'
import Mobile from './chapters/Mobile'
import Crypto from './chapters/Crypto'
import { ERAS } from './eras'
import './Experience.css'

gsap.registerPlugin(ScrollTrigger)

const JOURNEY_START_YEAR = 1780
const JOURNEY_END_YEAR = 2026
const HOLD_DURATION = 1.4
const FOUNDING_CAP = 10_000
const FOUNDING_PLACES = 8_412

function Words({ children }: { children: string }) {
  return children.split(' ').map((word, index) => (
    <span key={`${word}-${index}`} className="exp-display-word" data-word aria-hidden="true">
      {word}
    </span>
  ))
}

export default function Experience() {
  const rootRef = useRef<HTMLDivElement>(null)
  const yearRef = useRef<HTMLSpanElement>(null)
  const railRef = useRef<HTMLOListElement>(null)
  const placesRef = useRef<HTMLSpanElement>(null)
  const holdRef = useRef<HTMLButtonElement>(null)
  const holdTween = useRef<gsap.core.Tween | null>(null)
  const joinedRef = useRef(false)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const renderJourney = (progress: number) => {
        const year = Math.round(JOURNEY_START_YEAR + progress * (JOURNEY_END_YEAR - JOURNEY_START_YEAR))
        if (yearRef.current) yearRef.current.textContent = String(year)

        const activeIndex = Math.min(ERAS.length - 1, Math.floor(progress * ERAS.length))
        railRef.current?.querySelectorAll('li').forEach((station, index) => {
          station.classList.toggle('is-active', index === activeIndex)
        })
      }

      renderJourney(0)
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => renderJourney(self.progress),
      })

      if (reducedMotion) {
        gsap.set('[data-reveal]', { y: 0, opacity: 1 })
        if (placesRef.current) placesRef.current.textContent = FOUNDING_PLACES.toLocaleString('en-KE')
        return
      }

      // Every imported chapter participates in the same entrance and exit
      // rhythm. Chapter components own only their instrument timelines.
      gsap.utils.toArray<HTMLElement>('[data-chapter]').forEach((section) => {
        const items = section.querySelectorAll('[data-reveal]')
        if (items.length === 0) return

        gsap.fromTo(
          items,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              end: 'top 30%',
              scrub: true,
            },
          },
        )

        gsap.to(items, {
          y: -36,
          opacity: 0,
          stagger: 0.06,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'bottom 55%',
            end: 'bottom 15%',
            scrub: true,
          },
        })
      })

      gsap.fromTo(
        '.hero .exp-display [data-word]',
        { y: 0, opacity: 1 },
        {
          y: -60,
          opacity: 0,
          letterSpacing: '0.08em',
          stagger: 0.02,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom 40%',
            scrub: true,
          },
        },
      )

      const placesProxy = { value: 0 }
      gsap.to(placesProxy, {
        value: FOUNDING_PLACES,
        ease: 'none',
        scrollTrigger: {
          trigger: '#ch-close',
          start: 'top 80%',
          end: 'center 60%',
          scrub: true,
        },
        onUpdate: () => {
          if (placesRef.current && !joinedRef.current) {
            placesRef.current.textContent = Math.round(placesProxy.value).toLocaleString('en-KE')
          }
        },
      })
    }, root)

    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      cancelAnimationFrame(refreshFrame)
      ctx.revert()
    }
  }, [])

  useEffect(
    () => () => {
      holdTween.current?.kill()
    },
    [],
  )

  const completeJoin = () => {
    if (joinedRef.current) return
    joinedRef.current = true
    holdTween.current = null
    holdRef.current?.style.setProperty('--hold', '1')
    setJoined(true)
    if (placesRef.current) placesRef.current.textContent = (FOUNDING_PLACES + 1).toLocaleString('en-KE')
  }

  const beginHold = (event: PointerEvent<HTMLButtonElement>) => {
    if (joinedRef.current) return
    const button = holdRef.current
    if (!button) return

    event.currentTarget.setPointerCapture(event.pointerId)
    holdTween.current?.kill()
    const proxy = { value: Number(button.style.getPropertyValue('--hold') || 0) }
    holdTween.current = gsap.to(proxy, {
      value: 1,
      duration: HOLD_DURATION * (1 - proxy.value),
      ease: 'none',
      onUpdate: () => button.style.setProperty('--hold', String(proxy.value)),
      onComplete: completeJoin,
    })
  }

  const endHold = () => {
    if (joinedRef.current) return
    const button = holdRef.current
    if (!button) return

    holdTween.current?.kill()
    holdTween.current = null
    const proxy = { value: Number(button.style.getPropertyValue('--hold') || 0) }
    gsap.to(proxy, {
      value: 0,
      duration: 0.3,
      ease: 'power2.out',
      onUpdate: () => button.style.setProperty('--hold', String(proxy.value)),
    })
  }

  const onHoldKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (joinedRef.current) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      completeJoin()
    }
  }

  return (
    <div ref={rootRef} className="experience">
      <header className="exp-header">
        <p className="exp-wordmark">
          MKOBA
          <span className="exp-wordmark-sub">MONEY, MOVED · NAIROBI</span>
        </p>
        <div className="exp-header-right">
          <a className="exp-reserve-link" href="#ch-close">
            FOUNDING ACCOUNTS
          </a>
        </div>
      </header>

      <nav className="exp-rail" aria-label="Money through time">
        <p className="exp-rail-readout">
          <span className="exp-rail-readout-label">JOURNEY YEAR</span>
          <span ref={yearRef}>1780</span>
        </p>
        <ol ref={railRef}>
          {ERAS.map((era, stationIndex) => (
            <li key={era.id} className={stationIndex === 0 ? 'is-active' : ''}>
              <a href={`#ch-${era.id}`} aria-label={`${era.id}, ${era.years}`}>
                <span className="exp-rail-idx">{String(era.index).padStart(2, '0')}</span>
                <span className="exp-rail-name">{era.id.toUpperCase()}</span>
                <span className="exp-rail-year">{era.yearStart}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <section className="exp-chapter hero" data-chapter aria-label="Introduction">
        <div className="exp-chapter-inner hero-inner">
          <p className="exp-kicker" data-reveal>
            A KENYAN HISTORY OF MOVEMENT · 1780—2026
          </p>
          <h1 className="exp-display" aria-label="Money has always moved. Now it moves with you.">
            <span className="exp-display-line">
              <Words>Money has always moved.</Words>
            </span>
            <em className="exp-display-line">
              <Words>Now it moves with you.</Words>
            </em>
          </h1>
          <p className="exp-body hero-sub" data-reveal>
            From cowrie exchange on the Swahili coast to value moving at network speed, Kenya's money
            has never stood still. Scroll through 240 years of trade, trust and technology—and see
            where MKOBA carries the story next.
          </p>
          <p className="exp-scroll-cue" data-reveal aria-hidden="true">
            SCROLL — 1780 → 2026 ↓
          </p>
        </div>
      </section>

      <Barter />
      <Coin />
      <Paper />
      <Plastic />
      <Mobile />
      <Crypto />

      <section
        className="exp-chapter close-chapter"
        id="ch-close"
        data-chapter
        aria-label="Founding accounts waitlist"
      >
        <div className="exp-chapter-inner align-center close-inner">
          <p className="exp-kicker" data-reveal>
            FOUNDING ACCOUNTS
          </p>
          <h2 className="exp-title" data-reveal>
            The next chapter of money is being written in Nairobi.
          </h2>
          <p className="exp-body" data-reveal>
            MKOBA is gathering its first circle of founding account holders—people who believe money
            should carry its history forward without slowing them down.
          </p>

          <div className="exp-cta-stack" data-reveal>
            <button
              ref={holdRef}
              type="button"
              className={`exp-hold ${joined ? 'is-reserved' : ''}`}
              onPointerDown={beginHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              onLostPointerCapture={endHold}
              onKeyDown={onHoldKey}
              aria-pressed={joined}
            >
              <Wallet size={14} aria-hidden="true" />
              {joined ? 'FOUNDING INTEREST RECORDED · Nº 8,413' : 'HOLD TO JOIN THE WAITLIST'}
            </button>
            <p className="exp-counter" aria-live="polite" aria-atomic="true">
              <span ref={placesRef}>0</span> / {FOUNDING_CAP.toLocaleString('en-KE')} FOUNDING PLACES
            </p>
            <p className="exp-microcopy">
              Joining is free and non-binding. MKOBA is a concept demonstration; it does not take
              deposits or promise financial returns.
            </p>
          </div>

          <footer className="exp-footer" data-reveal>
            <Link to="/prompt/">HOW THIS FILM WAS MADE →</Link>
            <button type="button" onClick={() => scrollApi().scrollTo(0)} className="exp-top">
              <ArrowUp size={12} aria-hidden="true" /> BACK TO 1780
            </button>
          </footer>
        </div>
      </section>
    </div>
  )
}
