import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Copy } from 'lucide-react'

interface EraPrompt {
  id: string
  label: string
  years: string
  prompt: string
}

const ERA_PROMPTS: EraPrompt[] = [
  {
    id: 'barter',
    label: 'BARTER',
    years: 'Swahili coast, c. 1780s',
    prompt: `Single continuous 8-second cinematic macro shot at golden dawn in a Swahili
coast market square, Mombasa old town: camera glides forward low over a woven
mkeka palm mat spread with trade goods — pyramids of sorghum and millet grain,
grey-pink slabs of rock salt, folded indigo kanga cloth, strings of glossy
cowrie shells — as two weathered hands meet above the mat exchanging a measure
of grain for a string of cowries, dhow lateen sails and coral-stone walls soft
in the background haze, Indian Ocean monsoon light, dust motes glowing, camera
pushing steadily forward and down toward the traded cowrie string until a
single porcelain-white cowrie shell fills the frame, its ribbed aperture
crisp, held between thumb and forefinger. ⟨SEAM: final frame = one cowrie
shell filling center frame between two fingertips, warm dawn backlight⟩.
Photorealistic documentary macro, physically accurate textures, strong forward
parallax, seamless one-take motion, no cuts, restrained amber-and-teal grade.`,
  },
  {
    id: 'coin',
    label: 'COIN',
    years: 'Indian Ocean silver, 1800s',
    prompt: `⟨SEAM: opens on the exact final frame — a single cowrie shell filling center
frame between two fingertips, warm dawn backlight⟩. Continuing the same
forward camera motion: the cowrie's ribbed porcelain surface catches fire-glow
and dissolves into flowing molten silver, camera riding the silver stream as
it pours into an open bronze coin die in a lamplit coastal mint workshop,
charcoal embers and crucible smoke, a hammer face descends in slow motion and
strikes — the impact blooming a pressure-wave of light — lifting to reveal a
freshly struck Maria Theresa thaler, the empress's profile and double eagle
crisply embossed, edge lettering catching lamplight, Arabic trade-weight
scales and rupee coins blurred on the workbench behind, camera pushing in
until the thaler's silver face fills the frame, still heat-shimmering.
⟨SEAM: final frame = struck silver thaler face filling center frame, faint
heat shimmer, lamplit⟩. Photorealistic macro, physically accurate molten
metal, strong forward parallax, seamless one-take, no cuts, amber-teal grade.`,
  },
  {
    id: 'paper',
    label: 'PAPER',
    years: 'East African Currency Board → Kenya shilling, 1920s–1966',
    prompt: `⟨SEAM: opens on the exact final frame — struck silver thaler face filling
center frame, faint heat shimmer, lamplit⟩. The thaler's embossed relief
flattens and etches itself into a polished steel intaglio plate, camera
gliding forward across the plate as engraved guilloche lathe-lines spiral
outward like ploughed fields, ink floods the grooves in deep green and
orange, the plate rolls through a thundering sheet-fed press in a 1960s
security-printing hall — fluorescent light, drying racks, serial numbers
stamping in sequence — sheets of newly printed East African and Kenya
shilling banknotes fanning past the lens in slow motion, watermark lions
ghosting through the paper against the light, camera diving toward one note
until its central engraved guilloche rosette fills the frame, fibers and
raised intaglio ink visible. ⟨SEAM: final frame = banknote guilloche rosette
filling center frame, green-orange engraved lines, backlit paper fiber⟩.
Photorealistic macro, accurate print textures, forward parallax, one take,
no cuts, amber-teal grade.`,
  },
  {
    id: 'plastic',
    label: 'PLASTIC',
    years: 'Nairobi ATM era, 1990s',
    prompt: `⟨SEAM: opens on the exact final frame — banknote guilloche rosette filling
center frame, green-orange engraved lines, backlit paper fiber⟩. The engraved
rosette lines liquefy into rainbow diffraction and reform as the hologram
patch of a payment card, camera sliding forward along the card's surface as
an embossing machine punches raised silver numbers one by one, each strike a
small percussion of light, the card then gliding into the slot of a
street-side ATM at night on a rainy Nairobi avenue — CRT-green screen glow,
beige keypad worn smooth, city neon and matatu headlights bokeh-blurred in
wet reflections — the machine whirs, and the camera pushes past the returning
card into extreme macro on its square gold EMV chip, contact pads gleaming
like a tiny city grid. ⟨SEAM: final frame = gold EMV chip filling center
frame, contact-pad grid crisp, cool night light with green screen glow⟩.
Photorealistic macro, accurate materials, forward parallax, one take, no
cuts, amber-teal grade.`,
  },
  {
    id: 'mobile',
    label: 'MOBILE',
    years: 'M-Pesa, Nairobi 2007',
    prompt: `⟨SEAM: opens on the exact final frame — gold EMV chip filling center frame,
contact-pad grid crisp, cool night light with green screen glow⟩. The chip's
contact pads stretch into copper mainboard traces, camera flying low over the
circuit landscape which assembles itself into the inside of a candybar phone,
rising up through the keypad to a monochrome green LCD where a USSD money
transfer confirms — pixel text glowing softly — the phone held in a woman's
hand at a green-painted agent kiosk at dusk, safaricom-green paint flaking,
airtime posters, a mama mboga's vegetable stall beside it, Nairobi skyline
warming to violet, and as her thumb presses send the camera follows a single
luminous green signal pulse leaving the phone's antenna, arcing up over
corrugated-iron rooftops strung with power lines as thousands of phone
screens flicker on across the city below. ⟨SEAM: final frame = one bright
green signal pulse centered against deepening violet dusk sky above Nairobi
rooftops⟩. Photorealistic, accurate 2007-era hardware, forward parallax, one
take, no cuts, amber-teal grade with safaricom-green accent.`,
  },
  {
    id: 'crypto',
    label: 'CRYPTO',
    years: 'Subsea fiber to open ledger, now',
    prompt: `⟨SEAM: opens on the exact final frame — one bright green signal pulse
centered against deepening violet dusk sky above Nairobi rooftops⟩. The pulse
dives — camera chasing it down through cloud, into the Indian Ocean surf and
under the waves along a subsea fiber-optic cable on the seabed, light packets
strobing through the glass core past curious reef fish, the cable's light
erupting into a vast dark space where translucent blocks of light assemble
and chain themselves edge-to-edge, each block locking with a soft mechanical
bloom, the chain multiplying into a lattice constellation like a star map of
transactions, camera rising through the lattice back toward the surface where
dawn breaks over the same Swahili coast from the opening — a lone dhow sail
silhouetted on gold water — the constellation's lights settling into the sky
above it, full circle. ⟨FINAL: dawn ocean horizon, dhow silhouette, faint
ledger constellation above — hold last 10 frames near-static for scroll
ending⟩. Photorealistic with restrained abstraction in the lattice, forward
parallax, one take, no cuts, amber-teal grade resolving to warm gold.
`,
  },
]

