'use strict'

const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()

const nodups = require('./')
const uniq = require('uniq')
const _uniq = require('lodash.uniq')
const _uniqWith = require('lodash.uniqwith')
const arrayUniq = require('array-uniq')
const arrayUnique = require('array-uniq')
const uniqs = require('uniqs')
const dedupe = require('dedupe')

console.log(uniq([5, 1, 1, 2, 3, 4, 2, 3, 5, 1]))
console.log(_uniq([5, 1, 1, 2, 3, 4, 2, 3, 5, 1]))
console.log(_uniq([5, 1, 1, 2, 3, 4, 2, 3, 5, 1]))
console.log(_uniqWith([5, 1, 1, 2, 3, 4, 2, 3, 5, 1], (a, b) => a === b))
console.log(arrayUniq([5, 1, 1, 2, 3, 4, 2, 3, 5, 1]))
console.log(uniqs([5, 1, 1, 2, 3, 4, 2, 3, 5, 1]))
console.log(nodups([5, 1, 1, 2, 3, 4, 2, 3, 5, 1]))
console.log(arrayUnique([5, 1, 1, 2, 3, 4, 2, 3, 5, 1]))
console.log(dedupe([5, 1, 1, 2, 3, 4, 2, 3, 5, 1]))

suite
.add('uniq', function() {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    uniq(arr)
})
.add('lodash.uniq', function() {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    _uniq(arr)
})
.add('lodash.uniqWith', function() {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    _uniqWith(arr, (a, b) => a === b)
})
.add('arrayUniq', function() {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    arrayUniq(arr)
})
.add('arrayUnique', function() {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    arrayUnique(arr)
})
.add('uniqs', function() {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    uniqs(arr)
})
.add('dedupe', function() {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    dedupe(arr)
})
.add('nodups', function() {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    nodups(arr)
})
.add('nodups {sorted}', function () {

    var arr = [1, 1, 1, 2, 2, 3, 3, 4, 5, 5]

    nodups(arr, {sorted: true})
})
.add('nodups {inplace}', function () {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    nodups(arr, {inplace: true})
})
.add('nodups {compare ==}', function () {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    nodups(arr, {compare: '=='})
})
.add('nodups {compare ===}', function () {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    nodups(arr, {compare: '==='})
})
.add('nodups {compare fn()}', function () {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    nodups(arr, { compare: (a, b) => a === b })
})
.add('nodups {strict false}', function () {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    nodups(arr, { strict: false })
})
.add('nodups {onUnique}', function () {

    var arr = [5, 1, 1, 2, 3, 4, 2, 3, 5, 1]

    nodups(arr, { onUnique: () => {} })
})
.add('nodups {by}', function () {

    var arr = [{ a: 1, b: 2 }, { a: 1, b: 2 }, { a: 2, b: 2 }, { a: 2, b: 2 }, { a: 3, b: 2 }, { a: 5, b: 2 }]

    nodups(arr, { by: 'a' })
})
.add('nodups {skip}', function () {

    var arr = [{ a: 1, b: 2 }, { a: 1, b: 2 }, { a: 2, b: 2 }, { a: 2, b: 2 }, { a: 3, b: 2 }, { a: 5, b: 2 }]

    nodups(arr, { skip: 'b' })
})
.add('lodash.uniqWith', function() {

    var arr = [{ a: 1, b: 2 }, { a: 1, b: 2 }, { a: 2, b: 2 }, { a: 2, b: 2 }, { a: 3, b: 2 }, { a: 5, b: 2 }]

    _uniqWith(arr, function (a, b) { return a.a === b.a })
})
.on('cycle', function(event) {
  console.log(String(event.target))
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'))
})
.run({ 'async': true })
