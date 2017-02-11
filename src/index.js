const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')

function middleware (action, request, response) {
  const end = response.end

  return done => {
    response.end = (...args) => {
      end.apply(this, args)
      done()
    }
    action(request, response, () => {
      done(null, true)
    })
  }
}

const webpackDev = (compiler, options) => {
  const action = webpackDevMiddleware(compiler, options)

  return function * dev (next) {
    const step = yield middleware(action, this.req, {
      end: content => {
        this.body = content
      },
      setHeader: (...args) => {
        this.set.apply(this, args)
      }
    })
    if (step) {
      yield * next
    }
  }
}

const webpackHot = (compiler, options) => {
  const action = webpackHotMiddleware(compiler, options)

  return function * hot (next) {
    const step = yield middleware(action, this.req, this.res)
    if (step) {
      yield * next
    }
  }
}

module.exports = {
  webpackDev,
  webpackHot
}
