# Request Once

> One Request to rule them all, One Request to find them.
> One Request to bring them all, and in the darkness bind them.

Maintains a pool of pending `GET` requests and returns a promise to be fulfilled when that request finishes. Essentially it will prevent your application from opening a unique socket connection for every request accessing the same resource. Useful if you're spawning a bunch of concurrent network requests that may have the same url.

### Usage

Install it:

`npm install --save request-once`

Use it:

```
// options is currently ignored
var Request = require('request-once')(options)

Request.get('https://github.com').then(function (res) {
  // do something
})
```

If you were then to make a request to the same url before the previous request has completed, the API will return a reference to the original request's Promise (bluebird) instead of requesting again

```
Request.get('https://github.com').then(function (res) {
  // handle once
})
Request.get('https://github.com').then(function (res) {
  // handle same res object
})
```

If you want to provide a function to be run only once when the request first finishes, provide this function as the second parameter. Note that
this function will be ignored if the request has already started

```
// This will only be executed once. Useful if you
// want to preprocess the response for all handlers

function first (res) {
  res.added = 'ah'
  return res
}

var url = 'http://httpbin.org/get'
Promise.all([
  Request(url, first).then(function (res) { assert.equal(res.added, 'ah') },
  Request(url, first).then(function (res) { assert.equal(res.added, 'ah') },
  Request(url, first).then(function (res) { assert.equal(res.added, 'ah') }
])
```