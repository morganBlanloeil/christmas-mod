import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Position of the sleigh in the band, null between two passes.
const step = atom({ plugin: 'christmas', key: 'step' } as const, null)

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

// A row of drifting snowflakes, the same for a given frame.
const snowLine = (frame: number, columns: number): string => {
  let row = ''

  for (let col = 0; col < columns; col += 1) {
    const seed = (col * 7919 + Math.floor(frame / 3) * 104729) % 97
    row += seed === 0 ? '*' : seed === 1 ? '·' : ' '
  }

  return row
}

const daysToChristmas = (now: number): number => {
  const today = new Date(now)
  let christmas = new Date(today.getFullYear(), 11, 25)
  if (today > christmas && today.getDate() !== 25) christmas = new Date(today.getFullYear() + 1, 11, 25)

  return Math.ceil((christmas.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86_400_000)
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

    const days = daysToChristmas(await $.clock.now())
    $.ui.status(days === 0 ? '🎄 Merry Christmas!' : `🎄 ${days} day${days === 1 ? '' : 's'} to Christmas`)

    try {
      await $.theme.set(LOOK)
    } catch (error) {
      $.ui.log(`christmas: ${String(error)}`)
    }

    scheduleNext($, FIRST_PASS_MS)

    return next(e)
  })

  on('command.run', { command: 'christmas' }, async $ => {
    await pass($)

    return { text: '🎅 Ho ho ho! The sleigh is on its way.' }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)

    const { Svg } = $.ui.resolve(e)

    return <Svg source={SCENE} alt="Santa's sleigh crossing a snowy night sky" />
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, step)
    if (current === null || e.props.hasSurvey) return next(e)

    columns = e.props.bodyColumns
    const x = current - SLEIGH_WIDTH
    const isMidway = x > columns / 3 && x < (columns * 2) / 3
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        <Text color="white" dimColor wrap="truncate-end">{snowLine(current, columns)}</Text>
        <Text wrap="truncate-end">
          <Text color="yellow">{sleighLine(x)}</Text>
          {isMidway ? <Text color="red" bold>{HO}</Text> : ''}
        </Text>
      </Box>
    )
  })
}
