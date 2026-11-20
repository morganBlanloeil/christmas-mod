# christmas

A Christmas mod for Claude Code.

- **Terminal**: snow keeps falling gently in the band above the prompt. Every 6 to 15 minutes, Santa's sleigh (🎅🛷 pulled by 🦌🦌🦌) crosses that band, with a "Ho ho ho!" halfway. The status line counts down the days to Christmas.
- **Desktop and mobile apps**: a winter night theme (blue and gold) and an animated backdrop where a vector sleigh flies across a starry, snowy sky.
- `/christmas` sends the sleigh across right now.
- `/snow` turns the falling snow on or off for the session.

## Install

At the prompt of a terminal session:

```
/plugin install christmas --marketplace morganBlanloeil/christmas-mod
```

Answer `y` to add the marketplace, then pick a scope (user scope first, Enter).

From a shell:

```
claude plugin install christmas --marketplace morganBlanloeil/christmas-mod
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `morganBlanloeil/christmas-mod`, then Add plugin.

## Layout

- `hooks/register.tsx`: the hooks module (snow, sleigh, status line, theme, backdrop, `/christmas` and `/snow` commands).
- `hooks/make-colors.js`: the theme color helper shipped with Claude Code's mod authoring skill, copied unchanged.
- `types/index.d.ts`: the mod's state contract.
- `tests/band.test.tsx`: checks the snow band and `/snow` (`claude plugin test .`).

## Develop

```
claude --plugin-dir .
claude plugin validate .
```
