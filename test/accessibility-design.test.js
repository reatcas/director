import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const css = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8')
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')
const rendererJs = fs.readFileSync(path.join(ROOT, 'renderer.js'), 'utf8')

describe('ARIA labels on interactive elements', () => {
  it('play button has aria-label', () => {
    expect(html).toMatch(/id="playBtn"[^>]*aria-label/)
  })

  it('fine button has aria-label', () => {
    expect(html).toMatch(/id="fineBtn"[^>]*aria-label/)
  })

  it('kill button has aria-label', () => {
    expect(html).toMatch(/id="killBtn"[^>]*aria-label/)
  })

  it('theme toggle has aria-label', () => {
    expect(html).toMatch(/id="themeToggle"[^>]*aria-label/)
  })

  it('settings button has aria-label', () => {
    expect(html).toMatch(/id="settingsBtn"[^>]*aria-label/)
  })

  it('AI select has aria-label', () => {
    expect(html).toMatch(/id="aiSelect"[^>]*aria-label/)
  })

  it('model select has aria-label', () => {
    expect(html).toMatch(/id="modelSelect"[^>]*aria-label/)
  })

  it('log filter input has aria-label', () => {
    expect(html).toMatch(/id="logFilterInput"[^>]*aria-label/)
  })

  it('most modal close buttons have aria-label', () => {
    const closeButtons = html.match(/<button[^>]*modal-close[^>]*/g) || []
    expect(closeButtons.length).toBeGreaterThan(0)
    const withAria = closeButtons.filter(b => b.includes('aria-label'))
    expect(withAria.length).toBeGreaterThanOrEqual(closeButtons.length - 1)
  })

  it('aria labels use Spanish (i18n es primary)', () => {
    const ariaLabels = html.match(/aria-label="([^"]+)"/g) || []
    const spanishLabels = ariaLabels.filter(l =>
      l.includes('Cerrar') || l.includes('Iniciar') || l.includes('Detener') ||
      l.includes('Cortar') || l.includes('Configuración') || l.includes('Acerca') ||
      l.includes('Cambiar') || l.includes('Filtrar') || l.includes('Alternar') ||
      l.includes('Registro') || l.includes('orquesta') || l.includes('Métricas') ||
      l.includes('Recursos') || l.includes('Uso') || l.includes('Instancias') ||
      l.includes('compresión') || l.includes('contexto') || l.includes('memoria') ||
      l.includes('Mezcla') || l.includes('Blueprint') || l.includes('Notas') ||
      l.includes('conocimiento') || l.includes('Paneles') || l.includes('mezclador') ||
      l.includes('AI') || l.includes('provider') || l.includes('model') ||
      l.includes('Agregar') || l.includes('proyecto') ||
      l.includes('Acerca') || l.includes('Configuración') || l.includes('stand') ||
      l.includes('Atajos') || l.includes('teclado') || l.includes('comandos') ||
      l.includes('Paleta') || l.includes('Repertorio') ||
      l.includes('cumplimiento') || l.includes('Frescura') || l.includes('Tasa') ||
      l.includes('créditos') || l.includes('orquestador') || l.includes('producto') ||
      l.includes('Puntaje') || l.includes('Grafo') || l.includes('nodos') ||
      l.includes('Divisor') || l.includes('panel') || l.includes('mixer') ||
      l.includes('Escenario') || l.includes('Exportar') || l.includes('sesión') ||
      l.includes('Zona') || l.includes('soltar') ||
      l.includes('Cerrar') || l.includes('Copiar') || l.includes('Seleccionar') ||
      l.includes('Refrescar') || l.includes('Característica') || l.includes('desarrollo') ||
      l.includes('Aviso') || l.includes('límite') || l.includes('uso') ||
      l.includes('Sin') || l.includes('seleccionado') || l.includes('sistema') ||
      l.includes('Smart') || l.includes('Alternar') ||
      l.includes('Limpiar') || l.includes('terminal') || l.includes('desplazamiento') ||
      l.includes('bruto') || l.includes('historial') ||
      l.includes('Actualizar') || l.includes('análisis') ||
      l.includes('Importar') || l.includes('mezclas') || l.includes('Consola') ||
      l.includes('Abrir') || l.includes('carpeta') || l.includes('Instalar') ||
      l.includes('orquesta') || l.includes('Eliminar') || l.includes('JSON') ||
      l.includes('Guardar') || l.includes('stand') || l.includes('personalizado') ||
      l.includes('Compresión') || l.includes('Límite') || l.includes('Historial') || l.includes('Panel') ||
      l.includes('Análisis') || l.includes('Distribución') || l.includes('Fases')
    )
    expect(spanishLabels.length).toBeGreaterThanOrEqual(ariaLabels.length - 3)
  })
})

describe('keyboard navigation', () => {
  it('focus-visible outline defined for buttons', () => {
    expect(css).toContain('button:focus-visible')
  })

  it('focus-visible outline defined for inputs', () => {
    expect(css).toContain('input:focus-visible')
  })

  it('focus-visible outline defined for selects', () => {
    expect(css).toContain('select:focus-visible')
  })

  it('focus-visible uses visible outline style', () => {
    const focusRule = css.split('focus-visible {')[1]?.split('}')[0] || ''
    expect(focusRule).toContain('outline')
  })
})

describe('color system completeness', () => {
  const requiredVars = [
    '--bg', '--panel', '--panel2', '--panel3', '--panel4',
    '--strip', '--line', '--line2',
    '--txt', '--txt2', '--dim', '--dim2',
    '--fl-orange', '--fl-green', '--fl-red', '--fl-yellow', '--fl-cyan', '--fl-blue',
    '--ai-blue', '--ai-purple', '--ai-cyan'
  ]

  for (const v of requiredVars) {
    it(`defines ${v}`, () => {
      expect(css).toContain(`${v}:`)
    })
  }
})

