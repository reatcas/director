import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')

// ─── Smart Mix toggle aurora system ────────────────────────────────────────
describe('Smart Mix toggle — aurora mesh gradient', () => {
  it('defines .smart-mix-bar base', () => {
    expect(css).toContain('.smart-mix-bar {')
  })

  it('defines .smart-label', () => {
    expect(css).toContain('.smart-label')
  })

  it('defines active state label color', () => {
    expect(css).toContain('.smart-mix-bar.active .smart-label')
  })

  it('defines .smart-toggle container', () => {
    expect(css).toContain('.smart-toggle {')
  })

  it('defines aurora mesh with layered radial gradients', () => {
    const aurora = css.split('.smart-toggle-aurora')[1]?.split('}')[0] || ''
    expect(aurora).toContain('radial-gradient')
    expect(aurora).toContain('--aurora-c1')
    expect(aurora).toContain('--aurora-c2')
  })

  it('aurora animates with auroraDrift', () => {
    const aurora = css.split('.smart-toggle-aurora')[1]?.split('}')[0] || ''
    expect(aurora).toContain('animation: auroraDrift')
  })

  it('aurora starts hidden (opacity 0)', () => {
    const aurora = css.split('.smart-toggle-aurora')[1]?.split('}')[0] || ''
    expect(aurora).toContain('opacity: 0')
  })

  it('aurora visible when active', () => {
    expect(css).toContain('.smart-mix-bar.active .smart-toggle-aurora')
  })

  it('defines frosted glass overlay', () => {
    const glass = css.split('.smart-toggle-glass')[1]?.split('}')[0] || ''
    expect(glass).toContain('backdrop-filter: blur')
  })

  it('defines sliding knob with cubic-bezier transition', () => {
    const knob = css.split('.smart-toggle-knob')[1]?.split('}')[0] || ''
    expect(knob).toContain('border-radius: 50%')
    expect(knob).toContain('cubic-bezier')
  })

  it('active knob slides right (translateX)', () => {
    const activeKnob = css.split('.smart-mix-bar.active .smart-toggle-knob')[1]?.split('}')[0] || ''
    expect(activeKnob).toContain('translateX')
  })

  it('light theme overrides smart mix bar', () => {
    expect(css).toContain('html.light .smart-mix-bar')
    expect(css).toContain('html.light .smart-toggle')
  })
})

// ─── Lifecycle timeline ────────────────────────────────────────────────────
describe('lifecycle timeline CSS', () => {
  it('defines .lc-event base', () => {
    expect(css).toContain('.lc-event')
  })

  it('defines hover effect', () => {
    expect(css).toContain('.lc-event:hover')
  })

  it('defines .lc-ts timestamp', () => {
    expect(css).toContain('.lc-ts')
  })

  it('defines .lc-icon', () => {
    expect(css).toContain('.lc-icon')
  })

  it('defines .lc-label', () => {
    expect(css).toContain('.lc-label')
  })

  it('defines .lc-msg', () => {
    expect(css).toContain('.lc-msg')
  })

  it('light theme overrides lifecycle', () => {
    expect(css).toContain('html.light .lc-event:hover')
    expect(css).toContain('html.light .lc-ts')
    expect(css).toContain('html.light .lc-msg')
  })
})

// ─── Knowledge tab ─────────────────────────────────────────────────────────
describe('knowledge tab CSS', () => {
  it('defines .kn-pane', () => {
    expect(css).toContain('.kn-pane')
  })

  it('light theme overrides .kn-btn', () => {
    expect(css).toContain('html.light .kn-btn')
  })

  it('light theme overrides .kn-btn.on and .kn-btn.warn', () => {
    expect(css).toContain('html.light .kn-btn.on')
    expect(css).toContain('html.light .kn-btn.warn')
  })
})

