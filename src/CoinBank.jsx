import { COLUMNS, COINS_PER_COLUMN } from './slotConfig'

const COIN_SPACING = 7 // px between stacked coins (less than coin height = overlap)

// Deterministic pseudo-random in [0,1) from two ints, so a coin's jitter stays
// stable across re-renders (coins don't dance around as the balance changes).
function rand(a, b) {
  const seed = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453
  return seed - Math.floor(seed)
}

// How many coins sit in column `col` for a given total balance (sequential
// left-to-right fill: column 0 holds coins 1-10, column 1 holds 11-20, ...).
function coinsInColumn(total, col) {
  return Math.max(0, Math.min(COINS_PER_COLUMN, total - col * COINS_PER_COLUMN))
}

function CoinBank({ total }) {
  return (
    <div className="coin-bank">
      {Array.from({ length: COLUMNS }, (_, col) => {
        const count = coinsInColumn(total, col)
        // stable per-column vertical offset for an irregular skyline
        const baseOffset = (rand(col, 99) - 0.5) * 8
        return (
          <div
            className="coin-column"
            key={col}
            style={{ transform: `translateY(${baseOffset}px)` }}
          >
            {Array.from({ length: count }, (_, row) => {
              const dx = (rand(col, row) - 0.5) * 4 // ±2px horizontal jitter
              const rot = (rand(row, col) - 0.5) * 4 // ±2deg tilt
              return (
                <div
                  className="coin"
                  key={row}
                  style={{
                    bottom: `${row * COIN_SPACING}px`,
                    transform: `translateX(${dx}px) rotate(${rot}deg)`,
                  }}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default CoinBank
