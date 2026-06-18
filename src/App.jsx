import './App.css'

// Iteration 1: purely visual. Three reels showing a placeholder symbol,
// inside a bounded cabinet, with a static pull-down lever on the right.
// No spin logic / animation yet — that comes with the wiring iteration.
const REELS = ['🍒', '🍒', '🍒']

function App() {
  return (
    <div className="stage">
      <div className="machine">
        <div className="cabinet">
          <div className="reels">
            {REELS.map((symbol, i) => (
              <div className="reel" key={i}>
                <span className="symbol">{symbol}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Static lever — bolted to the cabinet's right edge */}
        <div className="lever" aria-hidden="true">
          <div className="lever-mount" />
          <div className="lever-rod" />
          <div className="lever-knob" />
        </div>
      </div>
    </div>
  )
}

export default App
