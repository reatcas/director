import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')

// ─── Layout structure ───────────────────────────────────────────────────────
describe('layout structure — split panel', () => {
  it('defines #splitLayout as flex container', () => {
    expect(css).toContain('#splitLayout')
  })

  it('defines console column', () => {
    expect(css).toContain('.console-col')
  })

  it('defines mixer panel', () => {
    expect(css).toContain('.mixer-panel')
  })

  it('defines split divider', () => {
    expect(css).toContain('.split-divider')
  })

  it('split divider has cursor style', () => {
    const divider = css.split('.split-divider')[1]?.split('}')[0] || ''
    expect(divider).toContain('cursor')
  })
})

// ─── Transport bar ──────────────────────────────────────────────────────────
describe('transport bar styling', () => {
  it('defines #transport', () => {
    expect(css).toContain('#transport {')
  })

  it('transport uses -webkit-app-region: drag for titlebar', () => {
    expect(css).toContain('-webkit-app-region: drag')
  })

  it('transport children disable drag', () => {
    expect(css).toContain('-webkit-app-region: no-drag')
  })

  it('defines transport controls', () => {
    expect(css).toContain('#transportControls')
  })

  it('defines transport info', () => {
    expect(css).toContain('#transportInfo')
  })

  it('defines transport actions', () => {
    expect(css).toContain('#transportActions')
  })
})

// ─── Monitor status states ──────────────────────────────────────────────────
describe('monitor status CSS states', () => {
  it('defines .monitor-status base', () => {
    expect(css).toContain('.monitor-status {')
  })

  it('has idle state', () => {
    expect(css).toContain('.monitor-status.idle')
  })

  it('has interpreting state', () => {
    expect(css).toContain('.monitor-status.interpreting')
  })

  it('has usage state', () => {
    expect(css).toContain('.monitor-status.usage')
  })

  it('has finished state', () => {
    expect(css).toContain('.monitor-status.finished')
  })
})

// ─── Waveform animation ────────────────────────────────────────────────────
describe('waveform animation', () => {
  it('defines @keyframes waveformPulse', () => {
    expect(css).toContain('@keyframes waveformPulse')
  })

  it('defines .waveform-bar', () => {
    expect(css).toContain('.waveform-bar')
  })

  it('waveform uses scaleY transform', () => {
    const anim = css.split('waveformPulse')[1]?.split('}')[0] || ''
    expect(anim).toContain('scaleY')
  })
})

// ─── Log entry types ────────────────────────────────────────────────────────
describe('log entry type CSS classes', () => {
  const entryTypes = [
    '.le',
    '.le-action',
    '.le-interpreting',
    '.le-usage',
    '.le-feature',
    '.le-cycle',
    '.le-error',
    '.le-claude-msg',
    '.le-conclusion',
    '.le-iteration',
    '.le-sleep',
    '.le-summary',
    '.le-group',
  ]

  for (const cls of entryTypes) {
    it(`defines ${cls} class`, () => {
      expect(css).toContain(cls)
    })
  }

  it('defines .le-group-header', () => {
    expect(css).toContain('.le-group-header')
  })

  it('defines .le-group-body', () => {
    expect(css).toContain('.le-group-body')
  })

  it('defines .le-group.expanded', () => {
    expect(css).toContain('.le-group.expanded')
  })

  it('le-group-body hidden by default', () => {
    const body = css.split('.le-group-body')[1]?.split('}')[0] || ''
    expect(body).toContain('display: none') || expect(body).toContain('max-height: 0') || expect(body).toContain('display:none')
  })
})

// ─── Log filter ─────────────────────────────────────────────────────────────
describe('log filter CSS', () => {
  it('defines .filtering class on log', () => {
    expect(css).toContain('.filtering')
  })

  it('defines .match class for filter matches', () => {
    expect(css).toContain('.match')
  })
})

