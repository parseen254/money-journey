import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ERAS, type Era } from '../eras'
import './Coin.css'

gsap.registerPlugin(ScrollTrigger)

const COIN: Era = ERAS.find((era) => era.id === 'coin')!
const TOTAL_STRIKES = 1741

export default function Coin() {
  const rootRef = useRef<HTMLElement>(null)
  const strikesRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const strikes = strikesRef.current
    if (!root || !strikes) return

    const ctx = gsap.context(() => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const strikesProxy = { v: reducedMotion ? TOTAL_STRIKES : 0 }

      strikes.textContent = String(Math.round(strikesProxy.v))
      if (reducedMotion) return

      gsap.to(strikesProxy, {
        v: TOTAL_STRIKES,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top 80%',
          end: 'bottom 40%',
          scrub: true,
        },
        onUpdate: () => {
          strikes.textContent = String(Math.round(strikesProxy.v))
        },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="exp-chapter" id="ch-coin" data-chapter>
      <div className="exp-chapter-inner align-right">
        <p className="exp-kicker" data-reveal>
          {COIN.kicker}
        </p>
        <h2 className="exp-title" data-reveal>
          {COIN.title}
        </h2>
        <p className="exp-body" data-reveal>
          {COIN.body}
        </p>

        <figure className="coin-strike-counter" data-reveal>
          <div className="coin-strike-face">
            <span className="coin-strike-label">STRIKES</span>
            <strong ref={strikesRef} className="coin-strike-number">
              0
            </strong>
            <span className="coin-strike-fineness">SILVER FINENESS .833</span>
          </div>
          <figcaption>THALER DIE REGISTER / INDIAN OCEAN TRADE</figcaption>
        </figure>

        <dl className="exp-instrument-readout" data-reveal>
          {COIN.facts.map((fact) => (
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
