// cycle250-coverage.test.js — C250 quality_tests coverage
// T-165: P-78 _pnameEl lazy-init pattern source + usage in paint()+clearProject()
// T-166: B-32 _notesCache TTL in notes:read + _notesCache.delete on notes:write source
// T-167: BL-25 register() rejects when instances.size>=20 + logs register_rejected event
// T-168: BL-25 integration — 20th registers, 21st rejected, re-register of existing dir works

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const rendererJs  = readFileSync(join(root, 'renderer.js'), 'utf8')
const mainJs      = readFileSync(join(root, 'main.js'), 'utf8')

// ─── T-165: P-78 — _pnameEl lazy-init ────────────────────────────────────────
describe('T-165: P-78 _pnameEl module-level cached ref', () => {
  it('_pnameEl declared at module level', () => {
    expect(rendererJs).toContain('let _pnameEl = null')
  })

  it('paint() uses lazy-init _pnameEl instead of direct $() call', () => {
    const paintBody = rendererJs.split('function paint(')[1]?.split('\nfunction ')[0] || ''
    expect(paintBody).toContain('if (!_pnameEl) _pnameEl = $(\'#pname\')')
    expect(paintBody).toContain('if (_pnameEl) _pnameEl.textContent = p.name')
    expect(paintBody).not.toContain('const pname = $(\'#pname\')')
  })

  it('clearProject uses lazy-init _pnameEl pattern', () => {
    // Find clearProject region — look for pnameEl assignment in the clear/reset section
    const clearIdx = rendererJs.indexOf("_pnameEl.textContent = '—'")
    expect(clearIdx).toBeGreaterThan(-1)
    // The guard appears before the assignment
    const guardIdx = rendererJs.lastIndexOf('if (!_pnameEl) _pnameEl = $(\'#pname\')', clearIdx)
    expect(guardIdx).toBeGreaterThan(-1)
    expect(guardIdx).toBeLessThan(clearIdx)
  })
})

// ─── T-166: B-32 — _notesCache TTL ──────────────────────────────────────────
describe('T-166: B-32 _notesCache TTL in notes:read and invalidation on write', () => {
  it('_notesCache declared as Map with 30s TTL constant', () => {
    expect(mainJs).toContain('const _notesCache = new Map()')
    expect(mainJs).toContain('const _NOTES_TTL  = 30_000')
  })

  it('notes:read checks cache before reading file', () => {
    const body = mainJs.split("'notes:read'")[1]?.split("'notes:write'")[0] || ''
    expect(body).toContain('_notesCache.get(dir)')
    expect(body).toContain('_NOTES_TTL')
    // cache hit check before statSync
    const hitIdx = body.indexOf('_notesCache.get(dir)')
    const statIdx = body.indexOf('statSync(p)')
    expect(hitIdx).toBeLessThan(statIdx)
  })

  it('notes:read stores result in cache with ts', () => {
    const body = mainJs.split("'notes:read'")[1]?.split("'notes:write'")[0] || ''
    expect(body).toContain('_notesCache.set(dir, { data, ts: Date.now() })')
  })

  it('notes:write deletes _notesCache entry to invalidate stale data', () => {
    const body = mainJs.split("'notes:write'")[1]?.split('\n})')[0] || ''
    expect(body).toContain('_notesCache.delete(dir)')
    // delete before lifecycleEvent persist
    const delIdx = body.indexOf('_notesCache.delete(dir)')
    const persistIdx = body.indexOf('persistLifecycleEvent')
    expect(delIdx).toBeLessThan(persistIdx)
  })
})

// ─── T-167: BL-25 — register() cap source ────────────────────────────────────
describe('T-167: BL-25 register() max_instances cap source', () => {
  it('register() checks instances.size >= 20 for new dirs', () => {
    const { CoordinationProtocol } = require(join(root, 'coordination-protocol.js'))
    // Source check
    const coordJs = readFileSync(join(root, 'coordination-protocol.js'), 'utf8')
    const body = coordJs.split('register(')[1]?.split('\n  }')[0] || ''
    expect(body).toContain('this.instances.size >= 20')
    expect(body).toContain('register_rejected')
    expect(body).toContain("reason: 'max_instances'")
  })

  it('register() only applies cap to new dirs (existing dir update bypasses cap)', () => {
    const coordJs = readFileSync(join(root, 'coordination-protocol.js'), 'utf8')
    const body = coordJs.split('register(')[1]?.split('\n  }')[0] || ''
    // Guard condition includes !this.instances.has(dir)
    expect(body).toContain('!this.instances.has(dir)')
  })

  it('register() logs register_rejected event with limit:20 on overflow', () => {
    const { CoordinationProtocol } = require(join(root, 'coordination-protocol.js'))
    const cp = new CoordinationProtocol()
    const alloc = { avgIntensity: 50, categoryBudgets: {}, totalWeight: 100 }
    // Fill to 20
    for (let i = 0; i < 20; i++) {
      const r = cp.register(`/dir${i}`, i + 1, alloc)
      expect(r).not.toBeNull()
    }
    expect(cp.instances.size).toBe(20)

    // 21st should be rejected
    const result = cp.register('/dir20', 21, alloc)
    expect(result).toBeNull()
    expect(cp.instances.size).toBe(20)

    // Event log should contain register_rejected
    const rejEvent = cp.events.find(e => e.type === 'register_rejected' && e.dir === '/dir20')
    expect(rejEvent).toBeDefined()
    expect(rejEvent.reason).toBe('max_instances')
    expect(rejEvent.limit).toBe(20)
  })
})

// ─── T-168: BL-25 integration — re-register existing dir bypasses cap ────────
describe('T-168: BL-25 integration — cap allows re-registration, rejects only new', () => {
  it('re-registering an existing dir does not count against cap', () => {
    const { CoordinationProtocol } = require(join(root, 'coordination-protocol.js'))
    const cp = new CoordinationProtocol()
    const alloc = { avgIntensity: 50, categoryBudgets: {}, totalWeight: 100 }
    // Fill to 20
    for (let i = 0; i < 20; i++) {
      cp.register(`/dir${i}`, i + 1, alloc)
    }
    expect(cp.instances.size).toBe(20)

    // Re-register first dir (update) — must succeed even at cap
    const updated = cp.register('/dir0', 999, { ...alloc, avgIntensity: 90 })
    expect(updated).not.toBeNull()
    expect(updated.avgIntensity).toBe(90)
    expect(cp.instances.size).toBe(20)
  })

  it('after unregistering, a new dir can register within cap', () => {
    const { CoordinationProtocol } = require(join(root, 'coordination-protocol.js'))
    const cp = new CoordinationProtocol()
    const alloc = { avgIntensity: 50, categoryBudgets: {}, totalWeight: 100 }
    for (let i = 0; i < 20; i++) cp.register(`/dir${i}`, i + 1, alloc)

    cp.unregister('/dir0')
    expect(cp.instances.size).toBe(19)

    const newInst = cp.register('/dirNew', 21, alloc)
    expect(newInst).not.toBeNull()
    expect(cp.instances.size).toBe(20)
  })
})
