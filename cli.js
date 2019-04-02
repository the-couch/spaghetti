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
  .option('--reload', 'enable live-reloading after changes: --reload (default: false)')
  .option('--config <config>', 'config file: --config config.js (default: spaghetti.config.js)')
  .parse(process.argv)

const input = app.args[0] || null
const outDir = app.args[1] || null
const filename = (input ? path.basename(input, '.js') : null)
const watch = app.watch || false
const jsx = app.jsx || 'React.createElement'
const reload = app.reload || false
const conf = resolve(app.config || 'spaghetti.config.js')

let config = Object.assign({
  in: input,
  outDir,
  filename,
  jsx,
  watch,
  alias: {},
  reload: false
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
    .end(({ duration }) => {
      log(c => ([
        c.green(`built`),
        `in ${duration}ms`
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
    .end(({ duration, assets }) => {
      log(c => `${c.green(`built`)} in ${duration}ms\n${assets.reduce((_, asset) => {
          const size = asset.size.gzip ? asset.size.gzip + 'kb gzipped' : asset.size.raw + 'kb'
          return _ += `  > ${c.green(asset.filename)} ${size}\n`
        }, '')}
      `)
    })
    .error(err => {
      log(c => ([
        c.red(`error`),
        err ? err.message || err : ''
      ]))
    })
}
