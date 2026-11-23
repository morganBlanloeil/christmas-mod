import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Position of the sleigh in the band, null between two passes.
const step = atom({ plugin: 'christmas', key: 'step' } as const, null)
// Whether snow falls in the band above the prompt.
const isSnowing = atom({ plugin: 'christmas', key: 'isSnowing' } as const, true)

const FRAME_MS = 90
const FIRST_PASS_MS = 20_000
const MIN_GAP_MS = 6 * 60_000
const MAX_GAP_MS = 15 * 60_000

// Glyphs and their terminal width, left to right: the trail, Santa, the reindeer leading.
const SLEIGH: Array<[string, number]> = [
  ['·', 1], [' ', 1], ['*', 1], [' ', 1], ['✨', 2], [' ', 1],
  ['🎅', 2], ['🛷', 2], ['~', 1], ['~', 1], ['🦌', 2], [' ', 1], ['🦌', 2], [' ', 1], ['🦌', 2],
]
const SLEIGH_WIDTH = SLEIGH.reduce((sum, [, w]) => sum + w, 0)
const HO = '  Ho ho ho!'

const SNOW_ROWS = 3
const SNOW_MS = 150
const DEFAULT_COLOR = 0x01000000
// Near flakes are bright and big, far ones dim and small.
const FLAKE_LOOKS: Array<[number, number]> = [
  [0x2a, 0xffffff], [0x2022, 0xeaf2ff], [0xb7, 0xc9d8ee], [0x2e, 0x9fb3cf],
]

const { theme } = makeColors({
  label: 'Christmas',
  roles: { accent: '#c8a24a', danger: '#c0392b', success: '#2e8b57', warning: '#d98c1a', pro: '#7a4fa0' },
  light: { gray: { anchors: { 'surface-0': '#e8edf2', 'surface-1': '#f0f3f7', 'surface-2': '#f8fafc', 'text-primary': '#1b2433', 'text-secondary': '#3d4a5e', 'text-muted': '#56627a' } } },
  dark: { gray: { anchors: { 'surface-0': '#0e1726', 'surface-1': '#132036', 'surface-2': '#182843', 'surface-3': '#1c2d4a', 'text-primary': '#eef2f8', 'text-secondary': '#c5cfdd', 'text-muted': '#9aa8bd' } } },
})

const LOOK: ThemeSetArgs = { colors: theme, backdrop: { scene: 'night-sleigh' } }

const SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
<style>
.sky{fill:#dfe8f1}.star{fill:#9fb1c8}.moon{fill:#f4f1e4}.flake{fill:#ffffff;opacity:.85}.shape{fill:#33415a}.santa{fill:#c0392b}.trail{fill:#c8a24a}
@media (prefers-color-scheme: dark){.sky{fill:#0b1322}.star{fill:#e8eefc}.shape{fill:#c9d3e3}.flake{opacity:.6}}
.sleigh{animation:ride 90s linear infinite}
@keyframes ride{0%{transform:translate(-500px,0)}22%{transform:translate(1900px,-60px)}100%{transform:translate(1900px,-60px)}}
.snow{animation:fall 24s linear infinite}
.snow2{animation:fall 36s linear infinite}
@keyframes fall{from{transform:translate(0,-900px)}to{transform:translate(40px,0)}}
.star{animation:twinkle 6s ease-in-out infinite alternate}
@keyframes twinkle{from{opacity:.4}to{opacity:1}}
</style>
<rect class="sky" width="1600" height="900"/>
<circle class="moon" cx="1420" cy="120" r="46"/>
<circle class="star" cx="120" cy="80" r="2"/><circle class="star" cx="340" cy="150" r="1.5"/><circle class="star" cx="610" cy="60" r="2"/>
<circle class="star" cx="880" cy="130" r="1.5"/><circle class="star" cx="1100" cy="50" r="2"/><circle class="star" cx="1260" cy="210" r="1.5"/>
<circle class="star" cx="200" cy="260" r="1.5"/><circle class="star" cx="1500" cy="300" r="2"/>
<g class="snow">
<circle class="flake" cx="80" cy="200" r="3"/><circle class="flake" cx="300" cy="600" r="2"/><circle class="flake" cx="520" cy="350" r="3"/>
<circle class="flake" cx="760" cy="800" r="2"/><circle class="flake" cx="990" cy="250" r="3"/><circle class="flake" cx="1230" cy="700" r="2"/>
<circle class="flake" cx="1450" cy="450" r="3"/><circle class="flake" cx="80" cy="1100" r="3"/><circle class="flake" cx="520" cy="1250" r="3"/>
<circle class="flake" cx="990" cy="1150" r="3"/><circle class="flake" cx="1450" cy="1350" r="3"/>
</g>
<g class="snow2">
<circle class="flake" cx="180" cy="420" r="1.5"/><circle class="flake" cx="420" cy="120" r="1.5"/><circle class="flake" cx="660" cy="680" r="1.5"/>
<circle class="flake" cx="900" cy="480" r="1.5"/><circle class="flake" cx="1140" cy="80" r="1.5"/><circle class="flake" cx="1380" cy="620" r="1.5"/>
<circle class="flake" cx="180" cy="1320" r="1.5"/><circle class="flake" cx="660" cy="1580" r="1.5"/><circle class="flake" cx="1140" cy="980" r="1.5"/>
</g>
<g class="sleigh" transform="translate(1900,-60)">
<g transform="translate(0,170)">
<circle class="trail" cx="-60" cy="40" r="2"/><circle class="trail" cx="-95" cy="46" r="1.5"/><circle class="trail" cx="-130" cy="52" r="1"/>
<path class="shape" d="M0 30 Q2 52 24 52 H78 Q90 52 94 40 L98 30 H84 L80 40 H22 Q10 40 10 30 Z"/>
<path class="shape" d="M-6 58 H96 Q104 58 104 50" fill="none" stroke="#33415a" stroke-width="3"/>
<rect class="santa" x="34" y="10" width="26" height="24" rx="8"/>
<circle class="moon" cx="47" cy="6" r="7"/>
<path class="santa" d="M40 2 L47 -14 L56 2 Z"/>
<path d="M98 34 L150 30" stroke="#c8a24a" stroke-width="1.5"/>
<g class="shape"><ellipse cx="170" cy="30" rx="18" ry="8"/><circle cx="190" cy="20" r="5"/><path d="M158 36 l-4 14 M182 36 l4 14 M188 15 l-3 -10 M192 15 l4 -10" stroke="#33415a" stroke-width="2"/></g>
<path d="M188 30 L210 26" stroke="#c8a24a" stroke-width="1.5"/>
<g class="shape"><ellipse cx="230" cy="26" rx="18" ry="8"/><circle cx="250" cy="16" r="5"/><circle class="santa" cx="255" cy="17" r="2"/><path d="M218 32 l-4 14 M242 32 l4 14 M248 11 l-3 -10 M252 11 l4 -10" stroke="#33415a" stroke-width="2"/></g>
</g>
</g>
</svg>`

// Each glyph of the sleigh drawn at column x; glyphs left of the edge are cut.
const sleighLine = (x: number): string => {
  let cut = -x
  const shown: string[] = []

  for (const [glyph, width] of SLEIGH) {
    if (cut > 0) {
      cut -= width
      if (cut < 0) shown.push(' '.repeat(-cut))
      continue
    }
    shown.push(glyph)
  }

  return ' '.repeat(Math.max(0, x)) + shown.join('')
}

type Flake = { x: number; y: number; speed: number; drift: number; phase: number; look: number }

const newFlake = (columns: number, isAnywhere: boolean): Flake => {
  const look = Math.floor(Math.random() * FLAKE_LOOKS.length)

  return {
    x: Math.random() * columns,
    y: isAnywhere ? Math.random() * SNOW_ROWS : -Math.random(),
    speed: 0.12 - look * 0.02 + Math.random() * 0.05,
    drift: 0.4 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
    look,
  }
}

const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

const toBase64 = (bytes: Uint8Array): string => {
  let out = ''

  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i] ?? 0
    const b = bytes[i + 1] ?? 0
    const c = bytes[i + 2] ?? 0
    out += BASE64[a >> 2]! + BASE64[((a & 3) << 4) | (b >> 4)]!
    out += i + 1 < bytes.length ? BASE64[((b & 15) << 2) | (c >> 6)]! : '='
    out += i + 2 < bytes.length ? BASE64[c & 63]! : '='
  }

  return out
}

// Module-level snow: the flakes, the band they fall in, and its width.
let flakes: Flake[] = []
let snowSite: string | null = null
let snowColumns = 0
let tick = 0

// Moves every flake one step and packs the band's cells for a Raster.
const snowFrame = (columns: number): string => {
  if (columns !== snowColumns) {
    snowColumns = columns
    flakes = Array.from({ length: Math.max(4, Math.round(columns / 5)) }, () => newFlake(columns, true))
  }
  tick += 1
  const words = new Uint32Array(columns * SNOW_ROWS * 3)

  for (let cell = 0; cell < columns * SNOW_ROWS; cell += 1) {
    words.set([0x20, DEFAULT_COLOR, DEFAULT_COLOR], cell * 3)
  }

  flakes = flakes.map(flake => {
    const moved = { ...flake, y: flake.y + flake.speed }

    return moved.y >= SNOW_ROWS ? newFlake(columns, false) : moved
  })

  for (const flake of flakes) {
    const row = Math.floor(flake.y)
    const col = Math.round(flake.x + Math.sin(flake.phase + tick * 0.08) * flake.drift)
    if (row < 0 || col < 0 || col >= columns) continue
    const [glyph, color] = FLAKE_LOOKS[flake.look]!
    words.set([glyph, color, DEFAULT_COLOR], (row * columns + col) * 3)
  }

  return toBase64(new Uint8Array(words.buffer))
}

const daysToChristmas = (now: number): number => {
  const today = new Date(now)
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  let christmasUtc = Date.UTC(today.getFullYear(), 11, 25)
  if (todayUtc > christmasUtc) christmasUtc = Date.UTC(today.getFullYear() + 1, 11, 25)

  // UTC midnights: immune to DST shifts
  return Math.round((christmasUtc - todayUtc) / 86_400_000)
}

// Module-level: the band width last drawn and the running animation timer.
let columns = 120
let ride: { cancel: () => void } | null = null

async function pass($: EngineInterface): Promise<void> {
  if (ride !== null) return
  await update($, step, () => 0)
  ride = $.clock.every(FRAME_MS, () => {
    void update($, step, current => {
      const nextStep = (current ?? 0) + 1
      if (nextStep - SLEIGH_WIDTH <= columns + HO.length) return nextStep
      ride?.cancel()
      ride = null

      return null
    })
  })
}

function scheduleNext($: EngineInterface, ms: number): void {
  $.clock.after(ms, () => {
    void pass($)
    scheduleNext($, MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS))
  })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await update($, step, () => null)
    await $.command.register({ name: 'christmas', description: "Send Santa's sleigh across right now" })
    await $.command.register({ name: 'snow', description: 'Turn the falling snow above the prompt on or off' })

    const days = daysToChristmas(await $.clock.now())
    $.ui.status(days === 0 ? '🎄 Merry Christmas!' : `🎄 ${days} day${days === 1 ? '' : 's'} to Christmas`)

    try {
      await $.theme.set(LOOK)
    } catch (error) {
      $.ui.log(`christmas: ${String(error)}`)
    }

    scheduleNext($, FIRST_PASS_MS)
    $.clock.every(SNOW_MS, () => {
      if (snowSite !== null) void $.ui.blit({ requestId: snowSite, key: 'snow', cells: snowFrame(snowColumns) })
    })

    return next(e)
  })

  on('command.run', { command: 'christmas' }, async $ => {
    await pass($)

    return { text: '🎅 Ho ho ho! The sleigh is on its way.' }
  })

  on('command.run', { command: 'snow' }, async $ => {
    const isOn = !(await read($, isSnowing))
    await update($, isSnowing, () => isOn)

    return { text: isOn ? '❄️ Let it snow!' : 'Snow stopped.' }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)

    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="Santa's sleigh crossing a snowy night sky" />
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, step)
    const hasSnow = e.surface === 'terminal' && (await read($, isSnowing))
    snowSite = null
    if ((current === null && !hasSnow) || e.props.hasSurvey || e.props.isCollapsed) return next(e)

    columns = e.props.bodyColumns
    const x = current === null ? 0 : current - SLEIGH_WIDTH
    const isMidway = x > columns / 3 && x < (columns * 2) / 3

    if (e.surface === 'terminal') {
      const { Box, Raster, Text } = $.ui.resolve(e)
      const width = Math.min(512, Math.max(1, columns))
      if (hasSnow) snowSite = e.requestId

      return (
        <Box flexDirection="column">
          {hasSnow ? <Raster key="snow" columns={width} rows={SNOW_ROWS} cells={snowFrame(width)} /> : null}
          {current === null ? null : (
            <Text wrap="truncate-end">
              <Text color="yellow">{sleighLine(x)}</Text>
              {isMidway ? <Text color="red" bold>{HO}</Text> : ''}
            </Text>
          )}
        </Box>
      )
    }

    const { Text } = $.ui.resolve(e)

    return (
      <Text wrap="truncate-end">
        <Text color="yellow">{sleighLine(x)}</Text>
        {isMidway ? <Text color="red" bold>{HO}</Text> : ''}
      </Text>
    )
  })
}
