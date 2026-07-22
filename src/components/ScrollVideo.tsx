import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Exponential damping rate (per second). Higher = snappier scrub. */
const DAMPING = 6
/** Damping rate under prefers-reduced-motion: effectively immediate. */
const DAMPING_REDUCED = 60
/** Minimum playhead delta (seconds) before a new seek is issued. */
const SEEK_EPSILON = 1 / 60
/** Maximum mouse-parallax translation in px, and the cover overscan for it. */
const PARALLAX_SHIFT = 12
const PARALLAX_SCALE = 1.05

export default function ScrollVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const bufferedRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const frame = frameRef.current
    if (!video || !frame) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const damping = reducedMotion ? DAMPING_REDUCED : DAMPING

    let duration = 0
    let targetProgress = 0
    let playhead = 0
    let seeking = false
    let disposed = false

    const onLoadedMetadata = () => {
      duration = video.duration
    }
    const onCanPlay = () => setReady(true)
    const onError = () => setFailed(true)

    const onProgress = () => {
      if (!bufferedRef.current || !duration || video.buffered.length === 0) return
      const end = video.buffered.end(video.buffered.length - 1)
      bufferedRef.current.style.transform = `scaleX(${Math.min(1, end / duration)})`
    }

    // Release the seeking gate on 'seeked'. requestVideoFrameCallback is
    // used only as an additional early release when a frame presents ahead
    // of the event — never as the sole gate, since a paused video whose
    // frame already presented may never invoke it (deadlock).
    const releaseSeek = () => {
      if (disposed) return
      seeking = false
    }

    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('error', onError)
    video.addEventListener('progress', onProgress)
    video.addEventListener('seeked', releaseSeek)
    if (video.readyState >= 1) onLoadedMetadata()
    if (video.readyState >= 3) setReady(true)

    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        // Only record the newest target; the RAF loop owns the video.
        targetProgress = self.progress
        document.documentElement.style.setProperty('--journey', String(self.progress))
      },
    })

    const tick = (_time: number, deltaMs: number) => {
      if (!duration) return
      const dt = deltaMs / 1000
      const target = targetProgress * duration
      // Frame-rate-independent exponential ease toward the newest target.
      playhead += (target - playhead) * (1 - Math.exp(-damping * dt))
      // Never issue a seek while the decoder is busy; the newest playhead
      // is picked up on the next tick after 'seeked' drains, so stale
      // values can never drag the film backward.
      if (!seeking && Math.abs(playhead - video.currentTime) > SEEK_EPSILON) {
        seeking = true
        video.currentTime = gsap.utils.clamp(0, Math.max(0, duration - 0.01), playhead)
        if ('requestVideoFrameCallback' in video) {
          video.requestVideoFrameCallback(() => {
            seeking = false
          })
        }
      }
    }
    gsap.ticker.add(tick)

    // Subtle desktop mouse parallax; never on touch, never under reduced motion.
    const finePointer = window.matchMedia('(pointer: fine)').matches
    let quickX: ((v: number) => void) | null = null
    let quickY: ((v: number) => void) | null = null
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      quickX?.(-nx * PARALLAX_SHIFT)
      quickY?.(-ny * PARALLAX_SHIFT)
    }
    if (finePointer && !reducedMotion) {
      gsap.set(frame, { scale: PARALLAX_SCALE })
      quickX = gsap.quickTo(frame, 'x', { duration: 0.6, ease: 'power2.out' })
      quickY = gsap.quickTo(frame, 'y', { duration: 0.6, ease: 'power2.out' })
      window.addEventListener('pointermove', onPointerMove)
    }

    return () => {
      disposed = true
      trigger.kill()
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onPointerMove)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('error', onError)
      video.removeEventListener('progress', onProgress)
      video.removeEventListener('seeked', releaseSeek)
      // Intentionally leave video.src untouched: StrictMode re-runs this
      // effect and stripping the source would force a full re-download.
    }
  }, [src])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-obsidian" aria-hidden="true">
      <div ref={frameRef} className="absolute inset-0">
        {!failed && (
          <video
            ref={videoRef}
            src={src}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            tabIndex={-1}
          />
        )}
        {failed && (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,#1a1a22_0%,#0a0a0c_70%)]">
            <p className="font-mono text-xs tracking-[0.3em] text-bone-dim uppercase">
              Film unavailable — the catalogue continues below
            </p>
          </div>
        )}
      </div>

      {/* Readability veil: the film runs bright (dawn, fluorescent halls, gold),
          so a fixed darkening layer + vignette keeps chrome text legible over
          any frame without hiding the footage. Sits above the video, still
          inside the -z-10 background layer so page content stays on top. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(8,8,11,0.42) 0%, rgba(8,8,11,0.20) 26%, rgba(8,8,11,0.30) 62%, rgba(8,8,11,0.62) 100%), radial-gradient(ellipse 90% 80% at 50% 42%, transparent 42%, rgba(8,8,11,0.5) 100%)',
        }}
      />

      {/* Restrained loading overlay with buffered progress */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-4 bg-obsidian transition-opacity duration-700 ${
          ready || failed ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <p className="font-mono text-[11px] tracking-[0.4em] text-bone-dim uppercase">
          Preparing the film
        </p>
        <div className="h-px w-40 overflow-hidden bg-carbon">
          <div
            ref={bufferedRef}
            className="h-full w-full origin-left scale-x-0 bg-amber transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  )
}
