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
.on('cycle', function(event) {
  console.log(String(event.target))
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'))
})
.run({ 'async': true })
