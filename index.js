/**
 * Maintains a promise chain for currently-pending
 * requests so you don't open up tons of sockets if
 * you make a bunch of requests to the same url
 */

/**
 * Dependencies
 */

var request = require('superagent-promise')(
  require('superagent'),
  require('bluebird')
)

/**
 * Module Exports
 */

module.exports = function (options) {
  /**
   * Currently Outstanding Requests
   */

  var pending = {}

  return function (url, first) {
    if (!pending[url]) {
      pending[url] = request.get(url)
        .end()
        .then(function (res) {
          delete pending[url]
          return res
        })
        .catch(function (err) {
          delete pending[url]
          return Promise.reject(err)
        })
        .then(function (res) {
          if (first) return first(res)
          else return res
        })
    }

    return pending[url]
  }
}
