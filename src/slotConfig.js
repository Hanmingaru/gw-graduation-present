// Slot machine configuration — tweak the feel of the machine here.

import rawCombos from './winningCombos.json'

// Expand the combo shorthand: a bare string means three-of-a-kind, so
// "couple1" is sugar for ["couple1", "couple1", "couple1"]. Arrays pass through.
function expandCombo(combo) {
  if (typeof combo === 'string') return [combo, combo, combo]
  return combo
}

// Normalize every bucket to full 3-symbol arrays so the rest of the file never
// has to think about the shorthand.
const winningCombos = Object.fromEntries(
  Object.entries(rawCombos).map(([bucket, combos]) => [
    bucket,
    combos.map(expandCombo),
  ])
)

// Placeholder renderers for each symbol name. These names are the source of
// truth (they come from winningCombos.json) and double as image asset keys:
// drop `src/symbols/<name>.png` in and it overrides the emoji below. Until then
// the emoji renders so the game keeps working.
export const SYMBOL_EMOJI = {
  cherry: '🍒',
  pineapple: '🍍',
  orange: '🍊',
  heart: '❤️',
}

// Auto-discover symbol art. Drop `src/symbols/<name>.png` in and it's picked up
// at build — no import to write (same pattern as the outcome sounds). Maps a
// symbol name to its hashed image URL.
const symbolImages = (() => {
  const globbed = import.meta.glob('./symbols/*.{png,PNG}', {
    eager: true,
    query: '?url',
    import: 'default',
  })
  const map = {}
  for (const [path, url] of Object.entries(globbed)) {
    const name = path.split('/').pop().replace(/\.png$/i, '')
    map[name] = url
  }
  return map
})()

// Symbol names, derived from the combos so the reel set can never drift from the
// data. Order is stable (first appearance across the buckets).
export const SYMBOLS = (() => {
  const seen = []
  for (const combos of Object.values(winningCombos)) {
    for (const combo of combos) {
      for (const name of combo) {
        if (!seen.includes(name)) seen.push(name)
      }
    }
  }
  return seen
})()

// What to render for a symbol name: its PNG if one exists, else the emoji.
export function symbolImage(name) {
  return symbolImages[name] ?? null
}
export function symbolEmoji(name) {
  return SYMBOL_EMOJI[name] ?? '❓'
}

export const CELL = 140 // px height of one reel cell — must match .reel-cell in CSS
export const LOOPS = 8 // how many full symbol cycles a spin scrolls through
export const STRIP_REPS = LOOPS + 2 // strip is a bit longer than the longest spin

// Staggered spin durations (ms), left to right.
export const DURATIONS = [1600, 2100, 2600]

// Delay (ms) between each coin when dealing out a win.
export const COIN_DEAL_INTERVAL = 70

// Coin economy
export const COLUMNS = 10 // coin columns in the bank
export const COINS_PER_COLUMN = 10 // coins per column (COLUMNS * this == jackpot)
export const STARTING_COINS = 15
export const SPIN_COST = 5
export const JACKPOT = COLUMNS * COINS_PER_COLUMN // 100

// Weighted spin outcomes. Each spin rolls one of these buckets. Winning buckets
// (`key` matches a key in winningCombos.json) show a random combo from their
// list; the losing bucket generates a non-winning, non-matching combo. `key`
// also selects the sound folder. Weights must sum to 1.
export const OUTCOMES = [
  { key: 'jackpot', reward: JACKPOT, weight: 0.01 }, // instant win — fills the bank
  { key: 'small', reward: 5, weight: 0.2 },
  { key: 'medium', reward: 10, weight: 0.60 },
  { key: 'large', reward: 50, weight: 0.09 },
  { key: 'losing', reward: 0, weight: 0.1 },
]

// Names of the winning buckets (everything in OUTCOMES that isn't the loss).
const WINNING_KEYS = OUTCOMES.filter((o) => o.reward > 0).map((o) => o.key)

// --- Validation (runs once at import) -------------------------------------
// Names + lengths are hard errors (dev-time typos); empty/duplicate are warnings.
;(function validateCombos() {
  const symbolSet = new Set([...SYMBOLS, ...Object.keys(SYMBOL_EMOJI)])
  const seenCombos = new Map() // combo key -> bucket it first appeared in

  for (const [bucket, combos] of Object.entries(winningCombos)) {
    for (const combo of combos) {
      if (!Array.isArray(combo) || combo.length !== 3) {
        throw new Error(
          `winningCombos: bucket "${bucket}" has a combo that isn't 3 symbols: ${JSON.stringify(combo)}`
        )
      }
      for (const name of combo) {
        if (!symbolSet.has(name)) {
          throw new Error(
            `winningCombos: unknown symbol "${name}" in bucket "${bucket}". Add it to SYMBOL_EMOJI (and optionally src/symbols/${name}.png).`
          )
        }
      }
      const ck = combo.join(',')
      if (seenCombos.has(ck) && seenCombos.get(ck) !== bucket) {
        console.warn(
          `winningCombos: combo [${ck}] appears in both "${seenCombos.get(ck)}" and "${bucket}" — it will pay different amounts on different spins.`
        )
      } else {
        seenCombos.set(ck, bucket)
      }
    }
  }

  for (const key of WINNING_KEYS) {
    const combos = winningCombos[key]
    if (!combos || combos.length === 0) {
      console.warn(
        `winningCombos: winning bucket "${key}" has no combos — spins that roll it will fall back to a loss.`
      )
    }
  }
})()

// Set of every winning combo (as "a,b,c") for fast loss-generation exclusion.
const WINNING_SET = new Set(
  Object.values(winningCombos).flatMap((combos) =>
    combos.map((combo) => combo.join(','))
  )
)

// Roll a single outcome bucket according to the weights above.
export function rollOutcome() {
  const r = Math.random()
  let acc = 0
  for (const outcome of OUTCOMES) {
    acc += outcome.weight
    if (r < acc) return outcome
  }
  return OUTCOMES[OUTCOMES.length - 1] // float-rounding fallback
}

// Translate a combo of symbol names into reel indices into SYMBOLS.
function toTargets(combo) {
  return combo.map((name) => SYMBOLS.indexOf(name))
}

const MAX_GENERATION_TRIES = 100

// Generate a losing combo: random symbols, re-rolled while it's a winning combo
// or a three-of-a-kind (which would look like a jackpot). Capped so it can never
// hang if winners + matches happen to cover every possibility.
function generateLoss() {
  let combo
  for (let tries = 0; tries < MAX_GENERATION_TRIES; tries++) {
    combo = [0, 1, 2].map(() => Math.floor(Math.random() * SYMBOLS.length))
    const allMatch = combo[0] === combo[1] && combo[1] === combo[2]
    const isWinner = WINNING_SET.has(combo.map((i) => SYMBOLS[i]).join(','))
    if (!allMatch && !isWinner) return combo
  }
  return combo // safety fallback after the cap
}

// Pick the three reel targets for a rolled outcome. A winning bucket shows a
// random combo from its list; a loss (or an empty winning bucket) is generated.
export function targetsFor(outcome) {
  if (outcome.reward > 0) {
    const combos = winningCombos[outcome.key]
    if (combos && combos.length > 0) {
      const combo = combos[Math.floor(Math.random() * combos.length)]
      return toTargets(combo)
    }
    // Empty winning bucket: already warned at load — fall through to a loss.
  }
  return generateLoss()
}
