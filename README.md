# Comfy Cloud — Onboarding Prototype

A **front-end-only, clickable prototype** exploring new-user onboarding & activation for
**Comfy Cloud** (the hosted ComfyUI). It backs a PM presentation — generation is **faked** (no real
inference): runs animate, then show pre-baked output.

**Live demo:** https://wealthwiselabs.github.io/comfy-cloud-onboarding-prototype/

## The three connected bets

1. **Guided, skill-adaptive onboarding** — sign-in → a 3-step intake wizard (role → goal → skill) →
   a branched editor (simple form / guided fields + graph / full node graph by skill) → a faked run →
   result → the node graph that made it.
2. **Build with AI** — start from a proven template/community workflow and edit it with a scripted
   agent that highlights which node to change, suggests swaps, and teaches concepts (learn-and-earn).
3. **Showroom + remix loop** — your profile, an Explore feed, an expanded card view (output,
   comments, workflow-graph preview), and remix lineage that feeds back into the editor.

## Stack

React 19 · TypeScript · Vite · Tailwind · Zustand · React Router · @xyflow/react (React Flow).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```
