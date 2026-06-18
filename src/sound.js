// All audio playback lives here. Sound files are in public/sounds/.
// BASE_URL keeps paths correct under the GitHub Pages subpath.
const SOUND_BASE = `${import.meta.env.BASE_URL}sounds/`

// Reuse one element per sound. iOS only lets an element play after it has been
// started inside a user gesture, so we create them up front and prime them.
const lever = new Audio(`${SOUND_BASE}lever.mp3`)
const reelStop = new Audio(`${SOUND_BASE}reel-stop.mp3`)
const spinLoop = new Audio(`${SOUND_BASE}spin-loop.mp3`)
spinLoop.loop = true

// Call once from inside a user gesture (e.g. the spin tap). "Primes" the sounds
// that play later on a timer (reel-stop) so iOS will allow them.
let primed = false
export function primeAudio() {
  if (primed) return
  primed = true
  reelStop
    .play()
    .then(() => {
      reelStop.pause()
      reelStop.currentTime = 0
    })
    .catch(() => {})
}

function restart(audio) {
  audio.currentTime = 0
  audio.play().catch(() => {})
}

export function playLeverSound() {
  restart(lever)
}

export function playReelStopSound() {
  restart(reelStop)
}

export function startSpinLoop() {
  restart(spinLoop)
}

export function stopSpinLoop() {
  spinLoop.pause()
}
