// Slot machine configuration — tweak the feel of the machine here.

// Symbol set. Swap these for <img> sources later without touching the logic.
export const SYMBOLS = ['🍒', '🍍', '🍊']

export const CELL = 140 // px height of one reel cell — must match .reel-cell in CSS
export const LOOPS = 8 // how many full symbol cycles a spin scrolls through
export const STRIP_REPS = LOOPS + 2 // strip is a bit longer than the longest spin

// Staggered spin durations (ms), left to right.
export const DURATIONS = [1600, 2100, 2600]