// ─── Collapsible critique ──────────────────────────────────────────────────
describe('collapsible critique CSS', () => {
  it('defines details.console-collapsible', () => {
    expect(css).toContain('details.console-collapsible')
  })

  it('defines open state', () => {
    expect(css).toContain('details.console-collapsible[open]')
  })

  it('defines .collapsible-header', () => {
    expect(css).toContain('.collapsible-header {')
  })

  it('hides default markers', () => {
    expect(css).toContain('.collapsible-header::-webkit-details-marker')
    expect(css).toContain('.collapsible-header::marker')
  })

  it('defines .collapsible-icon', () => {
    expect(css).toContain('.collapsible-icon')
  })

  it('defines .collapsible-toggle with rotation', () => {
    expect(css).toContain('.collapsible-toggle')
    expect(css).toContain('rotate(-90deg)')
  })

  it('defines .collapsible-body', () => {
    expect(css).toContain('.collapsible-body')
  })

  it('light theme overrides collapsible', () => {
    expect(css).toContain('html.light details.console-collapsible')
    expect(css).toContain('html.light .collapsible-header')
    expect(css).toContain('html.light .collapsible-body textarea')
  })
})

// ─── Usage bar ─────────────────────────────────────────────────────────────
describe('usage bar CSS', () => {
  it('defines .usage-bar base', () => {
    expect(css).toContain('.usage-bar {')
  })

  it('defines .usage-bar-fill base', () => {
    expect(css).toContain('.usage-bar-fill {')
  })

  it('defines mid severity state', () => {
    expect(css).toContain('.usage-bar-fill.mid')
  })

  it('defines high severity state', () => {
    expect(css).toContain('.usage-bar-fill.high')
  })

  it('defines critical state with animation', () => {
    const critical = css.split('.usage-bar-fill.critical')[1]?.split('}')[0] || ''
    expect(critical).toContain('animation: usageBarPulse')
  })

  it('usage-bar-fill has width transition', () => {
    const fill = css.split('.usage-bar-fill {')[1]?.split('}')[0] || ''
    expect(fill).toContain('transition: width')
  })

  it('light theme overrides usage bar', () => {
    expect(css).toContain('html.light .usage-bar')
  })
})

// ─── About modal ───────────────────────────────────────────────────────────
describe('about modal CSS', () => {
  it('defines .about-card', () => {
    expect(css).toContain('.about-card')
  })

  it('defines .about-hero', () => {
    expect(css).toContain('.about-hero')
  })

  it('defines .about-logo', () => {
    expect(css).toContain('.about-logo')
  })

  it('defines .about-author section', () => {
    expect(css).toContain('.about-author {')
    expect(css).toContain('.about-author-name')
    expect(css).toContain('.about-author-handle')
  })

  it('defines .about-avatar', () => {
    expect(css).toContain('.about-avatar')
  })

  it('defines .about-credits section', () => {
    expect(css).toContain('.about-credits')
    expect(css).toContain('.about-credit-item')
    expect(css).toContain('.about-credit-label')
    expect(css).toContain('.about-credit-name')
  })

  it('light theme overrides about credits', () => {
    expect(css).toContain('html.light .about-credits')
  })
})

// ─── Clock area ────────────────────────────────────────────────────────────
describe('clock area CSS', () => {
  it('defines #clockArea', () => {
    expect(css).toContain('#clockArea')
  })

  it('defines .clock-block', () => {
    expect(css).toContain('.clock-block')
  })

  it('defines .clock-seg with styling', () => {
    expect(css).toContain('.clock-seg {')
  })

  it('defines orange variant for clock segments', () => {
    expect(css).toContain('.clock-seg.orange')
  })

  it('defines .clock-label', () => {
    expect(css).toContain('.clock-label')
  })

  it('light theme overrides clock', () => {
    expect(css).toContain('html.light #clockArea')
    expect(css).toContain('html.light .clock-seg')
    expect(css).toContain('html.light .clock-label')
  })
})

