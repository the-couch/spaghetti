#! /usr/bin/env node
'use strict'

const path = require('path')
const app = require('commander')
const compiler = require('./index.js')
const { log } = require('./util.js')

app
  .arguments('<input> <output>')
  .option('-w, --watch', 'Beep')
  .parse(process.argv)

const opts = {
  input: app.args[0],
  output: app.args[1],
  css: app.css || path.basename(app.args[1], '.js') + '.css',
  jsx: app.jsx || 'React.createElement',
  watch: app.watch
}

const bundle = compiler(opts)

if (opts.watch) {
  bundle.watch()
    .start(() => {
      log('watching')
    })
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
  log('compiling')

  bundle.build()
    .end(stats => {
      log(c => ([
        c.green(`compiled`),
        `in ${stats.duration}ms`
      ]))
    })
}