// ─── Mixer strips ───────────────────────────────────────────────────────────
describe('mixer strip styling', () => {
  it('defines .strip-h for horizontal strips', () => {
    expect(css).toContain('.strip-h')
  })

  it('defines .strip-h.on for active state', () => {
    expect(css).toContain('.strip-h.on')
  })

  it('defines .strip-h.off for inactive state', () => {
    expect(css).toContain('.strip-h.off')
  })

  it('defines strip bar fill', () => {
    expect(css).toContain('.strip-bar-fill-h')
  })

  it('defines strip value display', () => {
    expect(css).toContain('.strip-h-val')
  })
})

// ─── Mixer tabs ─────────────────────────────────────────────────────────────
describe('mixer tab styling', () => {
  it('defines .mixer-tabs container', () => {
    expect(css).toContain('.mixer-tabs')
  })

  it('defines .mixer-tab button', () => {
    expect(css).toContain('.mixer-tab {')
  })

  it('defines active tab state', () => {
    expect(css).toContain('.mixer-tab.on')
  })

  it('defines tab hover', () => {
    expect(css).toContain('.mixer-tab:hover')
  })

  it('defines tab pane visibility', () => {
    expect(css).toContain('.mixer-tab-pane')
    expect(css).toContain('.mixer-tab-pane.on')
  })
})

// ─── Modal system ───────────────────────────────────────────────────────────
describe('modal system CSS', () => {
  it('defines .modal-overlay', () => {
    expect(css).toContain('.modal-overlay {')
  })

  it('hides modal with [hidden]', () => {
    expect(css).toContain('.modal-overlay[hidden]')
    expect(css).toContain('display: none !important')
  })

  it('defines .modal-card', () => {
    expect(css).toContain('.modal-card {')
  })

  it('defines .modal-close button', () => {
    expect(css).toContain('.modal-close {')
  })

  it('modal-close hover shows red', () => {
    expect(css).toContain('.modal-close:hover')
    expect(css).toContain('--fl-red')
  })

  it('defines modal structure classes', () => {
    expect(css).toContain('.modal-title')
    expect(css).toContain('.modal-subtitle')
    expect(css).toContain('.modal-body')
    expect(css).toContain('.modal-footer')
  })
})

// ─── Stall badge ────────────────────────────────────────────────────────────
describe('stall badge CSS (F-20)', () => {
  it('defines .stall-badge', () => {
    expect(css).toContain('.stall-badge {')
  })

  it('uses stall-pulse animation', () => {
    expect(css).toContain('@keyframes stall-pulse')
  })
})

// ─── Metrics strip ──────────────────────────────────────────────────────────
describe('metrics strip CSS', () => {
  it('defines .metrics-strip', () => {
    expect(css).toContain('.metrics-strip')
  })

  it('defines .mm-val value display', () => {
    expect(css).toContain('.mm-val')
  })

  it('defines .mm-val.active state', () => {
    expect(css).toContain('.mm-val.active')
  })

  it('defines .mm-val.warn state', () => {
    expect(css).toContain('.mm-val.warn')
  })

  it('defines .mm-val.hot state', () => {
    expect(css).toContain('.mm-val.hot')
  })

  it('defines .mm-val.ok state', () => {
    expect(css).toContain('.mm-val.ok')
  })

  it('defines .mm-val.bad state', () => {
    expect(css).toContain('.mm-val.bad')
  })
})

// ─── Rack and project list ──────────────────────────────────────────────────
describe('rack / project list', () => {
  it('defines #rack', () => {
    expect(css).toContain('#rack {')
  })

  it('defines .led indicator', () => {
    expect(css).toContain('.led')
  })

  it('defines .pn for project name', () => {
    expect(css).toContain('.pn')
  })

  it('defines li.sel for selected project', () => {
    expect(css).toContain('li.sel')
  })

  it('defines li.live for running project', () => {
    expect(css).toContain('li.live')
  })
})

