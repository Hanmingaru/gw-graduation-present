import { useEffect, useRef } from 'react'
import { CELL, LOOPS, STRIP_REPS } from './slotConfig'

// A single reel: a clipped window over a tall vertical strip of symbols that
// slides down and decelerates onto `target` whenever `spinId` changes.
function Reel({ symbols, target, duration, spinId, onStop }) {
  const stripRef = useRef(null)
  const restRef = useRef(0) // index (0..n-1) currently centered in the window

  useEffect(() => {
    if (spinId === 0) return // initial mount: sit on symbols[0]
    const strip = stripRef.current
    const n = symbols.length
    const prev = restRef.current

    // Jump (no transition) to the first-loop copy of the current symbol so the
    // strip has room to scroll downward without a visible flicker.
    strip.style.transition = 'none'
    strip.style.transform = `translateY(${-prev * CELL}px)`
    void strip.offsetHeight // force reflow so the jump applies before animating

    // Scroll down several full loops and land on `target`.
    const restIndex = target + n * LOOPS
    strip.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`
    strip.style.transform = `translateY(${-restIndex * CELL}px)`

    // When the slide ends, normalize back into the first loop on the same symbol.
    const onEnd = () => {
      strip.style.transition = 'none'
      strip.style.transform = `translateY(${-target * CELL}px)`
      restRef.current = target
      onStop?.()
    }
    strip.addEventListener('transitionend', onEnd, { once: true })
    return () => strip.removeEventListener('transitionend', onEnd)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinId])

  const cells = []
  for (let r = 0; r < STRIP_REPS; r++) {
    for (let i = 0; i < symbols.length; i++) cells.push(symbols[i])
  }

  return (
    <div className="reel-frame">
      <div className="reel">
        <div className="reel-strip" ref={stripRef}>
          {cells.map((s, idx) => (
            <div className="reel-cell" key={idx}>
              <span className="symbol">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Reel
