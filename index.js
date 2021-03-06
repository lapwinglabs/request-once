/**
 * Maintains a promise chain for currently-pending
 * requests so you don't open up tons of sockets if
 * you make a bunch of requests to the same url
 */

/**
 * Dependencies
 */

var co = require('co')
var clone = require('deepcopy')
var freeze = require('deep-freeze')
var Promise = require('bluebird')

/**
 * Module Exports
 */

module.exports = function (request, options) {
  options = options || {}

  /**
   * Currently Outstanding Requests
   */

  var pending = {}

  return function (key) {
    pending[key] = pending[key] || Promise.resolve().then(function () { return co(request(key)) })
      .then(function (res) {
        var ttl = (options.ttl_hours || 0) * 60 * 60 * 1000
        ttl += (options.ttl_minutes || 0) * 60 * 1000
        ttl += (options.ttl_seconds || 0) * 1000
        ttl += (options.ttl || 0)

        if (ttl) {
          ttl > 0 && setTimeout(function () {
            delete pending[key]
          }, ttl)
        } else {
          delete pending[key]
        }
        return res
      }, function (err) {
        delete pending[key]
        throw err
      })

    var out

    if (options.clone) {
      out = pending[key].then(function (data) {
        return clone(data)
      })
    } else {
      out = pending[key]
    }

    if (options.freeze) {
      out = out.then(function (data) {
        return typeof data === 'object' ? freeze(data) : data
      })
    }

    return out
  }
}
