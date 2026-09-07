#!/usr/bin/env python3
"""Record spoken prompts in a child's voice for Letter Tracer.

This is a BUILD-TIME tool. It calls Microsoft Edge's online read-aloud service,
writes MP3s into ``static/sounds/voice/``, and those files are committed. The app
itself never calls anything: the service worker precaches ``static/`` and the
whole thing keeps working on a plane.

    # one phrase, named from its own words
    scripts/generate_tts.py "Good job"            ->  voice/good-job.mp3

    # one phrase under a name of your choosing
    scripts/generate_tts.py "Try that again" --name retry

    # "A is for apple" for three letters, or leave the letters off for all 26
    scripts/generate_tts.py --phrases a b c       ->  voice/phrase/a.mp3
    scripts/generate_tts.py --phrases

    # every letter, word and number spoken on its own (62 clips)
    scripts/generate_tts.py --all                 ->  voice/name/a.mp3

    # see what a run would record, without calling out
    scripts/generate_tts.py --phrases --dry-run

The two sets are kept apart because they collide: the phrase for A and the name
of the letter A would both want to be a.mp3. Recording phrases also rewrites
src/lib/voice-clips.ts, which is how the app knows which letters can speak.

Existing files are left alone unless ``--force`` is passed, so adding one word
later costs one request rather than sixty-two.

Setup:

    python3 -m venv .venv && .venv/bin/pip install edge-tts
    .venv/bin/python scripts/generate_tts.py --all

ffmpeg is optional but recommended: with it, every clip is trimmed of leading
and trailing silence, downmixed to mono and loudness-normalised, so the voice
sits at the same level as the cheer. Without it the raw service output is kept
and a warning is printed.

Before committing clips from this tool to a public repository, check Microsoft's
current terms of use for Edge read-aloud output, and record what you find in
CREDITS.md the way the CC BY trombone is recorded.
"""

from __future__ import annotations

import argparse
import asyncio
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WORDS_TS = ROOT / "src" / "lib" / "words.ts"
VOICE_DIR = ROOT / "static" / "sounds" / "voice"
PHRASE_DIR = VOICE_DIR / "phrase"
NAME_DIR = VOICE_DIR / "name"
MANIFEST = ROOT / "src" / "lib" / "voice-clips.ts"

# The child voice in the Edge catalogue -- it reads at about three years old.
# That catalogue does get renamed; check with `edge-tts --list-voices` if this
# stops resolving.
VOICE = "en-US-AnaNeural"
# Slow enough for a toddler to follow.
RATE = "-10%"

# What to say for each letter. An isolated capital is normally read as the
# letter's name, which is what we want -- but it is a guess about a speech
# engine, not a fact, so every letter is listed here and any that comes out
# wrong can be respelled ("aitch", "double-you") without touching the code.
# Listen to the 26 before trusting them.
LETTER_TEXT: dict[str, str] = {c: c.upper() for c in "abcdefghijklmnopqrstuvwxyz"}

# Loudness target, matching how sad-trombone.mp3 was normalised.
LOUDNORM = "loudnorm=I=-16:TP=-1.5:LRA=11"
# Anything under this counts as silence at the head and tail of a clip.
TRIM = "silenceremove=start_periods=1:start_silence=0.06:start_threshold=-45dB"


def shown(path: Path) -> str:
    """Repo-relative when it is in the repo, absolute when --out points elsewhere."""
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def slug(text: str) -> str:
    """A filename from a phrase: 'Good job!' -> 'good-job'."""
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or "clip"


def load_words() -> tuple[dict[str, str], list[str]]:
    """Read WORDS and NUMBER_WORDS out of the app's own source.

    Parsed rather than copied so the recorded lines cannot drift away from what
    the app actually shows.
    """
    src = WORDS_TS.read_text()

    body = re.search(r"WORDS: Record<string, string> = \{(.*?)\}", src, re.S)
    numbers = re.search(r"NUMBER_WORDS = \[(.*?)\]", src, re.S)
    if not body or not numbers:
        sys.exit(f"could not find WORDS / NUMBER_WORDS in {WORDS_TS}; has its shape changed?")

    words = dict(re.findall(r"(\w+):\s*'([^']+)'", body.group(1)))
    number_words = re.findall(r"'([^']+)'", numbers.group(1))
    if len(words) != 26 or len(number_words) != 10:
        sys.exit(f"expected 26 words and 10 number words, got {len(words)} and {len(number_words)}")
    return words, number_words


def phrase_line_list(letters: list[str] | None) -> list[tuple[str, str]]:
    """"A is for apple" for each letter, as (letter, text) pairs.

    Case does not change how it is spoken, so A and a share one clip.
    """
    words, _ = load_words()
    chosen = [c.lower() for c in (letters or sorted(words))]
    for c in chosen:
        if c not in words:
            sys.exit(f"{c!r} is not a letter with a word: pick from {''.join(sorted(words))}")
    return [(c, f"{c.upper()} is for {words[c]}") for c in chosen]


def write_manifest(phrase_dir: Path) -> None:
    """Tell the app which letters can speak, from what is actually on disk.

    A generated module rather than a manifest the app fetches: it is build-time
    knowledge, so it can be type-checked and costs nothing at runtime.
    """
    have = sorted(p.stem for p in phrase_dir.glob("*.mp3"))
    MANIFEST.write_text(
        "// Generated by scripts/generate_tts.py -- do not edit by hand.\n"
        "//\n"
        "// The letters that have a spoken \"A is for apple\" clip in\n"
        "// static/sounds/voice/phrase/. A letter not listed here simply stays\n"
        "// quiet, so the set can be filled in a few at a time.\n"
        "export const PHRASES: readonly string[] = "
        + ("[" + ", ".join(f"'{c}'" for c in have) + "]")
        + ";\n"
    )
    print(f"{shown(MANIFEST)}: {len(have)} letter(s) can speak")


