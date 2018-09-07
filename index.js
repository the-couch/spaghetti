const fs = require('fs')
const path = require('path')
const exit = require('exit')
const c = require('ansi-colors')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const { log, resolve, join } = require('./util.js')

const userPostcssConfig = fs.existsSync(resolve('postcss.config.js'))
const userBabelConfig = fs.existsSync(resolve('.babelrc'))

module.exports = (opts = {}) => {
  const compiler = webpack({
    mode: opts.watch ? 'production' : 'development',
    target: 'web',
    performance: { hints: false },
    devtool: 'cheap-module-source-map',
    entry: resolve(opts.input),
    output: {
      path: resolve(path.dirname(opts.output)),
      filename: path.basename(opts.output)
    },
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
                require.resolve('@babel/plugin-proposal-class-properties')
              ],
              presets: [
                [require.resolve('@babel/preset-env'), {
                  targets: {
                    ie: '11'
                  }
                }],
                require.resolve('@babel/preset-react')
              ]
            }
          }
        ),
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: ExtractTextPlugin.extract([
            require.resolve('css-loader'),
            {
              loader: require.resolve('postcss-loader'),
              options: {
                plugins: [
                  require('postcss-import'),
                  require('postcss-nested'),
                  require('postcss-cssnext')({
                    warnForDuplicates: false
                  }),
                  require('postcss-discard-comments'),
                  !opts.watch && require('cssnano')
                ].filter(Boolean)
              }
            }
          ])
        }
      ].filter(Boolean)
    },
    resolve: {
      alias: {}
    },
    plugins: [
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
      new ExtractTextPlugin(opts.css)
    ].filter(Boolean)
  })

  function emit(fns, data) {
    fns && fns.map(f => f(data))
  }

  function methods (bundle) {
    let fns = {
      error: [
        e => log(c.red('compilation'), e)
      ]
    }

    emit(fns.start)

    bundle((err, stats) => {
      if (err || stats.hasErrors()) {
        return emit(fns.error, err || stats.compilation.errors)
      }

      emit(fns.end, {
        stats,
        duration: stats.endTime - stats.startTime
      })
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

  return {
    build () {
      return methods(done => compiler.run(done))
    },
    watch () {
      return methods(done => compiler.watch({}, done))
    }
  }
}
