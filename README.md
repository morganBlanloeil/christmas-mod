# christmas

A Christmas mod for Claude Code.

- **Terminal**: every 6 to 15 minutes, Santa's sleigh (🎅🛷 pulled by 🦌🦌🦌) crosses the band above the prompt under falling snow, with a "Ho ho ho!" halfway. The status line counts down the days to Christmas.
- **Desktop and mobile apps**: a winter night theme (blue and gold) and an animated backdrop where a vector sleigh flies across a starry, snowy sky.
- `/christmas` sends the sleigh across right now.

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

- `hooks/register.tsx`: the hooks module (band animation, status line, theme, backdrop, `/christmas` command).
- `hooks/make-colors.js`: the theme color helper shipped with Claude Code's mod authoring skill, copied unchanged.
- `types/index.d.ts`: the mod's state contract.

## Develop

```
claude --plugin-dir .
claude plugin validate .
```