def full_line_list() -> list[tuple[str, str]]:
    """Every clip the app needs, as (name, text) pairs.

    Case does not change how a letter is spoken, so A and a share one file; and
    a digit is spoken as its number word, so 3 and 'three' do too.
    """
    words, number_words = load_words()
    lines = [(letter, LETTER_TEXT[letter]) for letter in sorted(words)]
    lines += [(word, word) for word in sorted(set(words.values()))]
    lines += [(word, word) for word in number_words]
    # Same word under two letters would otherwise be recorded twice.
    seen: dict[str, str] = {}
    for name, text in lines:
        seen.setdefault(name, text)
    return sorted(seen.items())


async def speak(text: str, dest: Path, voice: str, rate: str) -> None:
    import edge_tts

    await edge_tts.Communicate(text, voice, rate=rate).save(str(dest))


def polish(raw: Path, dest: Path) -> bool:
    """Trim the silence, downmix to mono, normalise. False if ffmpeg is absent."""
    if not shutil.which("ffmpeg"):
        shutil.move(str(raw), str(dest))
        return False
    trim_both = f"{TRIM},areverse,{TRIM},areverse"
    subprocess.run(
        # fmt: off
        [
            "ffmpeg", "-y", "-loglevel", "error", "-i", str(raw),
            "-af", f"{trim_both},{LOUDNORM}",
            "-ac", "1", "-ar", "24000", "-b:a", "48k", str(dest),
        ],
        # fmt: on
        check=True,
    )
    raw.unlink(missing_ok=True)
    return True


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Record spoken prompts in a child's voice.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='examples:\n  %(prog)s "Good job"\n  %(prog)s "Try again" --name retry\n  %(prog)s --all',
    )
    ap.add_argument("phrase", nargs="*", help="phrase(s) to record")
    ap.add_argument(
        "--phrases",
        nargs="*",
        metavar="LETTER",
        help='record "A is for apple" for these letters, or for all 26 if none are given',
    )
    ap.add_argument("--all", action="store_true", help="record every letter, word and number")
    ap.add_argument("--name", help="filename stem for a single phrase (default: a slug of it)")
    ap.add_argument("--voice", default=VOICE, help=f"Edge voice (default: {VOICE})")
    ap.add_argument("--rate", default=RATE, help=f"speaking rate (default: {RATE})")
    ap.add_argument("--out", type=Path, help="output directory (default: depends on the mode)")
    ap.add_argument("--force", action="store_true", help="re-record clips that already exist")
    ap.add_argument("--dry-run", action="store_true", help="list what would be recorded")
    ap.add_argument("--raw", action="store_true", help="skip the ffmpeg trim and normalise")
    args = ap.parse_args()

    if args.name and len(args.phrase) != 1:
        ap.error("--name takes exactly one phrase")
    if args.all and args.phrases is not None:
        ap.error("--all and --phrases write to different places; run them separately")
    if not args.all and args.phrases is None and not args.phrase:
        ap.error("give a phrase to record, or --phrases, or --all")
    if args.phrases is not None and args.phrase:
        ap.error("--phrases records its own lines; do not also pass a phrase")

    lines: list[tuple[str, str]] = []
    if args.all:
        lines += full_line_list()
    if args.phrases is not None:
        lines += phrase_line_list(args.phrases or None)
    for phrase in args.phrase:
        lines.append((args.name or slug(phrase), phrase))

    if args.out is None:
        args.out = NAME_DIR if args.all else PHRASE_DIR if args.phrases is not None else VOICE_DIR
    args.out.mkdir(parents=True, exist_ok=True)
    todo = [(n, t) for n, t in lines if args.force or not (args.out / f"{n}.mp3").exists()]
    skipped = len(lines) - len(todo)

    if args.dry_run:
        for name, text in todo:
            print(f"{name}.mp3  <-  {text!r}")
        print(f"\n{len(todo)} to record, {skipped} already there ({args.voice}, rate {args.rate})")
        return

    if not todo:
        print(f"nothing to do: all {skipped} clips already exist (--force to re-record)")
        if args.phrases is not None:
            write_manifest(args.out)
        return

    try:
        import edge_tts  # noqa: F401
    except ImportError:
        sys.exit("edge-tts is not installed.\n  python3 -m venv .venv && .venv/bin/pip install edge-tts")

    warned = False
    with tempfile.TemporaryDirectory() as tmp:
        for i, (name, text) in enumerate(todo, 1):
            dest = args.out / f"{name}.mp3"
            raw = Path(tmp) / f"{name}.raw.mp3"
            try:
                asyncio.run(speak(text, raw, args.voice, args.rate))
            except Exception as e:  # the service, the network, a renamed voice
                sys.exit(f"\n{name}: {type(e).__name__}: {e}")
            if args.raw:
                shutil.move(str(raw), str(dest))
            elif not polish(raw, dest) and not warned:
                print("ffmpeg not found: keeping raw output, un-trimmed and un-normalised")
                warned = True
            print(f"[{i}/{len(todo)}] {shown(dest)}  {text!r}  {dest.stat().st_size:,}B")

    print(f"\n{len(todo)} recorded, {skipped} skipped -> {shown(args.out)}")
    if args.phrases is not None:
        write_manifest(args.out)


if __name__ == "__main__":
    main()