// ─── Blueprint UI ───────────────────────────────────────────────────────────
describe('blueprint UI CSS', () => {
  it('defines .bp-phase-pill', () => {
    expect(css).toContain('.bp-phase-pill')
  })

  it('defines .bp-phase-pill.active', () => {
    expect(css).toContain('.bp-phase-pill.active')
  })

  it('defines .bp-phase-pill.done', () => {
    expect(css).toContain('.bp-phase-pill.done')
  })

  it('defines .bp-msg for messages', () => {
    expect(css).toContain('.bp-msg')
  })

  it('defines .bp-phase-bar and fill', () => {
    expect(css).toContain('.bp-phase-bar')
    expect(css).toContain('.bp-phase-fill')
  })
})

// ─── Allocation inspector ───────────────────────────────────────────────────
describe('allocation inspector CSS (F-13)', () => {
  it('defines .alloc-inspector', () => {
    expect(css).toContain('.alloc-inspector')
  })

  it('defines .alloc-categories for category display', () => {
    expect(css).toContain('.alloc-categories')
  })

  it('defines .ac-hot for hot path badge', () => {
    expect(css).toContain('.ac-hot')
  })
})

// ─── Empty state ────────────────────────────────────────────────────────────
describe('empty state CSS', () => {
  it('defines .empty-state', () => {
    expect(css).toContain('.empty-state')
  })

  it('defines .empty-state.on for visible state', () => {
    expect(css).toContain('.empty-state.on')
  })
})

// ─── Scrollbar styling ─────────────────────────────────────────────────────
describe('scrollbar styling', () => {
  it('defines custom scrollbar', () => {
    expect(css).toContain('::-webkit-scrollbar')
  })

  it('defines scrollbar thumb', () => {
    expect(css).toContain('::-webkit-scrollbar-thumb')
  })

  it('defines scrollbar track', () => {
    expect(css).toContain('::-webkit-scrollbar-track')
  })
})

// ─── Usage banner ───────────────────────────────────────────────────────────
describe('usage banner CSS', () => {
  it('defines #usageBanner or .usage-banner', () => {
    expect(css).toMatch(/#usageBanner|\.usage-banner/)
  })
})

// ─── Saved mixes ────────────────────────────────────────────────────────────
describe('saved mixes CSS', () => {
  it('defines .mix-card', () => {
    expect(css).toContain('.mix-card')
  })

  it('defines mix ribbon', () => {
    expect(css).toContain('.mix-ribbon') || expect(css).toContain('.mix-card')
  })
})

// ─── Additional keyframes ───────────────────────────────────────────────────
describe('additional keyframes', () => {
  it('defines ringRotate for loading indicators', () => {
    expect(css).toContain('@keyframes ringRotate')
  })

  it('defines ringPulse', () => {
    expect(css).toContain('@keyframes ringPulse')
  })

  it('defines usageBarPulse', () => {
    expect(css).toContain('@keyframes usageBarPulse')
  })
})

// ─── Process monitor ────────────────────────────────────────────────────────
describe('process monitor CSS', () => {
  it('defines process list styling', () => {
    expect(css).toContain('.procs-panel') || expect(css).toContain('#procsPanel')
  })
})

// ─── Glass effects ──────────────────────────────────────────────────────────
describe('glass / transparency effects', () => {
  it('uses backdrop-filter or -webkit-backdrop-filter', () => {
    expect(css).toMatch(/backdrop-filter/)
  })

  it('uses rgba for transparency', () => {
    const rgbaCount = (css.match(/rgba\(/g) || []).length
    expect(rgbaCount).toBeGreaterThan(50)
  })
})

// ─── Smart Mix bar ──────────────────────────────────────────────────────────
describe('Smart Mix bar CSS', () => {
  it('defines .smart-mix-bar', () => {
    expect(css).toContain('.smart-mix-bar')
  })

  it('defines aurora CSS variables', () => {
    expect(css).toContain('--aurora-c1')
    expect(css).toContain('--aurora-c2')
    expect(css).toContain('--aurora-c3')
    expect(css).toContain('--aurora-c4')
  })
})
