type Listener = () => void

let playingUntil = 0
const listeners = new Set<Listener>()

export function markTransition(durationMs: number) {
  playingUntil = performance.now() + durationMs
  setTimeout(() => listeners.forEach((l) => l()), durationMs)
}

export function transitionRemaining() {
  return Math.max(0, playingUntil - performance.now())
}

export function onTransitionEnd(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
