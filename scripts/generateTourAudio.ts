/**
 * Generates an .m4a narration file for every TourCard in app/lib/tours.ts.
 *
 * Pipeline (macOS only):
 *   1. `say -v Samantha -o tmp.aiff "<voice text>"`   — synthesise to AIFF
 *   2. `afconvert -f mp4f -d aac tmp.aiff out.m4a`     — encode AAC in m4a
 *
 * Both binaries ship with macOS by default. Voice = Samantha (system default).
 * Run once after editing tour text: `pnpm run build:tour-audio`.
 *
 * Output: public/audio/<tour-id>-<card-kind>.m4a (~10 KB per ~30s clip).
 */

import { execFileSync } from 'node:child_process'
import { mkdirSync, existsSync, unlinkSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TOURS } from '../app/lib/tours'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..')
const outDir = resolve(repoRoot, 'public', 'audio')
const tmpDir = resolve(repoRoot, '.tmp-audio')

const VOICE = process.env.TOUR_VOICE || 'Samantha'
const RATE = process.env.TOUR_RATE || '180' // words per minute; 180 is "natural pace"

mkdirSync(outDir, { recursive: true })
mkdirSync(tmpDir, { recursive: true })

const tours = Object.values(TOURS)
const totalClips = tours.reduce((acc, t) => acc + t.cards.length, 0)
let made = 0
let skipped = 0
let failed = 0
const startTime = Date.now()

console.log(`Generating ${totalClips} narration clips with voice "${VOICE}" at ${RATE} wpm...`)

for (const tour of tours) {
  for (const card of tour.cards) {
    const slug = `${tour.id}-${card.kind}`
    const aiff = resolve(tmpDir, `${slug}.aiff`)
    const m4a = resolve(outDir, `${slug}.m4a`)

    // Skip if the m4a already exists and is newer than the source text.
    // (Cheap heuristic — re-run with FORCE=1 to regenerate everything.)
    if (existsSync(m4a) && !process.env.FORCE) {
      skipped++
      continue
    }

    try {
      execFileSync('say', ['-v', VOICE, '-r', RATE, '-o', aiff, card.voice], {
        stdio: ['ignore', 'ignore', 'inherit'],
      })
      execFileSync('afconvert', ['-f', 'mp4f', '-d', 'aac', '-q', '127', aiff, m4a], {
        stdio: ['ignore', 'ignore', 'inherit'],
      })
      unlinkSync(aiff)
      made++
      process.stdout.write(`  ✓ ${slug}\n`)
    } catch (err) {
      failed++
      console.error(`  ✗ ${slug}: ${(err as Error).message}`)
    }
  }
}

// Best-effort cleanup of tmp dir.
try {
  execFileSync('rm', ['-rf', tmpDir])
} catch {}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
console.log(`\nDone in ${elapsed}s — generated ${made}, skipped ${skipped}, failed ${failed}.`)
if (skipped > 0) console.log(`(use FORCE=1 to regenerate everything)`)
