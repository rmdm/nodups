'use strict'

import assert from 'assert-match'
import { custom } from 'assert-match/matchers'
import nodups from '../src/nodups'

describe('readme', function () {

    it('basic usage', function () {
        const array = [ 1, { a: 5 }, 2, { a: 5 },  1 ]
        const result = nodups(array)
        assert.deepStrictEqual(result, [ 1, { a: 5 }, 2 ])
        assert.notEqual(result, array)
    })

    it('"inplace" option example', function () {
        const array = [ 1, { a: 5 }, 2, { a: 5 },  1 ]
        const result = nodups(array, { inplace: true })
        assert.deepStrictEqual(result, [ 1, { a: 5 }, 2 ])
        assert.equal(result, array)
    })

    it('SameValueZero NaN example', function () {
        const result = nodups([ NaN, 0, NaN, NaN ])
        assert.deepStrictEqual(result, [ custom(isNaN), 0 ])
    })

    it('"compare" fn() option', function () {
        const result = nodups([ 1, 5, 7, 14, 19, 33, 36 ], { compare: (a, b) => ~~(a/10) === ~~(b/10) })
        assert.deepStrictEqual(result, [ 1, 14, 33 ])
    })

    it('"compare" === option', function () {
        const obj = { a: 1 }
        const result = nodups([ obj, { a: 1 }, obj, { a: 1 }, obj ], { compare: '===' })
        assert.deepStrictEqual(result, [ obj, { a: 1 }, { a: 1 } ])
    })

    it('"compare" == option', function () {
        const result = nodups([ 0, '', false, [] ], { compare: '==' })
        assert.deepStrictEqual(result, [ 0 ])
    })

    it('"strict" false option', function () {
        const result = nodups([ { a: 1 }, { a: '1' } ], { strict: false })
        assert.deepStrictEqual(result, [ { a: 1 } ])
    })

    it('difference between "compare" == and "strict" false example', function () {
        const result1 = nodups([ 0, '', false, NaN, NaN, { a: 1 }, { a: '1' }, { a: '1' } ], { strict: false })
        assert.deepStrictEqual(result1, [ 0, custom(isNaN), { a: 1 } ])

        const result2 = nodups([ 0, '', false, NaN, NaN, { a: 1 }, { a: '1' }, { a: '1' } ], { compare: '==' })
        assert.deepStrictEqual(result2, [ 0, custom(isNaN), custom(isNaN), { a: 1 }, { a: '1' }, { a: '1' } ])
    })

    it('"sorted" true example', function () {
        const result = nodups([ 1, 1, 1, 3, 3, 4, 5 ], { sorted: true })
        assert.deepStrictEqual(result, [ 1, 3, 4, 5 ])
    })

    it('"sorted" true misuse example', function () {
        const result = nodups([ 1, 3, 1, 1, 3, 4, 5 ], { sorted: true })
        assert.deepStrictEqual(result, [ 1, 3, 1, 3, 4, 5 ])
    })

    it('"by" example', function () {
        const result = nodups([
            { a: 1, b: 3 },
            { a: 2, b: 4 },
            { a: 1, b: 5 },
        ], { by: [ 'a' ] })
        assert.deepStrictEqual(result, [
            { a: 1, b: 3 },
            { a: 2, b: 4 },
        ])
    })

    it('"skip" example', function () {
        const result = nodups([
            { a: 1, b: 3 },
            { a: 2, b: 4 },
            { a: 1, b: 5 },
        ], { skip: [ 'b' ] })
        assert.deepStrictEqual(result, [
            { a: 1, b: 3 },
            { a: 2, b: 4 },
        ])
    })

    it('"by" and "skip" simultaneous example', function () {
        const result = nodups([
            { a: 1, b: 3 },
            { a: 2, b: 4 },
            { a: 1, b: 5 },
        ], { by: [ 'a' ], skip: [ 'a' ] })
        assert.deepStrictEqual(result, [
            { a: 1, b: 3 },
            { a: 2, b: 4 },
        ])
    })

    it('"by" paths example', function () {
        const result = nodups([
            { a: { b: 1, c: 2 }, d: 7 },
            { a: { b: 5, c: 4 }, d: 8 },
            { a: { b: 1, c: 2 }, d: 9 },
        ], { by: [ 'a.b', [ 'a', 'c' ] ] })
        assert.deepStrictEqual(result, [
            { a: { b: 1, c: 2 }, d: 7 },
            { a: { b: 5, c: 4 }, d: 8 },
        ])
    })

    it('"onUnique" example', function () {
        const result = nodups([
            { a: 1 },
            { a: 2 },
            { a: 1 },
        ], { onUnique: (unique, duplicates) => unique.dups = duplicates.length })
        assert.deepStrictEqual(result, [
            { a: 1, dups: 1 },
            { a: 2, dups: 0 },
        ])
    })

    it('"onUnique" mapping example', function () {
        const result = nodups([ 1, 3, 2, 3 ], { onUnique: (uniq, dups, i, uniqs) => uniqs[i] = uniq * 2 })
        assert.deepStrictEqual(result, [ 2, 6, 4 ])
    })
})
