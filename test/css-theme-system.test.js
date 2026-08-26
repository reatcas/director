import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')

// ─── Light theme variable overrides ────────────────────────────────────────
describe('light theme — CSS variable overrides', () => {
  const lightBlock = css.split('html.light {')[1]?.split('}')[0] || ''

  it('overrides --bg', () => {
    expect(lightBlock).toContain('--bg:')
  })

  it('overrides all panel variants', () => {
    expect(lightBlock).toContain('--panel:')
    expect(lightBlock).toContain('--panel2:')
    expect(lightBlock).toContain('--panel3:')
    expect(lightBlock).toContain('--panel4:')
  })

  it('overrides --strip', () => {
    expect(lightBlock).toContain('--strip:')
  })

  it('overrides line and text colors', () => {
    expect(lightBlock).toContain('--line:')
    expect(lightBlock).toContain('--line2:')
    expect(lightBlock).toContain('--txt:')
    expect(lightBlock).toContain('--txt2:')
    expect(lightBlock).toContain('--dim:')
    expect(lightBlock).toContain('--dim2:')
  })

  it('overrides fluorescent colors', () => {
    expect(lightBlock).toContain('--fl-orange:')
    expect(lightBlock).toContain('--fl-green:')
    expect(lightBlock).toContain('--fl-red:')
    expect(lightBlock).toContain('--fl-yellow:')
    expect(lightBlock).toContain('--fl-cyan:')
    expect(lightBlock).toContain('--fl-blue:')
  })

  it('overrides AI brand colors', () => {
    expect(lightBlock).toContain('--ai-blue:')
    expect(lightBlock).toContain('--ai-purple:')
    expect(lightBlock).toContain('--ai-cyan:')
  })

  it('overrides glow shadows', () => {
    expect(lightBlock).toContain('--glow-cyan:')
    expect(lightBlock).toContain('--glow-green:')
    expect(lightBlock).toContain('--glow-orange:')
    expect(lightBlock).toContain('--glow-purple:')
  })
})

// ─── Light theme component overrides ───────────────────────────────────────
describe('light theme — component overrides', () => {
  it('overrides transport bar', () => {
    expect(css).toContain('html.light #transport')
  })

  it('overrides rack', () => {
    expect(css).toContain('html.light #rack')
  })

  it('overrides rack-item hover and active', () => {
    expect(css).toContain('html.light .rack-item:hover')
    expect(css).toContain('html.light .rack-item.on')
  })

  it('overrides AI control and selects', () => {
    expect(css).toContain('html.light .ai-control')
    expect(css).toContain('html.light #aiSelect')
    expect(css).toContain('html.light #modelSelect')
  })

  it('overrides transport buttons', () => {
    expect(css).toContain('html.light .tp-btn')
  })

  it('overrides AI icons (4 providers)', () => {
    expect(css).toContain('html.light .ai-icon.antigravity')
    expect(css).toContain('html.light .ai-icon.anthropic')
    expect(css).toContain('html.light .ai-icon.openai')
    expect(css).toContain('html.light .ai-icon.aider')
  })

  it('removes text-shadow on light AI icons', () => {
    const antigravity = css.split('html.light .ai-icon.antigravity')[1]?.split('}')[0] || ''
    expect(antigravity).toContain('text-shadow: none')
  })

  it('overrides clock area', () => {
    expect(css).toContain('html.light #clockArea')
    expect(css).toContain('html.light .clock-seg')
  })

  it('overrides split divider', () => {
    expect(css).toContain('html.light .split-divider-v')
    expect(css).toContain('html.light .split-divider-v::after')
  })
})

// ─── Light theme log entries ───────────────────────────────────────────────
describe('light theme — log entry overrides', () => {
  it('overrides base .le color', () => {
    expect(css).toContain('html.light .le {')
  })

  it('overrides .le-msg color', () => {
    expect(css).toContain('html.light .le-msg')
  })

  it('overrides .le-ts color', () => {
    expect(css).toContain('html.light .le-ts')
  })

  it('overrides error entry', () => {
    expect(css).toContain('html.light .le-error .le-msg')
  })

  it('overrides usage entry', () => {
    expect(css).toContain('html.light .le-usage .le-msg')
  })

  it('overrides sleep entry', () => {
    expect(css).toContain('html.light .le-sleep .le-icon')
    expect(css).toContain('html.light .le-sleep .le-msg')
  })

  it('overrides summary entry', () => {
    expect(css).toContain('html.light .le-summary .le-badge')
    expect(css).toContain('html.light .le-summary .le-summary-text')
  })

  it('overrides group entries', () => {
    expect(css).toContain('html.light .le-group')
    expect(css).toContain('html.light .le-group-header:hover')
    expect(css).toContain('html.light .le-group-count')
    expect(css).toContain('html.light .le-group-body')
  })
})

