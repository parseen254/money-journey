import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ERAS, type Era } from '../eras'
import './Crypto.css'

gsap.registerPlugin(ScrollTrigger)

const CRYPTO_ERA: Era = ERAS.find((era) => era.id === 'crypto')!
const BLOCK_HEIGHT = 850_000
const NODE_COUNT = 24

interface LedgerNode {
  x: number
  y: number
}

function makeLedgerNodes(count: number): LedgerNode[] {
  let seed = 0x4d4b4f42
  const next = () => {
    seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0
    return seed / 0x1_0000_0000
  }

  return Array.from({ length: count }, () => ({
    x: 7 + next() * 86,
    y: 9 + next() * 72,
  }))
}

const LEDGER_NODES = makeLedgerNodes(NODE_COUNT)
const CONNECTIONS = LEDGER_NODES.flatMap((_, index) => {
  const links = [[index, (index + 1) % NODE_COUNT]]
  if (index % 3 === 0) links.push([index, (index + 7) % NODE_COUNT])
  return links
})

export default function Crypto() {
  const rootRef = useRef<HTMLElement>(null)
  const blockRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<SVGLineElement>('[data-ledger-line]')
      const nodes = gsap.utils.toArray<SVGCircleElement>('[data-ledger-node]')
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      lines.forEach((line) => {
        const length = line.getTotalLength()
        gsap.set(line, { strokeDasharray: length, strokeDashoffset: length })
      })

      if (reducedMotion) {
        if (blockRef.current) blockRef.current.textContent = BLOCK_HEIGHT.toLocaleString('en-KE')
        gsap.set(lines, { strokeDashoffset: 0 })
        gsap.set(nodes, { opacity: 1, scale: 1 })
        return
      }

      const block = { value: 0 }
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 80%',
          end: 'bottom 38%',
          scrub: true,
        },
      })

      timeline
        .to(
          block,
          {
            value: BLOCK_HEIGHT,
            ease: 'none',
            onUpdate: () => {
              if (blockRef.current) blockRef.current.textContent = Math.round(block.value).toLocaleString('en-KE')
            },
          },
          0,
        )
        .to(lines, { strokeDashoffset: 0, stagger: 0.022, ease: 'none' }, 0)
        .fromTo(
          nodes,
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, transformOrigin: 'center', stagger: 0.025, ease: 'none' },
          0.08,
        )
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="exp-chapter crypto-chapter"
      id="ch-crypto"
      data-chapter
      aria-labelledby="crypto-title"
    >
      <div className="exp-chapter-inner align-center">
        <p className="exp-kicker" data-reveal>
          {CRYPTO_ERA.kicker}
        </p>
        <h2 className="exp-title" id="crypto-title" data-reveal>
          {CRYPTO_ERA.title}
        </h2>
        <p className="exp-body" data-reveal>
          {CRYPTO_ERA.body}
        </p>

        <figure className="crypto-ledger" data-reveal>
          <p className="crypto-block">
            BLOCK 0 → <span ref={blockRef}>0</span>
          </p>
          <svg viewBox="0 0 100 88" aria-hidden="true" focusable="false">
            <g className="crypto-lines">
              {CONNECTIONS.map(([from, to], index) => (
                <line
                  data-ledger-line
                  key={`${from}-${to}-${index}`}
                  x1={LEDGER_NODES[from].x}
                  y1={LEDGER_NODES[from].y}
                  x2={LEDGER_NODES[to].x}
                  y2={LEDGER_NODES[to].y}
                />
              ))}
            </g>
            <g className="crypto-nodes">
              {LEDGER_NODES.map((node, index) => (
                <circle data-ledger-node key={index} cx={node.x} cy={node.y} r={index % 5 === 0 ? 1.25 : 0.72} />
              ))}
            </g>
          </svg>
          <figcaption>AN OPEN LEDGER, WITNESSED EVERYWHERE</figcaption>
        </figure>

        <dl className="exp-instrument-readout" data-reveal>
          {CRYPTO_ERA.facts.map((fact) => (
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
