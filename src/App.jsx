import { useRef, useState } from 'react'
import './App.css'
import {
  SYMBOLS,
  DURATIONS,
  STARTING_COINS,
  SPIN_COST,
  JACKPOT,
  COIN_DEAL_INTERVAL,
  rollOutcome,
  targetsFor,
} from './slotConfig'
import Reel from './Reel'
import CoinBank from './CoinBank'
import winMessage from './winMessage.txt?raw'
import { fireJackpot, clearCelebration } from './celebration'
import {
  primeAudio,
  playLeverSound,
  playReelStopSound,
  playOutcomeSound,
  playWinSound,
  playDropCoinSound,
  startSpinLoop,
  stopSpinLoop,
} from './sound'

function App() {
  const [spinId, setSpinId] = useState(0)
  const [targets, setTargets] = useState([0, 0, 0])
  const [spinning, setSpinning] = useState(false)
  const [dealing, setDealing] = useState(false)
  const [coins, setCoins] = useState(STARTING_COINS)
  const [won, setWon] = useState(false)
  const dealRef = useRef(null)

  const outOfCoins = coins < SPIN_COST

  // Add `amount` coins one at a time, playing a drop sound for each, then run
  // onComplete. The bank animates each new coin in as state updates.
  const dealCoins = (amount, onComplete) => {
    if (amount <= 0) {
      onComplete?.()
      return
    }
    setDealing(true)
    let dealt = 0
    dealRef.current = setInterval(() => {
      dealt++
      setCoins((c) => c + 1)
      playDropCoinSound()
      if (dealt >= amount) {
        clearInterval(dealRef.current)
        dealRef.current = null
        setDealing(false)
        onComplete?.()
      }
    }, COIN_DEAL_INTERVAL)
  }

  const spin = () => {
    if (spinning || dealing || won || outOfCoins) return

    const outcome = rollOutcome()
    const newTargets = targetsFor(outcome)
    const balanceAfterCost = coins - SPIN_COST

    setCoins(balanceAfterCost) // pay up front
    setTargets(newTargets)
    setSpinId((id) => id + 1)
    setSpinning(true)

    primeAudio() // unlock timer-fired sounds on iOS (runs once)
    playLeverSound()
    startSpinLoop()

    const maxDuration = Math.max(...DURATIONS)
    setTimeout(() => {
      setSpinning(false)
      stopSpinLoop()
      playOutcomeSound(outcome.key) // random clip from the bucket's folder

      if (outcome.reward > 0) {
        const total = Math.min(JACKPOT, balanceAfterCost + outcome.reward)
        dealCoins(total - balanceAfterCost, () => {
          if (total >= JACKPOT) {
            setWon(true)
            fireJackpot()
            playWinSound()
          }
        })
      }
    }, maxDuration + 150)
  }

  const restart = () => {
    if (dealRef.current) {
      clearInterval(dealRef.current)
      dealRef.current = null
    }
    clearCelebration()
    setWon(false)
    setSpinning(false)
    setDealing(false)
    setCoins(STARTING_COINS)
  }

  return (
    <div className="stage">
      <div className="machine">
        <div className="cabinet">
          <div className="reels">
            {targets.map((t, i) => (
              <Reel
                key={i}
                symbols={SYMBOLS}
                target={t}
                duration={DURATIONS[i]}
                spinId={spinId}
                onStop={playReelStopSound}
              />
            ))}
          </div>
        </div>

        <button
          className="spin-button"
          onClick={spin}
          disabled={spinning || dealing || won || outOfCoins}
        >
          <span className="spin-cost">{SPIN_COST}</span>
          <span className="spin-coin">🪙</span>
        </button>

        <div className="coin-count">
          {coins} / {JACKPOT} 🪙
        </div>

        <CoinBank total={coins} />
      </div>

      {won && (
        <div className="jackpot-overlay">
          <div className="jackpot-card">
            <h1>🎉 JACKPOT! 🎉</h1>
            <p style={{ whiteSpace: 'pre-line' }}>{winMessage.trim()}</p>
            <button className="restart-button" onClick={restart}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {outOfCoins && !won && !spinning && !dealing && (
        <div className="jackpot-overlay">
          <div className="jackpot-card">
            <h1>Out of coins!</h1>
            <p>You ran out of coins. Want to try again?</p>
            <button className="restart-button" onClick={restart}>
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
