/* global describe it beforeEach */

'use strict'

/**
 * Test Dependencies
 */

var assert = require('assert')
var Promise = require('bluebird')
var superagent = require('superagent-promise')(
  require('superagent'),
  Promise
)

/**
 * Unit Under Test
 */

var Request = require('..')

/**
 * Tests
 */

describe('requesting a pending url', function () {
  this.timeout(5000)

  var request
  var count
  var promiseTask = function (url) {
    return superagent.get(url)
      .end()
      .then(function (res) {
        count++
        return res.body
      })
  }

  beforeEach(function (next) {
    count = 0
    request = Request(promiseTask)
    next()
  })

  it('should run the task only once if pending', function (next) {
    var url = 'http://httpbin.org/get'
    Promise.all([
      request(url).then(function () {}),
      request(url).then(function () {}),
      request(url).then(function () {})
    ]).then(function (results) {
      assert.equal(1, count)
      next()
    })
  })

  it('should execute all attached promise chains in order', function (next) {
    var one = false
    var two = false
    var three = false
    var order = 0
    var url = 'http://httpbin.org/get'
    Promise.all([
      request(url).then(function (r) { one = true; assert.equal(0, order++) }),
      request(url).then(function (r) { two = true; assert.equal(1, order++) }),
      request(url).then(function (r) { three = true; assert.equal(2, order++) })
    ]).then(function (results) {
      assert.equal(results.length, 3)
      assert.ok(one)
      assert.ok(two)
      assert.ok(three)
      next()
    })
  })

  it('should return the same object by default', function (next) {
    var url = 'http://httpbin.org/get'
    Promise.all([
      request(url),
      request(url),
      request(url)
    ]).then(function (results) {
      assert.equal(results[0], results[1])
      assert.equal(results[0], results[2])

      results[0].addedToAll = 'check'
      assert.equal(results[0].addedToAll, results[1].addedToAll)
      assert.equal(results[0].addedToAll, results[2].addedToAll)
      next()
    })
  })

  it('should return copies of object if options.clone === true', function (next) {
    request = Request(promiseTask, { clone: true })
    var url = 'http://httpbin.org/get'
    Promise.all([
      request(url),
      request(url),
      request(url)
    ]).then(function (results) {
      assert.deepEqual(results[0], results[1])
      assert.deepEqual(results[0], results[2])

      results[0].addedToAll = 'check'
      assert.notEqual(results[0].addedToAll, results[1].addedToAll)
      assert.notEqual(results[0].addedToAll, results[2].addedToAll)
      next()
    })
  })

  it('should return frozen objects if options.freeze === true', function (next) {
    request = Request(promiseTask, { freeze: true })
    var url = 'http://httpbin.org/get'
    Promise.all([
      request(url),
      request(url),
      request(url)
    ]).then(function (results) {
      assert.throws(function () {
        results[0].url = 'nope.'
      })
      next()
    })
  })

  it('should clear the request after failure', function (next) {
    var url = 'http://httpbin.org/status/418'
    var p1 = request(url)
    p1.catch(function (err) {
      assert.ok(err)
      var p2 = request(url)
      p2.catch(function (err) {
        assert.ok(err)
        assert.ok(p1 !== p2)
        next()
      })
    })
  })
})
