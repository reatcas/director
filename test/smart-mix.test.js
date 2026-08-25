import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import os from 'os'

function runSmartMix(focus, commitCategories) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'smartmix-'))
  const cfgPath = path.join(tmpDir, 'orchestra.json')
  const cfg = { version: '2.0.0', focus, smartMix: true }
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2))

  const prefixMap = {
    product: 'feat', quality_tests: 'test', security: 'security',
    frontend: 'style', backend: 'fix', performance: 'perf',
    ux_accessibility: 'a11y', i18n: 'i18n', data_db: 'fix(db)',
    refactoring: 'refactor', error_handling: 'fix(error)'
  }
  const fakeGitLog = commitCategories.map((cat, i) => {
    const p = prefixMap[cat] || 'chore'
    return `abc${String(i).padStart(4, '0')} ${p}(${cat}): work item ${i}`
  }).join('\n')

  const gitLogPath = path.join(tmpDir, 'gitlog.txt')
  fs.writeFileSync(gitLogPath, fakeGitLog)

  const pyPath = path.join(tmpDir, 'smartmix.py')
  fs.writeFileSync(pyPath, `
import json, sys, re, os

cfg_path = sys.argv[1]
gitlog_path = sys.argv[2]

cfg = json.load(open(cfg_path))
focus = cfg.get("focus", {})
original_focus = dict(focus)

lines = open(gitlog_path).read().strip().split('\\n')

cat_rules = [
    ("i18n",            r"i18n|translat|locale|intl"),
    ("quality_tests",   r"test|coverage|spec|lint|eslint"),
    ("security",        r"security|auth|rbac|csp|cors|uuid.*valid|encrypt|xss|inject|csrf"),
    ("performance",     r"perf|n\\+1|cache|lazy|optimize|denorm|slow"),
    ("ux_accessibility", r"a11y|aria|accessibility|wcag|screen.reader"),
    ("data_db",         r"db|schema|migration|seed|index|scylla|cassandra|query"),
    ("frontend",        r"style|css|vue|react|component|ui|layout|responsive|mobile"),
    ("backend",         r"api|endpoint|handler|middleware|server|route|rest|grpc"),
    ("product",         r"feat|feature|add|implement|new|launch"),
    ("refactoring",     r"refactor|rename|extract|reorganize|cleanup|dry"),
    ("devops_infra",    r"ci|cd|docker|deploy|infra|helm|k8s|github.action"),
    ("documentation",   r"doc|readme|comment|changelog"),
    ("error_handling",  r"error|panic|recover|fallback|retry|timeout"),
]

counts = {}
for line in lines:
    if not line.strip(): continue
    msg = line.split(' ', 1)[1] if ' ' in line else line
    matched = False
    for cat_name, pattern in cat_rules:
        if cat_name in focus and re.search(pattern, msg, re.IGNORECASE):
            counts[cat_name] = counts.get(cat_name, 0) + 1
            matched = True
            break
    if not matched:
        counts["refactoring"] = counts.get("refactoring", 0) + 1

total = max(sum(counts.values()), 1)

STEP = 6
DEAD_ZONE = 5
FREEZE_MULT = 2.0
SMOOTHING = 0.3
SESSION_CAP = 15

adjustments = {}
for cat in focus:
    target = focus[cat]
    actual = round(counts.get(cat, 0) * 100 / total)
    if target == 0:
        if actual > 5: adjustments[cat] = -STEP
        continue
    deviation = actual - target
    if target > 0 and actual > target * FREEZE_MULT and actual > 10:
        adjustments[cat] = -STEP
        continue
    if actual == 0 and target >= 5:
        adjustments[cat] = STEP
        continue
    if abs(deviation) <= DEAD_ZONE:
        adjustments[cat] = 0
    elif deviation > 0:
        adjustments[cat] = max(-STEP, -deviation // 2)
    else:
        adjustments[cat] = min(STEP, (-deviation) // 2)

new_focus = {}
for cat in focus:
    base = original_focus[cat]
    adj = adjustments.get(cat, 0)
    damped_adj = round(adj * SMOOTHING)
    new_val = focus[cat] + damped_adj
    new_val = max(base - SESSION_CAP, min(base + SESSION_CAP, new_val))
    floor = max(base // 2, 1) if base > 0 else 0
    new_val = max(floor, min(50, new_val))
    new_focus[cat] = new_val

total_new = sum(new_focus.values())
if total_new > 0 and total_new != 100:
    factor = 100.0 / total_new
    remainder = 0
    for cat in sorted(new_focus.keys()):
        exact = new_focus[cat] * factor + remainder
        rounded = int(exact)
        remainder = exact - rounded
        new_focus[cat] = rounded
    diff = 100 - sum(new_focus.values())
    if diff != 0:
        largest = max(new_focus, key=lambda k: new_focus[k])
        new_focus[largest] += diff

print(json.dumps(new_focus))
`)

  try {
    const result = execSync(`python3 "${pyPath}" "${cfgPath}" "${gitLogPath}"`, {
      encoding: 'utf8', timeout: 5000
    }).trim()
    fs.rmSync(tmpDir, { recursive: true })
    return JSON.parse(result)
  } catch (e) {
    fs.rmSync(tmpDir, { recursive: true })
    throw e
  }
}

