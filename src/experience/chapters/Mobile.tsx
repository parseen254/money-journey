import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ERAS, type Era } from '../eras'
import './Mobile.css'

gsap.registerPlugin(ScrollTrigger)

const MOBILE_ERA: Era = ERAS.find((era) => era.id === 'mobile')!
const CONFIRMATION = 'MPESA: Confirmed. KES 1,200 sent to MAMA MBOGA.'
const DAILY_KES = 1_200_000_000

export default function Mobile() {
  const rootRef = useRef<HTMLElement>(null)
  const messageRef = useRef<HTMLSpanElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reducedMotion) {
        if (messageRef.current) messageRef.current.textContent = CONFIRMATION
        if (counterRef.current) counterRef.current.textContent = DAILY_KES.toLocaleString('en-KE')
        return
      }

      const progress = { value: 0 }
      gsap.to(progress, {
        value: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top 78%',
          end: 'bottom 40%',
          scrub: true,
        },
        onUpdate: () => {
          const characters = Math.round(progress.value * CONFIRMATION.length)
          if (messageRef.current) messageRef.current.textContent = CONFIRMATION.slice(0, characters)
          if (counterRef.current) {
            counterRef.current.textContent = Math.round(progress.value * DAILY_KES).toLocaleString('en-KE')
          }
        },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="exp-chapter mobile-chapter"
      id="ch-mobile"
      data-chapter
      aria-labelledby="mobile-title"
    >
      <div className="exp-chapter-inner align-right">
        <p className="exp-kicker" data-reveal>
          {MOBILE_ERA.kicker}
        </p>
        <h2 className="exp-title" id="mobile-title" data-reveal>
          {MOBILE_ERA.title}
        </h2>
        <p className="exp-body" data-reveal>
          {MOBILE_ERA.body}
        </p>

        <figure className="mobile-ussd" data-reveal>
          <div className="mobile-lcd" aria-hidden="true">
            <span ref={messageRef} className="mobile-message" />
            <span className="mobile-cursor">_</span>
          </div>
          <p className="mobile-volume" aria-hidden="true">
            KES 0 → <span ref={counterRef}>0</span> MOVED DAILY
          </p>
          <figcaption className="mobile-a11y">
            {CONFIRMATION} KES 0 to 1,200,000,000 moved daily.
          </figcaption>
        </figure>

        <dl className="exp-instrument-readout" data-reveal>
          {MOBILE_ERA.facts.map((fact) => (
            <div key={fact.dt}>
              <dt>{fact.dt}</dt>
              <dd>{fact.dd}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
