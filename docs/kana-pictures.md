# Kana pictures still to draw

Every hiragana and katakana word has its picture: 32 reused from the Latin
word sets, and 82 drawn for the kana in `src/lib/art/kana/`, one file per
themed batch.

A new kana word whose picture is not drawn yet goes in the table below, under
the name `src/lib/kana-words.json` asks for, until it is drawn in
`src/lib/art/`. `src/lib/kana.test.ts` fails if a picture the kana need is
missing from this list, or if one that has been drawn is still on it.
`node scripts/art_sheet.mjs out.png <names...>` renders pictures to a contact
sheet for review.

| Picture | Word |
| ------- | ---- |