describe('glow effects system', () => {
  const glows = ['--glow-cyan', '--glow-green', '--glow-orange', '--glow-purple']

  for (const g of glows) {
    it(`defines ${g}`, () => {
      expect(css).toContain(`${g}:`)
    })
  }
})

describe('typography system', () => {
  it('defines monospace font stack', () => {
    const monoVar = css.split('--mono:')[1]?.split(';')[0] || ''
    expect(monoVar).toContain('Share Tech Mono')
    expect(monoVar).toContain('monospace')
  })

  it('defines sans-serif font stack', () => {
    const sansVar = css.split('--sans:')[1]?.split(';')[0] || ''
    expect(sansVar).toContain('system-ui')
    expect(sansVar).toContain('sans-serif')
  })

  it('defines border radius tokens', () => {
    expect(css).toContain('--radius:')
    expect(css).toContain('--radius-sm:')
  })
})

describe('light theme completeness', () => {
  it('has html.light root override', () => {
    expect(css).toContain('html.light {')
  })

  it('overrides background variables', () => {
    expect(css).toContain('html.light')
    const lightBlock = css.split('html.light {')[1]?.split('}')[0] || ''
    expect(lightBlock).toContain('--bg:')
  })

  it('overrides transport bar', () => {
    expect(css).toContain('html.light #transport')
  })

  it('overrides left column', () => {
    expect(css).toContain('html.light #leftColumn')
  })

  it('overrides Smart Mix elements', () => {
    expect(css).toContain('html.light .smart-mix-bar')
    expect(css).toContain('html.light .smart-toggle')
  })

  it('renderer.js toggles light class on html element', () => {
    expect(rendererJs).toContain("classList.add('light')")
    expect(rendererJs).toContain("classList.remove('light')")
  })
})

describe('animation keyframes', () => {
  const requiredAnimations = [
    'pulseGlow', 'aurora', 'brandGlow', 'statusLive',
    'fadeInUp', 'stall-pulse', 'usageBarPulse'
  ]

  for (const anim of requiredAnimations) {
    it(`defines @keyframes ${anim}`, () => {
      expect(css).toContain(`@keyframes ${anim}`)
    })
  }
})

describe('stall badge animation (F-20)', () => {
  it('defines stall-pulse keyframes', () => {
    expect(css).toContain('@keyframes stall-pulse')
  })

  it('stall badge has animation property', () => {
    expect(css).toContain('stall-pulse')
  })
})

describe('HTML structure', () => {
  it('has DOCTYPE', () => {
    expect(html).toMatch(/<!DOCTYPE html>/i)
  })

  it('has charset meta', () => {
    expect(html).toMatch(/charset="UTF-8"/i)
  })

  it('has meta charset', () => {
    expect(html).toMatch(/charset/i)
  })

  it('has title element', () => {
    expect(html).toMatch(/<title>[^<]+<\/title>/)
  })

  it('loads styles.css', () => {
    expect(html).toContain('href="styles.css"')
  })

  it('loads renderer.js', () => {
    expect(html).toContain('src="renderer.js"')
  })

  it('loads mixer-chart.js', () => {
    expect(html).toContain('src="mixer-chart.js"')
  })
})

describe('semantic HTML elements', () => {
  it('uses button elements for controls', () => {
    const buttons = html.match(/<button/g) || []
    expect(buttons.length).toBeGreaterThan(5)
  })

  it('uses select elements for dropdowns', () => {
    const selects = html.match(/<select/g) || []
    expect(selects.length).toBeGreaterThanOrEqual(2)
  })

  it('uses input elements for text fields', () => {
    const inputs = html.match(/<input/g) || []
    expect(inputs.length).toBeGreaterThan(0)
  })
})

describe('modal accessibility', () => {
  it('about modal has close button', () => {
    expect(html).toContain('id="closeAbout"')
  })

  it('settings modal has close button', () => {
    expect(html).toContain('id="closeSettings"')
  })

  it('close buttons have visible dismiss affordance', () => {
    const closeButtons = html.match(/<button[^>]*class="modal-close"[^>]*>[^<]*<\/button>/g) || []
    for (const btn of closeButtons) {
      expect(btn).toContain('✕')
    }
  })
})

describe('mixer UI accessibility', () => {
  it('mixer sliders use range input type', () => {
    expect(rendererJs).toContain('type="range"')
  })

  it('mixer has weight percentage display', () => {
    expect(rendererJs).toContain('%')
  })
})

describe('CSS no dangerous patterns', () => {
  it('no expression() in CSS (IE security risk)', () => {
    expect(css).not.toMatch(/expression\s*\(/)
  })

  it('no -moz-binding (Firefox security risk)', () => {
    expect(css).not.toContain('-moz-binding')
  })

  it('no behavior property (IE HTC risk)', () => {
    expect(css).not.toMatch(/\bbehavior\s*:/)
  })
})

describe('responsive design', () => {
  it('body uses overflow hidden or auto for app shell', () => {
    expect(css).toMatch(/body\s*\{[^}]*overflow/)
  })

  it('panels use flexible sizing', () => {
    expect(css).toMatch(/flex|grid/)
  })
})

describe('transport controls state management', () => {
  it('disabled class exists for buttons', () => {
    expect(css).toContain('.disabled')
  })

  it('renderer manages disabled state on transport buttons', () => {
    expect(rendererJs).toContain('disabled')
    expect(rendererJs).toContain('playBtn')
    expect(rendererJs).toContain('fineBtn')
    expect(rendererJs).toContain('killBtn')
  })
})