// ─── AI control panel ──────────────────────────────────────────────────────
describe('AI control panel CSS', () => {
  it('defines .ai-control', () => {
    expect(css).toContain('.ai-control')
  })

  it('defines .ai-credit-status', () => {
    expect(css).toContain('.ai-credit-status')
  })

  it('defines .ai-auth-dot with connected state', () => {
    expect(css).toContain('.ai-auth-dot')
    expect(css).toContain('.ai-auth-dot.connected')
  })

  it('defines .ai-icon base', () => {
    expect(css).toContain('.ai-icon')
  })

  it('light theme overrides AI control', () => {
    expect(css).toContain('html.light .ai-control')
    expect(css).toContain('html.light .ai-credit-status')
  })
})

// ─── Feature strip ────────────────────────────────────────────────────────
describe('feature indicator strip CSS', () => {
  it('defines .feature-strip', () => {
    expect(css).toContain('.feature-strip {')
  })

  it('defines .fs-label', () => {
    expect(css).toContain('.fs-label')
  })

  it('light theme overrides feature strip', () => {
    expect(css).toContain('html.light .feature-strip')
  })
})

// ─── Process panel ─────────────────────────────────────────────────────────
describe('process panel CSS', () => {
  it('defines .procs-panel', () => {
    expect(css).toContain('.procs-panel {')
  })

  it('defines .procs-bar', () => {
    expect(css).toContain('.procs-bar')
  })

  it('defines .procs-bar-title', () => {
    expect(css).toContain('.procs-bar-title')
  })

  it('light theme overrides process panel', () => {
    expect(css).toContain('html.light .procs-panel')
  })
})

// ─── Metrics strip .mm-val exhausted state ─────────────────────────────────
describe('metrics strip — exhausted state', () => {
  it('defines .mm-val.exhausted with animation', () => {
    const exhausted = css.split('.mm-val.exhausted')[1]?.split('}')[0] || ''
    expect(exhausted).toContain('animation: usagePulse')
  })

  it('exhausted uses --fl-red color', () => {
    const exhausted = css.split('.mm-val.exhausted')[1]?.split('}')[0] || ''
    expect(exhausted).toContain('--fl-red')
  })
})

// ─── Saved mix cards ───────────────────────────────────────────────────────
describe('saved mix card CSS', () => {
  it('defines .mix-card-name', () => {
    expect(css).toContain('.mix-card-name')
  })

  it('defines .mix-card-meta', () => {
    expect(css).toContain('.mix-card-meta')
  })

  it('defines .mix-btn', () => {
    expect(css).toContain('.mix-btn')
  })

  it('defines .mix-import-field', () => {
    expect(css).toContain('.mix-import-field')
  })

  it('defines .save-mix button', () => {
    expect(css).toContain('.save-mix')
  })

  it('defines .saved-msg feedback', () => {
    expect(css).toContain('.saved-msg')
  })
})

// ─── Particle canvas ──────────────────────────────────────────────────────
describe('particle canvas CSS', () => {
  it('defines #particleCanvasWrap', () => {
    expect(css).toContain('#particleCanvasWrap')
  })

  it('uses pointer-events: none', () => {
    const canvas = css.split('#particleCanvasWrap')[1]?.split('}')[0] || ''
    expect(canvas).toContain('pointer-events: none')
  })

  it('light theme reduces opacity', () => {
    expect(css).toContain('html.light #particleCanvasWrap')
  })
})

// ─── Log entry color-mix pattern ──────────────────────────────────────────
describe('log entry — color-mix pattern', () => {
  it('uses --le-color CSS variable', () => {
    expect(css).toContain('--le-color')
  })

  it('uses color-mix with --le-color for backgrounds', () => {
    expect(css).toContain('color-mix(in srgb, var(--le-color)')
  })
})

// ─── Copyright and version ────────────────────────────────────────────────
describe('CSS file metadata', () => {
  it('starts with copyright comment', () => {
    expect(css.startsWith('/* Copyright')).toBe(true)
  })

  it('contains AGPL-3.0 license reference', () => {
    expect(css).toContain('AGPL-3.0')
  })

  it('contains version reference', () => {
    expect(css).toContain('Director Suite')
  })
})
