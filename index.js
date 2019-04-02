const fs = require('fs')
const path = require('path')
const exit = require('exit')
const c = require('ansi-colors')
const webpack = require('webpack')
const ExtractCSS = require('mini-css-extract-plugin')
const onExit = require('exit-hook')
const gzip = require('gzip-size')

const { log, resolve, join } = require('./util.js')

const userBabelConfig = fs.existsSync(resolve('.babelrc'))

const reloadScript = `
  (function (global) {
    try {
      const socketio = document.createElement('script')
      socketio.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.1/socket.io.slim.js'
      socketio.onload = function init () {
        var disconnected = false
        var socket = io('https://localhost:3001', {
          reconnectionAttempts: 3
        })
        socket.on('connect', () => console.log('@thecouch/spaghetti connected'))
        socket.on('refresh', () => {
          global.location.reload()
        })
        socket.on('disconnect', () => {
          disconnected = true
        })
        socket.on('reconnect_failed', e => {
          if (disconnected) return
          console.error("@thecouch/spaghetti - connection to the update server failed")
        })
      }
      document.head.appendChild(socketio)
    } catch (e) {}
  })(this);
`

module.exports = (config = {}) => {
  let server
  let socket

  if (config.reload) {
    server = require('http').createServer((req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/plain'
      })
      res.write('@slater/cli successfully connected')
      res.end()
    }).listen(3001)

    socket = require('socket.io')(server, {
      serveClient: false
    })
  }

  const output = Object.assign({
    path: config.outDir,
    filename: config.filename + '.js'
  }, config.output || {})

  const compiler = webpack({
    mode: config.watch ? 'development' : 'production',
    target: config.target || 'web',
    node: config.node || {},
    externals: config.externals || [],
    performance: { hints: false },
    devtool: config.map || 'cheap-module-source-map',
    entry: resolve(config.in),
    output,
    module: {
      rules: [
        Object.assign(
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: require.resolve('babel-loader')
          },
          userBabelConfig ? {} : {
            options: {
              babelrc: false,
              plugins: [
                require.resolve('babel-plugin-lodash'),
                require.resolve('@babel/plugin-syntax-object-rest-spread'),
                require.resolve('@babel/plugin-proposal-class-properties'),
                require.resolve('fast-async')
              ],
              presets: [
                require.resolve('@babel/preset-env'),
                '@babel/preset-react'
              ]
            }
          }
        ),
        {
          test: /\.(sa|sc|c)ss$/,
          exclude: /node_modules/,
          use: [
            ExtractCSS.loader,
            require.resolve('css-loader'),
            config.sass ? {
              loader: require.resolve('sass-loader'),
              options: {
                implementation: require('sass')
              }
            } : {
              loader: require.resolve('postcss-loader'),
              options: {
                plugins: [
                  require('postcss-import'),
                  require('postcss-nested'),
                  require('postcss-cssnext')({
                    warnForDuplicates: false
                  }),
                  require('postcss-discard-comments'),
                  !config.watch && require('cssnano')
                ].filter(Boolean)
              }
            }
          ]
        }
      ].filter(Boolean)
    },
    resolve: {
      alias: config.alias || {}
    },
    plugins: [
      new webpack.BannerPlugin({
        banner: config.reload ? (
          config.banner ? (
            reloadScript + config.banner
          ) : reloadScript
        ) : config.banner || '',
        raw: true,
        entryOnly: true,
        exclude: /\.(sa|sc|c)ss$/
      }),
      // new webpack.optimize.OccurrenceOrderPlugin(),
      // new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
      new ExtractCSS({
        filename: '[name].css',
        sourceMap: false
      })
    ].filter(Boolean).concat(config.plugins || [])
  })

  function emit(fns, data) {
    fns && fns.map(f => f(data))
  }

  function methods (bundle) {
    let fns = {}

    emit(fns.start)

    bundle((err, stats) => {
      if (err || stats.hasErrors()) {
        return emit(fns.error, err || stats.compilation.errors)
      }

      const assets = Object.keys(stats.compilation.assets).reduce((_, filename) => {
        const asset = stats.compilation.assets[filename]
        const size = parseFloat((asset.size() / 1024).toFixed(2))
        const s = {
          filename,
          size: {
            raw: size
          }
        }

        if (!/\.map$/.test(filename) && !config.watch) {
          const code = fs.readFileSync(
            path.resolve(output.path, filename)
          ).toString('utf8')

          s.size.gzip = parseFloat((gzip.sync(code) / 1024).toFixed(2), 10)
        }

        return _.concat(s)
      }, []).sort((a, b) => {
        if (a.filename < b.filename) return -1
        if (a.filename > b.filename) return 1
        return 0
      })

      emit(fns.end, {
        stats,
        assets,
        duration: stats.endTime - stats.startTime
      })

      socket && socket.emit('refresh')
    })

    return {
      start (cb) {
        fns.start = (fns.start || []).concat(cb)
        return this
      },
      end (cb) {
        fns.end = (fns.end || []).concat(cb)
        return this
      },
      error (cb) {
        fns.error = (fns.error || []).concat(cb)
        return this
      }
    }
  }

  onExit(() => {
    server && server.close()
  })

  return {
    build () {
      return methods(done => compiler.run(done))
    },
    watch () {
      return methods(done => compiler.watch({}, done))
    }
  }
}