function CopyPromptButton({ prompt, label }: { prompt: string; label: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-amber/70 bg-transparent px-4 py-2 text-[10px] tracking-[0.24em] text-amber-bright uppercase hover:bg-amber/15"
      aria-label={`Copy ${label} prompt`}
    >
      {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
      {copied ? 'Copied' : 'Copy prompt'}
    </button>
  )
}

export default function PromptPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-20 font-mono">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-[11px] tracking-[0.26em] text-teal-bright uppercase no-underline hover:text-bone"
      >
        <ArrowLeft size={12} aria-hidden="true" /> Back to the experience
      </Link>

      <header className="mt-10 border-b border-carbon pb-12">
        <p className="text-[10px] tracking-[0.34em] text-amber uppercase">MKOBA / Reconstruction record</p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-light text-bone sm:text-5xl">
          Six eras. One continuous passage.
        </h1>
        <p className="mt-5 max-w-2xl text-[13px] leading-relaxed text-bone-dim">
          The 48-second film was built in Flow SceneBuilder as a six-clip chain. BARTER begins as
          text-to-video; COIN through CRYPTO use <strong className="font-normal text-bone">extend</strong>,
          each opening on the literal final frame of the clip before it. Every boundary is written twice:
          the outgoing prompt closes with a seam contract, and the incoming prompt restates that exact
          composition before directing the next transformation.
        </p>
        <p className="mt-4 max-w-2xl text-[11px] leading-relaxed tracking-[0.08em] text-teal-bright">
          16:9 · 6 × 8 seconds · one forward-moving camera · no cuts within clips · East African spine
        </p>
      </header>

      <section className="mt-14" aria-labelledby="era-prompts">
        <h2 id="era-prompts" className="text-[11px] tracking-[0.32em] text-teal-bright uppercase">
          SceneBuilder chain
        </h2>
        <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-bone-dim">
          Global grade: warm amber highlights, deep teal shadows, physically accurate materials,
          documentary macro cinematography, no text overlays and no logos.
        </p>

        <div className="mt-10 flex flex-col gap-16">
          {ERA_PROMPTS.map((era, index) => (
            <article key={era.id} aria-labelledby={`prompt-${era.id}`}>
              <div className="flex flex-col items-start justify-between gap-5 border-b border-carbon pb-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-amber uppercase">
                    Clip {index + 1} / 06
                  </p>
                  <h3 id={`prompt-${era.id}`} className="mt-2 font-display text-3xl font-light text-bone">
                    {era.label}
                  </h3>
                  <p className="mt-1 text-[10px] tracking-[0.16em] text-bone-dim uppercase">{era.years}</p>
                </div>
                <CopyPromptButton prompt={era.prompt} label={era.label} />
              </div>
              <pre className="mt-5 overflow-x-auto border-l border-amber/60 py-1 pl-5 text-[11px] leading-[1.85] whitespace-pre-wrap text-bone-dim sm:text-[12px]">
                {era.prompt}
              </pre>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 border-t border-carbon pt-10" aria-labelledby="brand-brief">
        <h2 id="brand-brief" className="text-[11px] tracking-[0.32em] text-teal-bright uppercase">
          Brand brief
        </h2>
        <div className="mt-5 grid gap-7 text-[12px] leading-relaxed text-bone-dim sm:grid-cols-2">
          <p>
            <strong className="font-display text-xl font-normal text-bone">MKOBA</strong>
            <br />
            Swahili for satchel or wallet. A fictional Kenyan fintech tracing the materials, systems and
            human rituals that have carried value across generations.
          </p>
          <p>
            <span className="text-bone">“Money has always moved. Now it moves with you.”</span>
            <br />
            Voice: assured, historical, culturally Kenyan and editorial. No financial-return claims.
            Founding-account waitlist registration is free and non-binding.
          </p>
        </div>
      </section>

      <section className="mt-14 border-t border-carbon pt-10" aria-labelledby="post-production">
        <h2 id="post-production" className="text-[11px] tracking-[0.32em] text-teal-bright uppercase">
          Post-production
        </h2>
        <p className="mt-4 max-w-2xl text-[12px] leading-relaxed text-bone-dim">
          Download the six keepers, concatenate them with ffmpeg into one re-encoded stream, then run
          motion-compensated <code className="text-amber-bright">minterpolate</code> from 24 fps to 60 fps.
          Inspect contact strips frame by frame at every 8-second boundary before publishing{' '}
          <code className="text-amber-bright">/public/media/journey.mp4</code>.
        </p>
      </section>

      <p className="mt-16 text-[10px] tracking-[0.24em] text-bone-dim/60 uppercase">
        MKOBA · Nairobi · Money has always moved
      </p>
    </main>
  )
}
