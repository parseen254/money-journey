import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenisInstance: Lenis | null = null

/**
 * Minimal imperative scrolling API for Auto Tour and anchor jumps.
 * Falls back to native scrolling when Lenis is not mounted
 * (e.g. reduced motion).
 */
export function scrollApi() {
  return {
    scrollTo(target: number, immediate = false) {
      if (lenisInstance) {
        lenisInstance.scrollTo(target, { immediate })
      } else {
        window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' })
      }
    },
    stop() {
      lenisInstance?.stop()
    },
    start() {
      lenisInstance?.start()
    },
  }
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  useEffect(() => {
    // The film owns the scroll position; browser scroll restoration would
    // drop returning visitors mid-journey with a stale playhead.
    window.history.scrollRestoration = 'manual'
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      // Native scrolling only; ScrollTrigger listens to window directly.
      return
    }

    const lenis = new Lenis({
      duration: 1.1,
      // Keyboard scrolling, anchors and assistive tech act on the native
      // scroll position; Lenis observes rather than blocks them.
      smoothWheel: true,
      syncTouch: false,
    })
    lenisInstance = lenis

    lenis.on('scroll', ScrollTrigger.update)

    // Single RAF authority: Lenis is driven by GSAP's ticker so every
    // ScrollTrigger and tween shares one frame callback.
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisInstance = null
    }
  }, [])

  useEffect(() => {
    // Clean scroll reset on route change, then re-measure triggers.
    if (lenisInstance) {
      lenisInstance.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(raf)
  }, [pathname])

  return <>{children}</>
}
