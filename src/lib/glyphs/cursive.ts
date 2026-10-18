// Cursive letterforms: the joined hand taught in American elementary schools
// through the second half of the 20th century, the Zaner-Bloser / Palmer
// alphabet on the strip above the blackboard.
//
// These are the owner's own handwriting. Each letter was written on a phone at
// /capture/, on the app's ruled lines with the Playwrite US Trad model letter
// behind it, and `scripts/capture_to_glyphs.mjs` turned the strokes into the
// paths in `cursive-strokes.ts`. Nothing here is drawn by hand: to change a
// letter, write it again and regenerate.
//
// Same rules as the manuscript set in `data.ts`: one SVG path per stroke, in the
// order and the direction it is written, on the same ruling. A cursive letter is
// mostly one stroke; lifts are for what comes after it, like the dots on i and j
// and the crosses on t and x.
//
// The first stroke of every lowercase letter runs on into the next letter, which
// is what lets `GlyphWord` join a word up. Capitals that join the letter after
// them say which of their strokes carries the exit in JOINS; the rest, like D,
// O, P and W, stand apart.

export { CURSIVE_LOWER, CURSIVE_UPPER, JOINS } from './cursive-strokes';

/**
 * The cursive letters are wider than the print box and their descenders go
 * deeper, so they are framed in a larger view. These are the tracing stage and
 * the grid tile, in glyph units.
 */
export const CURSIVE_VIEW = { stage: '-18 -4 136 176', tile: '-16 0 132 170' } as const;
