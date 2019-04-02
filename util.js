const path = require('path')
const c = require('ansi-colors')

function log (...args) {
  if (typeof args[0] === 'function') {
    console.log(
      c.gray(`spaghetti`),
      ...[].concat(args[0](c))
    )
  } else {
    console.log(
      c.gray(`spaghetti`),
      ...args
    )
  }
}

function clear () {
  process.stdout.write('\x1B[2J\x1B[0f')
}

function resolve (...args) {
  return path.resolve(process.cwd(), ...args)
}

function join (...args) {
  return path.join(process.cwd(), ...args)
}

module.exports = {
  log,
  clear,
  resolve,
  join
}
