# Credits

## Sounds

| File                             | Source                                                                                                                             | Licence                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `static/sounds/cheer.mp3`        | ["yay.mp3"](https://freesound.org/people/Disarmenemyships/sounds/563845/) by **Disarmenemyships** on Freesound                     | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) (public domain)    |
| `static/sounds/sad-trombone.mp3` | ["Sad Trombone"](https://commons.wikimedia.org/wiki/File:Sad_Trombone-Joe_Lamb-665429450.ogg) by **Joe Lamb** on Wikimedia Commons | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) — attribution required |

Both were trimmed, loudness-normalised and re-encoded to mono MP3 for size.

A note on picking the cheer, because the first attempt was wrong. It used a
sound-library recording and took the one isolated full-scale burst in it — which
turned out to be the engineer announcing the slate, not the cheer. Library
recordings begin that way, and a loudness envelope cannot tell a shouted word
from a shouted crowd. The rule that avoids it: prefer a source whose _entire_
file is the sound wanted, so there is nothing else it could be. `yay.mp3` is
2.3 s long and all of it is the cheer.

## Artwork

All illustrations and letterforms are hand-authored SVG, original to this
project. See `src/lib/art/` and `src/lib/glyphs/`.

`blaze` is a generic monster truck, not a likeness of any particular television
character.