// ─── Light theme mixer/modal/settings ──────────────────────────────────────
describe('light theme — mixer, modal, settings', () => {
  it('overrides mixer panel', () => {
    expect(css).toContain('html.light .mixer-panel')
  })

  it('overrides mixer tabs', () => {
    expect(css).toContain('html.light .mixer-tabs')
    expect(css).toContain('html.light .mixer-tab')
    expect(css).toContain('html.light .mixer-tab.on')
  })

  it('overrides mixer strips', () => {
    expect(css).toContain('html.light .strip-h')
    expect(css).toContain('html.light .strip-h-val')
    expect(css).toContain('html.light .strip-bar-fill-h')
  })

  it('overrides modal overlay and card', () => {
    expect(css).toContain('html.light .modal-overlay')
    expect(css).toContain('html.light .modal-card')
    expect(css).toContain('html.light .modal-title')
  })

  it('overrides settings section', () => {
    expect(css).toContain('html.light .settings-section')
    expect(css).toContain('html.light .stg-btn')
    expect(css).toContain('html.light .stg-btn.on')
    expect(css).toContain('html.light .stg-slider')
  })

  it('overrides saved mixes', () => {
    expect(css).toContain('html.light .mix-card')
    expect(css).toContain('html.light .mix-ribbon')
  })

  it('overrides empty state', () => {
    expect(css).toContain('html.light .empty-ring')
    expect(css).toContain('html.light .empty-glyph')
    expect(css).toContain('html.light .empty-title')
  })

  it('overrides blueprint', () => {
    expect(css).toContain('html.light .bp-phases')
    expect(css).toContain('html.light .bp-phase-pill')
    expect(css).toContain('html.light .bp-messages')
  })

  it('overrides usage banner', () => {
    expect(css).toContain('html.light #usageBanner')
  })

  it('overrides console and monitor', () => {
    expect(css).toContain('html.light .console-log-wrap')
    expect(css).toContain('html.light .monitor-status')
    expect(css).toContain('html.light .metrics-strip')
  })

  it('overrides allocation inspector', () => {
    expect(css).toContain('html.light .alloc-inspector')
    expect(css).toContain('html.light .alloc-toggle')
    expect(css).toContain('html.light .alloc-cat')
  })

  it('overrides scrollbar in light theme', () => {
    expect(css).toContain('html.light ::-webkit-scrollbar-thumb')
  })

  it('overrides lifecycle timeline', () => {
    expect(css).toContain('html.light .lc-event:hover')
    expect(css).toContain('html.light .lc-ts')
  })

  it('overrides knowledge tab', () => {
    expect(css).toContain('html.light .kn-btn')
  })

  it('overrides collapsible critique', () => {
    expect(css).toContain('html.light details.console-collapsible')
    expect(css).toContain('html.light .collapsible-header')
  })
})

// ─── Keyframes completeness ────────────────────────────────────────────────
describe('keyframes — complete inventory', () => {
  const allKeyframes = [
    'pulseGlow', 'aurora', 'brandGlow', 'statusLive', 'fadeInUp',
    'waveformPulse', 'ringRotate', 'ringPulse', 'interpretingGlow',
    'usagePulse', 'glowBorder', 'ai-pulse', 'stall-pulse',
    'usageBarPulse', 'auroraDrift',
  ]

  for (const kf of allKeyframes) {
    it(`defines @keyframes ${kf}`, () => {
      expect(css).toContain(`@keyframes ${kf}`)
    })
  }
})

// ─── z-index layering ──────────────────────────────────────────────────────
describe('z-index layering', () => {
  it('modal overlay uses highest z-index (9999)', () => {
    const overlay = css.split('.modal-overlay')[1]?.split('}')[0] || ''
    expect(overlay).toContain('z-index: 9999')
  })

  it('#transport uses z-index 10', () => {
    const transport = css.split('#transport {')[1]?.split('}')[0] || ''
    expect(transport).toContain('z-index: 10')
  })

  it('#workspace uses z-index 1', () => {
    const workspace = css.split('#workspace')[1]?.split('}')[0] || ''
    expect(workspace).toContain('z-index: 1')
  })

  it('particleCanvasWrap uses z-index 0', () => {
    const canvas = css.split('#particleCanvasWrap')[1]?.split('}')[0] || ''
    expect(canvas).toContain('z-index: 0')
  })
})

