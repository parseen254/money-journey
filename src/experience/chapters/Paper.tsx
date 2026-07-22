import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ERAS, type Era } from '../eras'
import './Paper.css'

gsap.registerPlugin(ScrollTrigger)

const PAPER: Era = ERAS.find((era) => era.id === 'paper')!
const FINAL_SERIAL = 582040

function makeRosettePath(radius: number, amplitude: number, lobes: number) {
  const points = 144
  const center = 70
  let path = ''

  for (let index = 0; index <= points; index += 1) {
    const theta = (index / points) * Math.PI * 2
    const r = radius + Math.sin(theta * lobes) * amplitude
    const x = center + Math.cos(theta) * r
    const y = center + Math.sin(theta) * r
    path += `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)} `
  }

  return `${path}Z`
}

const ROSETTES = [
  makeRosettePath(54, 4.6, 12),
  makeRosettePath(43, 3.8, 10),
  makeRosettePath(32, 3.2, 8),
  makeRosettePath(21, 2.4, 6),
]

export default function Paper() {
  const rootRef = useRef<HTMLElement>(null)
  const serialRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const serial = serialRef.current
    if (!root || !serial) return

    const ctx = gsap.context(() => {
      const paths = root.querySelectorAll<SVGPathElement>('.paper-rosette-path')
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const serialProxy = { v: reducedMotion ? FINAL_SERIAL : 1 }

      serial.textContent = `A${String(Math.round(serialProxy.v)).padStart(6, '0')}`

      if (reducedMotion) {
        gsap.set(paths, { strokeDashoffset: 0 })
        return
      }

      gsap.fromTo(
        paths,
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top 80%',
            end: 'bottom 40%',
            scrub: true,
          },
        },
      )

      gsap.to(serialProxy, {
        v: FINAL_SERIAL,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top 80%',
          end: 'bottom 40%',
          scrub: true,
        },
        onUpdate: () => {
          serial.textContent = `A${String(Math.round(serialProxy.v)).padStart(6, '0')}`
        },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="exp-chapter" id="ch-paper" data-chapter>
      <div className="exp-chapter-inner align-left">
        <p className="exp-kicker" data-reveal>
          {PAPER.kicker}
        </p>
        <h2 className="exp-title" data-reveal>
          {PAPER.title}
        </h2>
        <p className="exp-body" data-reveal>
          {PAPER.body}
        </p>

        <figure className="paper-security-instrument" data-reveal>
          <div className="paper-security-plate">
            <svg viewBox="0 0 140 140" aria-hidden="true" focusable="false">
              {ROSETTES.map((path, index) => (
                <path
                  key={path}
                  className={`paper-rosette-path paper-rosette-path-${index + 1}`}
                  d={path}
                  pathLength="1"
                />
              ))}
            </svg>
            <div className="paper-serial-block">
              <span>SERIAL / KENYA</span>
              <strong ref={serialRef}>A000001</strong>
              <span>INTAGLIO REGISTER</span>
            </div>
          </div>
          <figcaption>GUILLOCHE SECURITY FIELD / ISSUE CONTROL</figcaption>
        </figure>

        <dl className="exp-instrument-readout" data-reveal>
          {PAPER.facts.map((fact) => (
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
