#! /usr/bin/env node
'use strict'

const app = require('commander')
const c = require('ansi-colors')
const logger = require('log-update')
const compiler = require('./index.js')

app
  .arguments('<input> <output>')
  .option('-w, --watch', 'Beep')
  .parse(process.argv)

const opts = {
  input: app.args[0],
  output: app.args[1],
  jsx: app.jsx || 'React.createElement',
  compress: !app.watch,
  watch: app.watch
}

const bundle = compiler(opts)

let then = Date.now()

function log (...args) {
  logger(
    c.gray(`@friendsof/roll`),
    ...args
  )
}

if (opts.watch) {
  bundle.watch()
    .start(() => {
      log('watching')
      then = Date.now()
    })
    .end(() => {
      log(
        c.green(`compiled`),
        `in ${Date.now() - then}ms`
      )
    })
} else {
  log('compiling')

  bundle.compile()
    .then(() => {
      log(
        c.green(`compiled`),
        `in ${Date.now() - then}ms`
      )
    })
}
