# Credits

## Sounds

`static/sounds/sad-trombone.mp3` is
["Sad Trombone"](https://commons.wikimedia.org/wiki/File:Sad_Trombone-Joe_Lamb-665429450.ogg)
by **Joe Lamb** on Wikimedia Commons, under
[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). That licence requires
attribution, so this credit has to stay while the file does. It was trimmed,
loudness-normalised and re-encoded to mono MP3 for size.

`static/sounds/yay.mp3` is supplied by the project owner and needs no credit.

## Spoken prompts

`scripts/generate_tts.py` records the letter and word prompts in a child's
voice, and it is a build-time tool only -- the app never calls a service. It
drives Microsoft Edge's Read Aloud endpoint through `edge-tts`, which is a
community wrapper around an endpoint Microsoft does not document as a public
API. Microsoft publishes no grant of redistribution rights for that output, and
the endpoint is nominally there to serve Edge's own reader.

So the generated clips are **not committed**: `static/sounds/voice/` is
gitignored, and anyone who wants the prompts runs the script themselves. If the
prompts are ever to ship in this repository, either settle the licensing with
Microsoft in writing, move to a service whose terms allow redistribution
(Azure Speech under a paid subscription does), or record a real child.

## Artwork

All illustrations and letterforms are hand-authored SVG, original to this
project. See `src/lib/art/` and `src/lib/glyphs/`.

`blaze` is a generic monster truck, not a likeness of any particular television
character.
