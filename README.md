# Request Once

> One Request to rule them all, One Request to find them.
> One Request to bring them all, and in the darkness bind them.

Maintains a keyed pool of pending asynchronous requests and returns a promise to be fulfilled when that request finishes. Essentially it allows you to save resources if you have a bunch of unrelated codepaths attempting to access the same resource at once. An example use case is an application that spawns many concurrent network requests which may be accessing the same url. `request-once` allows you to optimize this without thinking about batching things so as to avoid opening additional sockets unnecessarily.

### Usage

Install it:

`npm install --save request-once`

Use it:

```
// options (optional) recognizes:
//
// {
//   clone: Boolean (default false),
//   freeze: Boolean (default false)
// }
//
// clone returns a deep copy of the result to any
// chained promises so they can manipulate them
// individually
//
// freeze recursively freezes the result, so if
// the same object is passed to multiple request
// handlers, they aren't able to step on each other's
// toes

var fn = function(url) {
  return request_promise.get(url)
}

var options = { freeze: true }

var request = require('request-once')(fn, options)

request('https://github.com').then(function (res) {
  // do something
})
```

If you were then to make a request to the same url before the previous request has completed, the API will return a reference to the original request's Promise (bluebird) instead of requesting again

```
// won't make another request to github if first request
// is still pending

request('https://github.com').then(function (res) {
  // do something else
})

request('https://github.com').then(function (res) {
  // handle same res object (or copy, if options.clone === true)
})
```

### Unfinished Business

Might add a caching option if I end up needing it, so that request results aren't immediately thrown away after the async function finishes

Add support for generators and thunks (probably already works but need to test)
