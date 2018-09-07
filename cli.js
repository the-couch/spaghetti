#! /usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const exit = require('exit')
const app = require('commander')
const compiler = require('./index.js')
const { log, resolve, join } = require('./util.js')

app
  .arguments('<in> <outDir>')
  .option('-w, --watch', 'watch ur files')
  .option('-f, --filename', 'filename sans extension: --filename index')
  .option('--css', 'css parser: --css scss (default: postcss)')
  .option('--jsx', 'jsx pragma: --jsx preact.h (default: React.createElement)')
  .option('--config', 'config file: --config config.js (default: spaghetti.config.js)')
  .parse(process.argv)

const input = app.args[0] || null
const outDir = app.args[1] || null
const filename = app.filename || input ? path.basename(input, '.js') : null
const css = app.css ? app.css : 'postcss'
const jsx = app.jsx || 'React.createElement'
const watch = app.watch || false
const conf = resolve(app.config || 'spaghetti.config.js')

let config = Object.assign({
  in: input,
  outDir,
  filename,
  css,
  jsx,
  watch,
  alias: {}
}, (fs.existsSync(conf) ? require(conf) : {}))

/**
 * If provided in config file
 */
config.in = resolve(config.in)
config.outDir = resolve(config.outDir)

if (!config.filename) {
  log(c => ([
    c.red('bad config'),
    '- filename missing'
  ]))

  exit()
}

const bundle = compiler(config)

log('compiling')

if (config.watch) {
  bundle.watch()
    .end(stats => {
      log(c => ([
        c.green(`compiled`),
        `in ${stats.duration}ms`
      ]))
    })
    .error(err => {
      log(c => ([
        c.red(`error`),
        err ? err.message || err : ''
      ]))
    })
} else {
  bundle.build()
    .end(stats => {
      log(c => ([
        c.green(`compiled`),
        `in ${stats.duration}ms`
      ]))
    })
}
