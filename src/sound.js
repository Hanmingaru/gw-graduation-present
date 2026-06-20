// All audio playback lives here.
// Single sounds live in public/sounds/ and are referenced by URL.
// Outcome sounds live in src/sounds/<category>/ — just drop .mp3 files in and
// they're auto-discovered at build time and chosen at random.
const SOUND_BASE = `${import.meta.env.BASE_URL}sounds/`

// Reuse one element per single sound. iOS only lets an element play after it has
// been started inside a user gesture, so we create them up front and prime them.
const lever = new Audio(`${SOUND_BASE}lever.mp3`)
const reelStop = new Audio(`${SOUND_BASE}reel-stop.mp3`)
const win = new Audio(`${SOUND_BASE}win.mp3`)
const jackpot = new Audio(`${SOUND_BASE}jackpot.mp3`)
const dropCoin = new Audio(`${SOUND_BASE}drop-coin.mp3`)
const spinLoop = new Audio(`${SOUND_BASE}spin-loop.mp3`)
spinLoop.loop = true

// Build an Audio element per file in a glob result.
function pool(globbed) {
  return Object.values(globbed).map((url) => new Audio(url))
}

// One pool per outcome bucket (keyed to OUTCOMES[].key in slotConfig).
const outcomePools = {
  losing: pool(
    import.meta.glob('./sounds/losing-sounds/*.mp3', {
      eager: true,
      query: '?url',
      import: 'default',
    })
  ),
  small: pool(
    import.meta.glob('./sounds/small-jackpot-sounds/*.mp3', {
      eager: true,
      query: '?url',
      import: 'default',
    })
  ),
  medium: pool(
    import.meta.glob('./sounds/medium-jackpot-sounds/*.mp3', {
      eager: true,
      query: '?url',
      import: 'default',
    })
  ),
  large: pool(
    import.meta.glob('./sounds/large-jackpot-sounds/*.mp3', {
      eager: true,
      query: '?url',
      import: 'default',
    })
  ),
}

// Call once from inside a user gesture (e.g. the spin tap). "Primes" every sound
// that plays later on a timer so iOS will allow them.
let primed = false
export function primeAudio() {
  if (primed) return
  primed = true
  const timerSounds = [
    reelStop,
    win,
    jackpot,
    dropCoin,
    ...Object.values(outcomePools).flat(),
  ]
  for (const audio of timerSounds) {
    audio
      .play()
      .then(() => {
        audio.pause()
        audio.currentTime = 0
      })
      .catch(() => {})
  }
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

export function playWinSound() {
  restart(win)
}

export function playJackpotSound() {
  restart(jackpot)
}

export function playDropCoinSound() {
  restart(dropCoin)
}

export function startSpinLoop() {
  restart(spinLoop)
}

export function stopSpinLoop() {
  spinLoop.pause()
}

// Play a random clip from the given outcome bucket's folder (no-op if empty).
export function playOutcomeSound(category) {
  const list = outcomePools[category]
  if (!list || list.length === 0) return
  restart(list[Math.floor(Math.random() * list.length)])
}
