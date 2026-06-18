import confetti from 'canvas-confetti'

// Full-screen jackpot celebration: confetti cannons from both sides plus a
// steady rain of coins from the top. Runs for a few seconds.
export function fireJackpot() {
  const duration = 4500
  const end = Date.now() + duration
  const coin = confetti.shapeFromText({ text: '🪙', scalar: 2 })

  const frame = () => {
    // side cannons firing inward from the left and right edges
    confetti({
      particleCount: 7,
      angle: 60,
      spread: 60,
      startVelocity: 55,
      origin: { x: 0, y: 0.7 },
    })
    confetti({
      particleCount: 7,
      angle: 120,
      spread: 60,
      startVelocity: 55,
      origin: { x: 1, y: 0.7 },
    })

    // coin rain falling from above
    confetti({
      particleCount: 3,
      startVelocity: 0,
      gravity: 0.6,
      ticks: 300,
      spread: 360,
      scalar: 2,
      shapes: [coin],
      origin: { x: Math.random(), y: -0.1 },
    })

    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

// Stop and clear any in-flight celebration (used on restart).
export function clearCelebration() {
  confetti.reset()
}
