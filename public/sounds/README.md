# Sound effects

Two kinds of sounds:

## 1. Single sounds (this folder, `public/sounds/`)

Drop MP3 files here with these exact names. If a file is missing, playback fails
silently, so the machine still works.

| Filename        | When it plays                              |
| --------------- | ------------------------------------------ |
| `lever.mp3`     | Once, when CLICK ME! is pressed            |
| `spin-loop.mp3` | Loops while the reels are spinning          |
| `reel-stop.mp3` | Once per reel as each of the 3 reels lands |
| `drop-coin.mp3` | Once per coin as a win is dealt out one by one |
| `win.mp3`       | When the player reaches 100 coins (jackpot)|

## 2. Outcome sounds (random, in `src/sounds/<category>/`)

Each spin rolls a weighted outcome and plays a **random** clip from the matching
folder. Drop any number of `.mp3` files into these folders (auto-discovered at
build time; empty folder = silent):

| Folder                            | Outcome (chance)            |
| --------------------------------- | --------------------------- |
| `src/sounds/losing-sounds/`       | Losing spin (30%)           |
| `src/sounds/small-jackpot-sounds/`| Small — cherry 🍒 (40%, +5) |
| `src/sounds/medium-jackpot-sounds/`| Medium — orange 🍊 (20%, +15)|
| `src/sounds/large-jackpot-sounds/`| Large — pineapple 🍍 (10%, +40)|

## Where to download (free, no attribution required)

- https://pixabay.com/sound-effects/  (recommended)
- https://mixkit.co/free-sound-effects/game/
