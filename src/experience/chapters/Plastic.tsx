import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ERAS, type Era } from '../eras'
import './Plastic.css'

gsap.registerPlugin(ScrollTrigger)

const PLASTIC_ERA: Era = ERAS.find((era) => era.id === 'plastic')!
const PAN_GROUPS = ['4087', '1966', '2007', '2026']

export default function Plastic() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const digits = gsap.utils.toArray<HTMLElement>('[data-pan-digit]')
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reducedMotion) {
        gsap.set(digits, { opacity: 1, y: 0 })
        return
      }

      gsap.fromTo(
        digits,
        { opacity: 0.08, y: 12 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.075,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top 78%',
            end: 'bottom 42%',
            scrub: true,
          },
        },
      )
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="exp-chapter plastic-chapter"
      id="ch-plastic"
      data-chapter
      aria-labelledby="plastic-title"
    >
      <div className="exp-chapter-inner align-left">
        <p className="exp-kicker" data-reveal>
          {PLASTIC_ERA.kicker}
        </p>
        <h2 className="exp-title" id="plastic-title" data-reveal>
          {PLASTIC_ERA.title}
        </h2>
        <p className="exp-body" data-reveal>
          {PLASTIC_ERA.body}
        </p>

        <figure className="plastic-embosser" data-reveal>
          <div className="plastic-pan" aria-label={`Card number ${PAN_GROUPS.join(' ')}`}>
            {PAN_GROUPS.map((group, groupIndex) => (
              <span className="plastic-pan-group" key={group}>
                {group.split('').map((digit, digitIndex) => (
                  <span data-pan-digit key={`${groupIndex}-${digitIndex}`}>
                    {digit}
                  </span>
                ))}
              </span>
            ))}
          </div>
          <figcaption>VALID FROM 1989</figcaption>
        </figure>

        <dl className="exp-instrument-readout" data-reveal>
          {PLASTIC_ERA.facts.map((fact) => (
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
