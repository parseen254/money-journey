import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ERAS, type Era } from '../eras'
import './Barter.css'

gsap.registerPlugin(ScrollTrigger)

const BARTER: Era = ERAS.find((era) => era.id === 'barter')!
const BEAM_PIVOT_X = 100
const BEAM_PIVOT_Y = 58

export default function Barter() {
  const rootRef = useRef<HTMLElement>(null)
  const beamRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const beam = beamRef.current
    if (!root || !beam) return

    const ctx = gsap.context(() => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const angle = { v: reducedMotion ? 0 : -12 }

      beam.setAttribute('transform', `rotate(${angle.v} ${BEAM_PIVOT_X} ${BEAM_PIVOT_Y})`)
      if (reducedMotion) return

      gsap.to(angle, {
        v: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top 80%',
          end: 'bottom 40%',
          scrub: true,
        },
        onUpdate: () => {
          beam.setAttribute('transform', `rotate(${angle.v} ${BEAM_PIVOT_X} ${BEAM_PIVOT_Y})`)
        },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="exp-chapter" id="ch-barter" data-chapter>
      <div className="exp-chapter-inner align-left">
        <p className="exp-kicker" data-reveal>
          {BARTER.kicker}
        </p>
        <h2 className="exp-title" data-reveal>
          {BARTER.title}
        </h2>
        <p className="exp-body" data-reveal>
          {BARTER.body}
        </p>

        <figure className="barter-scale" data-reveal>
          <svg viewBox="0 0 200 150" aria-hidden="true" focusable="false">
            <line className="barter-scale-mast" x1="100" y1="32" x2="100" y2="132" />
            <path className="barter-scale-foot" d="M70 132 H130 M82 140 H118" />
            <g ref={beamRef} transform="rotate(-12 100 58)">
              <line className="barter-scale-beam" x1="32" y1="58" x2="168" y2="58" />
              <path className="barter-scale-finial" d="M94 58 L100 46 L106 58" />
              <g className="barter-scale-pan">
                <line x1="48" y1="58" x2="48" y2="101" />
                <line x1="32" y1="58" x2="39" y2="101" />
                <line x1="64" y1="58" x2="57" y2="101" />
                <path d="M28 101 Q48 118 68 101" />
              </g>
              <g className="barter-scale-pan">
                <line x1="152" y1="58" x2="152" y2="101" />
                <line x1="136" y1="58" x2="143" y2="101" />
                <line x1="168" y1="58" x2="161" y2="101" />
                <path d="M132 101 Q152 118 172 101" />
              </g>
            </g>
            <circle className="barter-scale-hub" cx="100" cy="58" r="4" />
          </svg>
          <figcaption>
            <span>FAIR EXCHANGE</span>
            <span>GRAIN = COWRIE</span>
          </figcaption>
        </figure>

        <dl className="exp-instrument-readout" data-reveal>
          {BARTER.facts.map((fact) => (
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
