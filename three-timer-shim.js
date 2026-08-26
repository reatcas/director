'use strict'
// Minimal THREE.Timer shim — the classic three.js build (UMD, no addons)
// omits THREE.Timer, which 3d-force-graph needs for its animation loop.
// Only update() + getDelta() are called by 3d-force-graph (confirmed by
// reading the bundle). Must load AFTER three.min.js, BEFORE 3d-force-graph.
if (window.THREE && !THREE.Timer) {
  THREE.Timer = class {
    constructor() { this._prev = 0; this._cur = performance.now(); this._delta = 0 }
    update(ts) { this._prev = this._cur; this._cur = ts !== undefined ? ts : performance.now(); this._delta = (this._cur - this._prev) / 1000; return this }
    getDelta() { return this._delta }
    getElapsed() { return this._cur / 1000 }
  }
}