// ─── CSS color system — root variables ─────────────────────────────────────
describe('CSS color system — root variables', () => {
  const rootBlock = css.split(':root')[1]?.split('}')[0] || ''

  it('defines all panel shade variables', () => {
    expect(rootBlock).toContain('--panel:')
    expect(rootBlock).toContain('--panel2:')
    expect(rootBlock).toContain('--panel3:')
    expect(rootBlock).toContain('--panel4:')
  })

  it('defines fluorescent palette (6 colors)', () => {
    expect(rootBlock).toContain('--fl-orange:')
    expect(rootBlock).toContain('--fl-green:')
    expect(rootBlock).toContain('--fl-red:')
    expect(rootBlock).toContain('--fl-yellow:')
    expect(rootBlock).toContain('--fl-cyan:')
    expect(rootBlock).toContain('--fl-blue:')
  })

  it('defines AI brand colors (3)', () => {
    expect(rootBlock).toContain('--ai-blue:')
    expect(rootBlock).toContain('--ai-purple:')
    expect(rootBlock).toContain('--ai-cyan:')
  })

  it('defines glow shadow variables (4)', () => {
    expect(rootBlock).toContain('--glow-cyan:')
    expect(rootBlock).toContain('--glow-green:')
    expect(rootBlock).toContain('--glow-orange:')
    expect(rootBlock).toContain('--glow-purple:')
  })

  it('defines typography variables', () => {
    expect(rootBlock).toContain('--mono:')
    expect(rootBlock).toContain('--sans:')
  })

  it('defines radius variables', () => {
    expect(rootBlock).toContain('--radius:')
    expect(rootBlock).toContain('--radius-sm:')
  })
})

// ─── Transitions ───────────────────────────────────────────────────────────
describe('transition usage', () => {
  it('has 20+ transition declarations', () => {
    const count = (css.match(/transition:/g) || []).length
    expect(count).toBeGreaterThan(20)
  })

  it('modal-close uses transition', () => {
    const close = css.split('.modal-close {')[1]?.split('}')[0] || ''
    expect(close).toContain('transition:')
  })

  it('settings toggle uses transition', () => {
    const stg = css.split('.stg-btn {')[1]?.split('}')[0] || ''
    expect(stg).toContain('transition:')
  })

  it('strip value uses transition for border-color', () => {
    expect(css).toContain('transition: border-color')
  })
})

