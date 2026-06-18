import { useState } from 'react'
import './App.css'
import { SYMBOLS, DURATIONS } from './slotConfig'
import Reel from './Reel'
import {
  primeAudio,
  playLeverSound,
  playReelStopSound,
  startSpinLoop,
  stopSpinLoop,
} from './sound'

function App() {
  const [spinId, setSpinId] = useState(0)
  const [targets, setTargets] = useState([0, 0, 0])
  const [spinning, setSpinning] = useState(false)

  const spin = () => {
    if (spinning) return
    setTargets([0, 1, 2].map(() => Math.floor(Math.random() * SYMBOLS.length)))
    setSpinId((id) => id + 1)
    setSpinning(true)

    primeAudio() // unlock timer-fired sounds on iOS (runs once)
    playLeverSound()
    startSpinLoop()

    const maxDuration = Math.max(...DURATIONS)
    setTimeout(() => {
      setSpinning(false)
      stopSpinLoop()
    }, maxDuration + 150)
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

        <button className="spin-button" onClick={spin} disabled={spinning}>
          CLICK ME!
        </button>
      </div>
    </div>
  )
}

export default App
