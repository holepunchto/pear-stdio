'use strict'
const { Writable } = require('streamx')

let tty = null
try { tty = require('tty') } catch { tty = require('bare-tty') }

const Stdio = process.versions.bare
  ? class Stdio {
    drained = Writable.drained
    constructor () {
      const { ReadStream, WriteStream } = this.tty
      this.in = new ReadStream(0)
      this.out = new WriteStream(1)
      this.err = new WriteStream(2)
      this.rawMode = false
    }

    size () {
      const [width, height] = this.out.getWindowSize()
      return { width, height }
    }

    raw (rawMode) {
      this.rawMode = !!rawMode
      return this.in.setMode(this.rawMode ? this.tty.constants.MODE_RAW : this.tty.constants.MODE_NORMAL)
    }
  }
  : class Stdio {
    in = process.stdin
    out = process.stdout
    err = process.stderr
    rawMode = false
    drained = Writable.drained
    raw (rawMode) {
      this.rawMode = !!rawMode
      return this.in.setRawMode(this.rawMode)
    }

    size () { return { height: this.out.rows, width: this.out.columns } }
  }

module.exports = new Stdio()