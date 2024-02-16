'use strict'
const { Writable } = require('streamx')
const tty = require('tty')

const IS_BARE = !!global.Bare

const Stdio = IS_BARE
  ? class Stdio {
    drained = Writable.drained
    constructor () {
      const { ReadStream, WriteStream } = tty
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
      return this.in.setMode(this.rawMode ? tty.constants.MODE_RAW : tty.constants.MODE_NORMAL)
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
