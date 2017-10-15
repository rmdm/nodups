'use strict'

const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()

const nodup = require('../')
const uniq = require('uniq')
const uniqWith = require('lodash.uniqwith')

// console.log(nodup([1, 1, 2, 2, 3, 5]))
// console.log(uniq([1, 1, 2, 2, 3, 5]))
// console.log(uniqWith([1, 1, 2, 2, 3, 5]))

suite
.add('uniq', function() {

    var arr = [1, 1, 2, 2, 3, 5]

    uniq(arr)
})
.add('lodash.uniqWith', function() {

    var arr = [1, 1, 2, 2, 3, 5]

    uniqWith(arr, function (a, b) { return a === b })
})
.add('nodup', function() {

    var arr = [1, 1, 2, 2, 3, 5]

    nodup(arr)
})
.add('nodup {sorted}', function () {

    var arr = [1, 1, 2, 2, 3, 5]

    nodup(arr, {sorted: true})
})
.add('nodup {inplace}', function () {

    var arr = [1, 1, 2, 2, 3, 5]

    nodup(arr, {inplace: true})
})
.add('nodup {compare ==}', function () {

    var arr = [1, 1, 2, 2, 3, 5]

    nodup(arr, {compare: '=='})
})
.add('nodup {compare ===}', function () {

    var arr = [1, 1, 2, 2, 3, 5]

    nodup(arr, {compare: '==='})
})
.add('nodup {compare fn()}', function () {

    var arr = [1, 1, 2, 2, 3, 5]

    nodup(arr, {compare: (a, b) => a === b })
})
.add('nodup {strict false}', function () {

    var arr = [1, 1, 2, 2, 3, 5]

    nodup(arr, { strict: false })
})
.add('nodup {onUnique}', function () {

    var arr = [1, 1, 2, 2, 3, 5]

    nodup(arr, { onUnique: () => {} })
})
.add('nodup {pick}', function () {

    var arr = [{ a: 1, b: 2 }, { a: 1, b: 2 }, { a: 2, b: 2 }, { a: 2, b: 2 }, { a: 3, b: 2 }, { a: 5, b: 2 }]

    nodup(arr, { pick: 'a' })
})
.add('nodup {omit}', function () {

    var arr = [{ a: 1, b: 2 }, { a: 1, b: 2 }, { a: 2, b: 2 }, { a: 2, b: 2 }, { a: 3, b: 2 }, { a: 5, b: 2 }]

    nodup(arr, { omit: 'b' })
})
.add('lodash.uniqWith', function() {

    var arr = [{ a: 1, b: 2 }, { a: 1, b: 2 }, { a: 2, b: 2 }, { a: 2, b: 2 }, { a: 3, b: 2 }, { a: 5, b: 2 }]

    uniqWith(arr, function (a, b) { return a.a === b.a })
})
.on('cycle', function(event) {
  console.log(String(event.target))
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'))
})
.run({ 'async': true })