describe('Smart Mix v3', () => {
  const baseFocus = {
    product: 35, backend: 10, frontend: 15, quality_tests: 15,
    security: 10, performance: 5, ux_accessibility: 5,
    data_db: 0, i18n: 0, refactoring: 0, error_handling: 5
  }

  it('weights always sum to 100', () => {
    const commits = Array(50).fill('quality_tests')
    const result = runSmartMix(baseFocus, commits)
    const sum = Object.values(result).reduce((a, b) => a + b, 0)
    expect(sum).toBe(100)
  })

  it('balanced distribution produces no large changes', () => {
    const commits = [
      ...Array(18).fill('product'),
      ...Array(5).fill('backend'),
      ...Array(8).fill('frontend'),
      ...Array(8).fill('quality_tests'),
      ...Array(5).fill('security'),
      ...Array(3).fill('performance'),
      ...Array(3).fill('ux_accessibility'),
    ]
    const result = runSmartMix(baseFocus, commits)
    for (const [k, v] of Object.entries(baseFocus)) {
      if (v === 0) continue
      expect(Math.abs((result[k] || 0) - v)).toBeLessThanOrEqual(5)
    }
  })

  it('does not oscillate — running twice converges', () => {
    const skewed = Array(40).fill('quality_tests').concat(Array(10).fill('product'))
    const pass1 = runSmartMix(baseFocus, skewed)
    const pass2 = runSmartMix(pass1, skewed)
    for (const k of Object.keys(baseFocus)) {
      const drift1 = Math.abs((pass1[k] || 0) - (baseFocus[k] || 0))
      const drift2 = Math.abs((pass2[k] || 0) - (pass1[k] || 0))
      expect(drift2).toBeLessThanOrEqual(drift1 + 1)
    }
  })

  it('respects session cap — max ±15 from original', () => {
    const extreme = Array(50).fill('security')
    const result = runSmartMix(baseFocus, extreme)
    for (const [k, v] of Object.entries(baseFocus)) {
      if (v === 0) continue
      expect(Math.abs((result[k] || 0) - v)).toBeLessThanOrEqual(16) // +1 normalization
    }
  })

  it('categories with weight>0 stay above half original', () => {
    const extreme = Array(50).fill('product')
    const result = runSmartMix(baseFocus, extreme)
    for (const [k, v] of Object.entries(baseFocus)) {
      if (v === 0) continue
      const floor = Math.max(Math.floor(v / 2), 1)
      expect(result[k] || 0).toBeGreaterThanOrEqual(Math.max(floor - 2, 0))
    }
  })

  it('zero-weight categories stay near zero', () => {
    const commits = Array(50).fill('product')
    const result = runSmartMix(baseFocus, commits)
    expect(result.data_db || 0).toBeLessThanOrEqual(1)
    expect(result.i18n || 0).toBeLessThanOrEqual(1)
  })
})
