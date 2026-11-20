import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'christmas',
  surface: 'terminal',
  component: 'AbovePrompt',
  props: {
    hasSurvey: false,
    isCollapsed: false,
    isWorking: false,
    maxRows: 6,
    bodyColumns: 80,
    scroll: { offset: 0, bodyRows: 6 },
    view: {},
  },
} as const

test('snow falls in the terminal band', async $ => {
  const ui = await $.ui.mount(BAND)

  const snow = await ui.find({ key: 'snow' })
  expect(snow?.type).toBe('Raster')
  await ui.unmount()
})

test('/snow turns the snow off', async $ => {
  const answer = await $.command.run({ command: 'snow', args: '' })
  expect(JSON.stringify(answer)).toContain('Snow stopped')

  const ui = await $.ui.mount(BAND)
  expect(await ui.find({ key: 'snow' })).toBeUndefined()
  await ui.unmount()
})
