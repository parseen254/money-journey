# money-journey

MKOBA: Money Has Always Moved. A scroll-scrubbed film that runs through 240 years of East African money, from cowrie shells to the open ledger. As you scroll, the story scrubs frame by frame across six chapters.

Live: https://mkoba.vercel.app

## Chapters

Barter, Coin, Paper, Plastic, Mobile, Crypto. Each is its own scene with scroll-linked motion, video, and audio that track the scroll position rather than playing on a fixed timeline.

## How it works

Scroll drives everything. A smooth-scroll layer feeds a normalized scroll value into GSAP timelines, and the video and audio components seek to the matching point instead of autoplaying. The result reads like a film you scrub with the scrollbar, on desktop and mobile.

## Stack

- React 19 and TypeScript
- Vite 8 for build and dev
- GSAP for the scroll-linked timelines
- Lenis for smooth scroll
- Tailwind CSS 4
- Deployed on Vercel

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

The film clips and intermediate build artifacts are generated locally and kept out of git. Clone, install, and run to see the full experience.