// ─── CSS modern features ───────────────────────────────────────────────────
describe('modern CSS features', () => {
  it('uses color-mix() for dynamic color blending', () => {
    const colorMixCount = (css.match(/color-mix\(/g) || []).length
    expect(colorMixCount).toBeGreaterThan(10)
  })

  it('uses backdrop-filter for glass effects', () => {
    expect(css).toContain('backdrop-filter: blur')
  })

  it('uses mix-blend-mode: screen for particle canvas', () => {
    expect(css).toContain('mix-blend-mode: screen')
  })

  it('uses inset shorthand', () => {
    expect(css).toContain('inset: 0')
  })

  it('uses CSS custom properties with var()', () => {
    const varCount = (css.match(/var\(--/g) || []).length
    expect(varCount).toBeGreaterThan(100)
  })
})

// ─── focus-visible ─────────────────────────────────────────────────────────
describe('focus-visible accessibility', () => {
  it('defines focus-visible for buttons', () => {
    expect(css).toContain('button:focus-visible')
  })

  it('defines focus-visible for inputs', () => {
    expect(css).toContain('input:focus-visible')
  })

  it('defines focus-visible for selects', () => {
    expect(css).toContain('select:focus-visible')
  })

  it('uses --ai-cyan outline color', () => {
    const focusBlock = css.split('button:focus-visible')[1]?.split('}')[0] || ''
    expect(focusBlock).toContain('var(--ai-cyan)')
  })
})

// ─── user-select: none ─────────────────────────────────────────────────────
describe('user-select: none — non-selectable UI elements', () => {
  it('applies user-select: none to transport and rack', () => {
    expect(css).toContain('user-select: none')
  })

  it('covers transport, rack, empty-state, monitor', () => {
    const selLine = css.split('user-select: none')[0] || ''
    const lastLines = selLine.slice(-200)
    expect(lastLines).toContain('#transport')
    expect(lastLines).toContain('#rack')
  })
})

// ─── Font declarations ────────────────────────────────────────────────────
describe('font system', () => {
  it('imports Share Tech Mono from Google Fonts', () => {
    expect(css).toContain("@import url('https://fonts.googleapis.com/css2")
    expect(css).toContain('Share+Tech+Mono')
  })

  it('body uses --sans font family', () => {
    const body = css.split('body {')[1]?.split('}')[0] || ''
    expect(body).toContain('var(--sans)')
  })

  it('uses var(--mono) for monospace elements', () => {
    const monoCount = (css.match(/var\(--mono\)/g) || []).length
    expect(monoCount).toBeGreaterThan(5)
  })
})

// ─── Box sizing reset ─────────────────────────────────────────────────────
describe('CSS reset', () => {
  it('applies border-box globally', () => {
    expect(css).toContain('* { box-sizing: border-box')
  })

  it('body has 100vh height and hidden overflow', () => {
    const body = css.split('body {')[1]?.split('}')[0] || ''
    expect(body).toContain('height: 100vh')
    expect(body).toContain('overflow: hidden')
  })

  it('enables antialiasing', () => {
    expect(css).toContain('-webkit-font-smoothing: antialiased')
  })
})

// ─── AI provider icon animations ──────────────────────────────────────────
describe('AI provider icon system', () => {
  const providers = ['antigravity', 'anthropic', 'openai', 'aider']

  for (const p of providers) {
    it(`defines .ai-icon.${p} with color and animation`, () => {
      const block = css.split(`.ai-icon.${p}`)[1]?.split('}')[0] || ''
      expect(block).toContain('color:')
      expect(block).toContain('animation:')
    })
  }

  it('defines @keyframes ai-pulse', () => {
    expect(css).toContain('@keyframes ai-pulse')
  })

  it('defines .ai-auth-dot', () => {
    expect(css).toContain('.ai-auth-dot')
  })
})

// ─── Settings modal ───────────────────────────────────────────────────────
describe('settings modal CSS', () => {
  it('defines .settings-section', () => {
    expect(css).toContain('.settings-section')
  })

  it('defines .settings-label with uppercase', () => {
    expect(css).toContain('.settings-label')
    expect(css).toContain('text-transform: uppercase')
  })

  it('defines .settings-row with flex', () => {
    const row = css.split('.settings-row')[1]?.split('}')[0] || ''
    expect(row).toContain('display: flex')
  })

  it('defines .stg-btn with states', () => {
    expect(css).toContain('.stg-btn {')
    expect(css).toContain('.stg-btn:hover')
    expect(css).toContain('.stg-btn.on')
  })

  it('defines toggle switch (.stg-switch)', () => {
    expect(css).toContain('.stg-switch')
    expect(css).toContain('.stg-slider')
    expect(css).toContain('.stg-slider::before')
    expect(css).toContain('input:checked + .stg-slider')
  })
})

// ─── Blueprint module editor ──────────────────────────────────────────────
describe('blueprint module editor CSS', () => {
  it('defines .bp-modules container', () => {
    expect(css).toContain('.bp-modules {')
  })

  it('defines .bp-modules-header with sticky', () => {
    const header = css.split('.bp-modules-header')[1]?.split('}')[0] || ''
    expect(header).toContain('sticky')
  })

  it('defines .bp-mod-card', () => {
    expect(css).toContain('.bp-mod-card')
  })

  it('defines .bp-mod-name input', () => {
    expect(css).toContain('.bp-mod-name')
  })

  it('defines .bp-mod-del button', () => {
    expect(css).toContain('.bp-mod-del')
    expect(css).toContain('.bp-mod-del:hover')
  })

  it('defines blueprint input fields', () => {
    expect(css).toContain('.bp-input')
    expect(css).toContain('.bp-send')
    expect(css).toContain('.bp-skip')
  })
})

// ─── Transport utilities ──────────────────────────────────────────────────
describe('transport utilities CSS', () => {
  it('defines #transportUtils', () => {
    expect(css).toContain('#transportUtils')
  })

  it('defines transport utility button size', () => {
    expect(css).toContain('#transportUtils .tp-btn')
  })
})

// ─── Log filter integration ───────────────────────────────────────────────
describe('log filter display rule', () => {
  it('hides non-matching .le entries when .filtering', () => {
    expect(css).toContain('#log.filtering .le:not(.match)')
    expect(css).toContain('display: none !important')
  })
})
