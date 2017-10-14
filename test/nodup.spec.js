'use strict'

import assert from 'assert-match'
import { custom } from 'assert-match/matchers'
import nodup from '../src/nodup'

describe('nodup', function () {

    it('returns empty array if nothing is passed', function () {

        const result = nodup()

        assert.deepStrictEqual(result, [])
    })

    it('returns empty array if not an array is passed', function () {

        const result = nodup('A string')

        assert.deepStrictEqual(result, [])
    })

    it('returns copy of the passed array if it has no dups', function () {

        const array = [ 1, 2, 3, 4, 5 ]

        const result = nodup(array)

        assert.deepStrictEqual(result, [ 1, 2, 3, 4, 5 ])
        assert.notEqual(result, array)
    })

    it('returns array of unique values of the passed array in the order of appearance', function () {

        const array = [ 1, 4, 2, 5, 3, 4, 5, 1 ]

        const result = nodup(array)

        assert.deepStrictEqual(result, [ 1, 4, 2, 5, 3])
    })

    it('returns array of unique values of the passed array of objects', function () {

        const array = [
            { a: 1 },
            { a: 3 },
            { a: 1 },
            { a: 2 },
            { a: 3 },
        ]

        const result = nodup(array)

        assert.deepStrictEqual(result, [
            { a: 1 },
            { a: 3 },
            { a: 2 },
        ])
    })

    it('compares primitive values of the elements with strict equals', function () {

        const array = [
            { a: 1 },
            { a: '1' },
        ]

        const result = nodup(array)

        assert.deepStrictEqual(result, [
            { a: 1 },
            { a: '1' },
        ])
    })

    it('handles elements with circular refs', function () {

        const a = { v: 5 }
        a.ref = a

        const b = { v: 5 }
        b.ref = b

        const c = { v: 10 }
        c.ref = c

        const d = { v: 5 }
        d.ref = {}

        const array = [ a, b, c, d ]

        const result = nodup(array)

        assert.deepStrictEqual(result, [ a, c, d ])
    })

    it('handles structs with less trivial circular refs', function () {

            const a1 = {}
            a1.ref = a1

            const b1 = {}
            b1.ref = b1

            const a = {
                ref: a1,
            }

            const b = {
                ref: {
                    ref: b1,
                },
            }

            const array = [ a, b ]

            const result = nodup(array)

            assert.deepStrictEqual(result, [ a ])
    })

    it('handles structs with several refs to the same object', function () {

        const a1 = { v: 5 }
        const a2 = { v: 10 }

        const a = {
            ref1: a1,
            ref2: a2,
            ref3: a1,
        }

        const b1 = { v: 5 }
        const b2 = { v: 10 }

        const b = {
            ref1: b1,
            ref2: b2,
            ref3: b2, // b2 - the only diff
        }

        const array = [ a, b ]

        const result = nodup(array)

        assert.deepStrictEqual(result, [ a, b ])
    })

    it('returns unique array of mixed values', function () {

        const array = [
            { a: 1 },
            4,
            { a: [ 1 ] },
            3,
            { a: [ { a: 1, b: 5 } ]},
            { a: [ { a: 1, b: 7 } ]},
            4,
            { a: [ { a: 1, b: 5 } ]},
            { a: [ { a: 1, b: 5, c: 10 } ]},
            5,
            '5',
            false,
            1,
            true,
            '',
            null,
            undefined,
            0,
            NaN,
            NaN,
        ]

        const result = nodup(array)

        assert.deepStrictEqual(result, [
            { a: 1 },
            4,
            { a: [ 1 ] },
            3,
            { a: [ { a: 1, b: 5 } ]},
            { a: [ { a: 1, b: 7 } ]},
            { a: [ { a: 1, b: 5, c: 10 } ]},
            5,
            '5',
            false,
            1,
            true,
            '',
            null,
            undefined,
            0,
            custom(isNaN),
        ])
    })

    it('compares only by own enumerable object props', function () {

        const a = Object.create({ v0: 0 }, {
            v1: { enumerable: true, value: 1 },
            v2: { enumerable: false, value: 10 }
        })

        const b = { v1: 1 }

        const c = Object.create({}, {
            v1: { enumerable: true, value: 1 },
            v2: { enumerable: false, value: 100 }
        })

        const d = Object.create({}, {
            v1: { enumerable: true, value: 100 },
            v2: { enumerable: false, value: 1 }
        })

        const e = Object.create({ v1: 1 }, {
            v2: { enumerable: true, value: 1 }
        })

        const f = Object.create({}, {
            v1: { enumerable: true, value: 1 },
            v2: { enumerable: true, value: 100 }
        })

        const array = [ a, b, c, d, e, f ]

        const result = nodup(array)

        assert.deepStrictEqual(result, [ a, d, e, f ])
    })

    context('"inplace" option', function () {

        it('returns passed array if it has no dups', function () {

            const array = [ 1, 2, 3, 4, 5 ]

            const result = nodup(array, { inplace: true })

            assert.deepStrictEqual(result, [ 1, 2, 3, 4, 5 ])
            assert.equal(result, array)
        })

        it('returns passed array with dups removed', function () {

            const array = [ 1, 4, 2, 5, 3, 4, 5, 1 ]

            const result = nodup(array, { inplace: true })

            assert.deepStrictEqual(result, [ 1, 4, 2, 5, 3 ])
            assert.equal(result, array)
        })
    })

    context('"sorted" option', function () {

        it('returns sorted array with dups removed', function () {

            const array = [ 1, 1, 2, 3, 4, 4, 5, 5, 5 ]

            const result = nodup(array, { sorted: true })

            assert.deepStrictEqual(result, [ 1, 2, 3, 4, 5 ])
        })

        it('returns not sorted array with not all dups removed', function () {

            const array = [ 1, 1, 4, 2, 3, 4, 5, 5, 5 ]

            const result = nodup(array, { sorted: true })

            assert.deepStrictEqual(result, [ 1, 4, 2, 3, 4, 5 ])
        })
    })

    context('"strict" option set to false', function () {

        it('compares primitive values of the elements with not strict equals', function () {

            const array = [
                { a: 1 },
                { a: '1' },
            ]

            const result = nodup(array, { strict: false })

            assert.deepStrictEqual(result, [
                { a: 1 },
            ])
        })

        it('returns not strict unique array of mixed values', function () {

            const array = [
                { a: 1 },
                4,
                { a: [ 1 ] },
                3,
                { a: [ { a: 1, b: 5 } ]},
                { a: [ { a: 1, b: 7 } ]},
                4,
                { a: [ { a: 1, b: 5 } ]},
                { a: [ { a: 1, b: 5, c: 10 } ]},
                5,
                '5',
                false,
                1,
                true,
                '',
                null,
                undefined,
                0,
                NaN,
                NaN,
            ]

            const result = nodup(array, { strict: false })

            assert.deepStrictEqual(result, [
                { a: 1 },
                4,
                { a: [ 1 ] },
                3,
                { a: [ { a: 1, b: 5 } ]},
                { a: [ { a: 1, b: 7 } ]},
                { a: [ { a: 1, b: 5, c: 10 } ]},
                5,
                false,
                1,
                null,
                custom(isNaN),
            ])
        })
    })

    context('"compare" option', function () {

        it('compares by value strictly', function () {

            const array = [
                { a: 1 },
                { a: 1 },
                1,
                2,
                1,
                '1',
            ]

            const result = nodup(array, { compare: '===' })

            assert.deepStrictEqual(result, [
                { a: 1 },
                { a: 1 },
                1,
                2,
                '1',
            ])
        })

        it('compares by value non-strictly', function () {

            const array = [
                { a: 1 },
                { a: 1 },
                1,
                2,
                1,
                '1',
            ]

            const result = nodup(array, { compare: '==' })

            assert.deepStrictEqual(result, [
                { a: 1 },
                { a: 1 },
                1,
                2,
            ])
        })

        it('defines custom comparator function', function () {

            const array = [ 5, 7, 11, 17, 19, 21, 45, 99 ]

            const customCompare = (a, b) => ~~( a / 10 ) === ~~( b / 10 )

            const result = nodup(array, { compare: customCompare })

            assert.deepStrictEqual(result, [ 5, 11, 21, 45, 99 ])
        })
    })

    context('"pick" option', function () {

        it('compares object elements only by "pick"ed properties', function () {

            const array = [
                { a: 5, b: 10 },
                { a: 5, b: 11 },
                { b: 12 },
                { b: 15 },
                { c: 10 },
                5,
                5,
                7
            ]

            const result = nodup(array, { pick: [ 'a' ] })

            assert.deepStrictEqual(result, [
                { a: 5, b: 10 },
                { b: 12 },
                5,
                7
            ])
        })
    })

    context('"omit" option', function () {

        it('compares object elements skipping "omit"ed properties', function () {

            const array = [
                { a: 5, b: 10 },
                { a: 5, b: 11 },
                { b: 12 },
                { b: 15 },
                { c: 10 },
                5,
                5,
                7
            ]

            const result = nodup(array, { omit: [ 'b' ] })

            assert.deepStrictEqual(result, [
                { a: 5, b: 10 },
                { b: 12 },
                { c: 10 },
                5,
                7
            ])
        })
    })

    context('"onUnique" option', function () {

        it('is called for every unique value with its duplicates, index in resulting array and the array itself', function () {

            const array = [
                { a: 5, b: 10 },
                { a: 5, b: 11 },
                { b: 12 },
                { b: 15 },
                { c: 10 },
                5,
                5,
                7
            ]

            const calls = []

            nodup(array, {
                pick: [ 'a' ],
                onUnique: function (unique, duplicates, index, array) {
                    calls.push({ unique, duplicates, index, array })
                },
            })

            const expectedResult = [
                { a: 5, b: 10 },
                { b: 12 },
                5,
                7
            ]

            assert.deepStrictEqual(calls, [
                {
                    unique: { a: 5, b: 10 },
                    duplicates: [ { a: 5, b: 11 } ],
                    index: 0,
                    array: expectedResult,
                },
                {
                    unique: { b: 12 },
                    duplicates: [ { b: 15 }, { c: 10 } ],
                    index: 1,
                    array: expectedResult,
                },
                {
                    unique: 5,
                    duplicates: [ 5 ],
                    index: 2,
                    array: expectedResult,
                },
                {
                    unique: 7,
                    duplicates: [],
                    index: 3,
                    array: expectedResult,
                },
            ])
        })
    })
})
