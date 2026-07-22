import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Volume2, VolumeX } from 'lucide-react'
import './ScrollAudio.css'

const ERA_COUNT = 6
const MASTER_GAIN = 0.6
const GAIN_SMOOTHING_SECONDS = 0.15
const SUSPEND_DELAY_MS = 300
const ERA_URLS = Array.from({ length: ERA_COUNT }, (_, index) => `/media/audio/era-${index + 1}.m4a`)

type AudioGraph = {
  context: AudioContext
  master: GainNode
  gains: Array<GainNode | null>
  sources: AudioBufferSourceNode[]
}

function eraTargets(progress: number) {
  const x = Math.min(6, Math.max(0, progress * 6))
  const weights = Array.from({ length: ERA_COUNT }, (_, index) => {
    const distance = Math.abs(x - (index + 0.5))
    return distance < 0.3 ? 1 : Math.max(0, 1 - distance)
  })
  const total = weights.reduce((sum, weight) => sum + weight, 0)

  return weights.map((weight) => (total > 0 ? Math.sqrt(weight / total) : 0))
}

export default function ScrollAudio() {
  const [enabled, setEnabled] = useState(false)
  const enabledRef = useRef(false)
  const mountedRef = useRef(true)
  const graphRef = useRef<AudioGraph | null>(null)
  const loadAbortRef = useRef<AbortController | null>(null)
  const suspendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warnedRef = useRef(false)
  const progressRef = useRef(0)

  const warnOnce = useCallback(() => {
    if (warnedRef.current) return
    warnedRef.current = true
    console.warn('Scroll audio is unavailable because one or more era beds could not be loaded.')
  }, [])

  const applyEraMix = useCallback((graph: AudioGraph, progress: number) => {
    const targets = eraTargets(progress)
    const now = graph.context.currentTime
    graph.gains.forEach((gain, index) => {
      gain?.gain.setTargetAtTime(targets[index], now, GAIN_SMOOTHING_SECONDS)
    })
  }, [])

  const loadBeds = useCallback(
    async (graph: AudioGraph) => {
      const controller = new AbortController()
      loadAbortRef.current = controller

      const buffers = await Promise.all(
        ERA_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { signal: controller.signal })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            return await graph.context.decodeAudioData(await response.arrayBuffer())
          } catch (error) {
            if (!(error instanceof DOMException && error.name === 'AbortError')) warnOnce()
            return null
          }
        }),
      )

      if (!mountedRef.current || controller.signal.aborted || graphRef.current !== graph) return

      const startTime = graph.context.currentTime
      buffers.forEach((buffer, index) => {
        if (!buffer) return
        const source = graph.context.createBufferSource()
        const gain = graph.context.createGain()
        source.buffer = buffer
        source.loop = true
        gain.gain.value = 0
        source.connect(gain)
        gain.connect(graph.master)
        source.start(startTime)
        graph.gains[index] = gain
        graph.sources.push(source)
      })
      applyEraMix(graph, progressRef.current)
    },
    [applyEraMix, warnOnce],
  )

  const ensureGraph = useCallback(() => {
    if (graphRef.current) return graphRef.current
    if (typeof AudioContext === 'undefined') {
      warnOnce()
      return null
    }

    const context = new AudioContext()
    const master = context.createGain()
    master.gain.value = 0
    master.connect(context.destination)
    const graph: AudioGraph = {
      context,
      master,
      gains: Array<GainNode | null>(ERA_COUNT).fill(null),
      sources: [],
    }
    graphRef.current = graph
    void loadBeds(graph)
    return graph
  }, [loadBeds, warnOnce])

  const onToggle = useCallback(async () => {
    if (suspendTimerRef.current) {
      clearTimeout(suspendTimerRef.current)
      suspendTimerRef.current = null
    }

    if (enabledRef.current) {
      enabledRef.current = false
      setEnabled(false)
      const graph = graphRef.current
      if (!graph) return
      graph.master.gain.setTargetAtTime(0, graph.context.currentTime, GAIN_SMOOTHING_SECONDS)
      suspendTimerRef.current = setTimeout(() => {
        suspendTimerRef.current = null
        if (!enabledRef.current && graphRef.current === graph && graph.context.state === 'running') {
          void graph.context.suspend().catch(() => undefined)
        }
      }, SUSPEND_DELAY_MS)
      return
    }

    const graph = ensureGraph()
    if (!graph) return

    try {
      await graph.context.resume()
      if (!mountedRef.current) return
      enabledRef.current = true
      setEnabled(true)
      graph.master.gain.setTargetAtTime(MASTER_GAIN, graph.context.currentTime, GAIN_SMOOTHING_SECONDS)
      applyEraMix(graph, progressRef.current)
    } catch {
      warnOnce()
    }
  }, [applyEraMix, ensureGraph, warnOnce])

  useEffect(() => {
    mountedRef.current = true
    let lastRaw = ''

    const tick = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--journey')
      if (raw !== lastRaw) {
        lastRaw = raw
        const parsed = Number.parseFloat(raw)
        if (Number.isFinite(parsed)) progressRef.current = Math.min(1, Math.max(0, parsed))
      }

      const graph = graphRef.current
      if (graph) applyEraMix(graph, progressRef.current)
    }

    gsap.ticker.add(tick)
    return () => {
      mountedRef.current = false
      enabledRef.current = false
      gsap.ticker.remove(tick)
      loadAbortRef.current?.abort()
      if (suspendTimerRef.current) clearTimeout(suspendTimerRef.current)

      const graph = graphRef.current
      graphRef.current = null
      if (!graph) return
      graph.sources.forEach((source) => {
        try {
          source.stop()
        } catch {
          // A source may already have stopped during browser teardown.
        }
        source.disconnect()
      })
      graph.gains.forEach((gain) => gain?.disconnect())
      graph.master.disconnect()
      void graph.context.close().catch(() => undefined)
    }
  }, [applyEraMix])

  return (
    <button
      type="button"
      className={`scroll-audio${enabled ? ' is-on' : ''}`}
      aria-pressed={enabled}
      onClick={() => void onToggle()}
    >
      {enabled ? <Volume2 size={13} aria-hidden /> : <VolumeX size={13} aria-hidden />}
      Sound {enabled ? 'on' : 'off'}
    </button>
  )
}
