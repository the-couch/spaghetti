const c = require('ansi-colors')

function log (...args) {
  console.log(
    c.gray(`@friendsof/roll`),
    ...args
  )
}

function clear () {
  process.stdout.write('\x1B[2J\x1B[0f')
}

module.exports = {
  log,
  clear
}
