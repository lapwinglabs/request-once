/* global describe it */

/**
 * Test Dependencies
 */

var assert = require('assert')
var Promise = require('bluebird')

/**
 * Unit Under Test
 */

var Request = require('..')()

/**
 * Tests
 */

describe('requesting a pending url', function () {
  this.timeout(5000)

  it('should only execute `first` once', function (next) {
    var count = 0
    function first (res) {
      count++
      return res
    }

    var url = 'http://httpbin.org/get'
    Promise.all([
      Request(url, first),
      Request(url, first),
      Request(url, first)
    ]).then(function (results) {
      assert.equal(count, 1)
      next()
    })
  })

  it('should execute all attached promise chains', function (next) {
    var one = false
    var two = false
    var three = false

    var url = 'http://httpbin.org/get'
    Promise.all([
      Request(url).then(function (r) { one = true }),
      Request(url).then(function (r) { two = true }),
      Request(url).then(function (r) { three = true })
    ]).then(function (results) {
      assert.ok(one)
      assert.ok(two)
      assert.ok(three)
      next()
    })
  })

  it('should execute `first` and then all attached promise chains', function (next) {
    var one = false
    var two = false
    var three = false
    var count = 0
    function first (res) {
      count++
      return res
    }

    var url = 'http://httpbin.org/get'
    Promise.all([
      Request(url, first).then(function (r) { one = true }),
      Request(url, first).then(function (r) { two = true }),
      Request(url, first).then(function (r) { three = true })
    ]).then(function (results) {
      assert.ok(one)
      assert.ok(two)
      assert.ok(three)
      assert.equal(count, 1)
      next()
    })
  })

  it('should ignore subsequent `first` functions', function (next) {
    var count = 0
    function first (res) {
      count++
      return res
    }
    function second (res) {
      throw new Error('should not be called')
    }

    var url = 'http://httpbin.org/get'
    Promise.all([
      Request(url, first),
      Request(url, second),
      Request(url)
    ]).then(function (results) {
      assert.equal(count, 1)
      next()
    })
  })

  it('should return the same response object to all', function (next) {
    var url = 'http://httpbin.org/get'
    Promise.all([
      Request(url),
      Request(url),
      Request(url)
    ]).then(function (results) {
      assert.equal(results[0], results[1])
      assert.equal(results[0], results[2])

      results[0].addedToAll = 'check'
      assert.equal(results[0].addedToAll, results[1].addedToAll)
      assert.equal(results[0].addedToAll, results[2].addedToAll)
      next()
    })
  })

  it('should clear the request after failure', function (next) {
    var url = 'http://httpbin.org/status/418'
    var p1 = Request(url)
    p1.catch(function (err) {
      assert.ok(err)
      var p2 = Request(url)
      p2.catch(function (err) {
        assert.ok(err)
        assert.ok(p1 !== p2)
        next()
      })
    })
  })
})
