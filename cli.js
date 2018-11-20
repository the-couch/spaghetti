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
  .option('--jsx <pragma>', 'jsx pragma: --jsx preact.h (default: React.createElement)')
  .option('--map <type>', 'any source map value supported by webpack: --map cheap-module-source-map (default: source-map)')
  .option('--sass', 'use sass instead of postcss: --sass (default: false)')
  .option('--config <config>', 'config file: --config config.js (default: spaghetti.config.js)')
  .parse(process.argv)

const input = app.args[0] || null
const outDir = app.args[1] || null
const filename = (input ? path.basename(input, '.js') : null)
const watch = app.watch || false
const jsx = app.jsx || 'React.createElement'
const conf = resolve(app.config || 'spaghetti.config.js')

let config = Object.assign({
  in: input,
  outDir,
  filename,
  jsx,
  watch,
  alias: {}
}, (fs.existsSync(conf) ? require(conf) : {}))

/**
 * If provided in config file
 */
config.in = resolve(config.in)
config.outDir = resolve(config.outDir)
config.filename = config.filename || path.basename(config.in, '.js')

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
