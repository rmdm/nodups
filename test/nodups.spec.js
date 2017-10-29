'use strict'

import assert from 'assert-match'
import { custom } from 'assert-match/matchers'
import nodups from '../src/nodups'

describe('nodups', function () {

    it('returns empty array if nothing is passed', function () {

        const result = nodups()

        assert.deepStrictEqual(result, [])
    })

    it('returns different empty array when empty array is passed (and when "inplace" option is not specified)', function () {

        const duplicates = []

        const uniques = nodups(duplicates)

        assert.notEqual(duplicates, uniques)
    })

    it('returns empty array if not an array is passed', function () {

        const result = nodups('A string')

        assert.deepStrictEqual(result, [])
    })

    it('returns copy of the passed array if it has no dups', function () {

        const array = [ 1, 2, 3, 4, 5 ]

        const result = nodups(array)

        assert.deepStrictEqual(result, [ 1, 2, 3, 4, 5 ])
        assert.notEqual(result, array)
    })

    it('returns array of unique values of the passed array in the order of appearance', function () {

        const array = [ 1, 4, 2, 5, 3, 4, 5, 1 ]

        const result = nodups(array)

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

        const result = nodups(array)

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

        const result = nodups(array)

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

        const result = nodups(array)

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

            const result = nodups(array)

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

        const result = nodups(array)

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

        const result = nodups(array)

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

        const result = nodups(array)

        assert.deepStrictEqual(result, [ a, d, e, f ])
    })

    it('respects array subclasses', function () {

        const Queue = class extends Array {}

        const q = new Queue(1, 4, 2, 5, 3, 4, 5, 1)

        const result = nodups(q, { inplace: true })

        assert.equal(result, q)
        assert.deepStrictEqual(result, [ 1, 4, 2, 5, 3 ])
    })

    context('"inplace" option', function () {

        it('returns same array when the empyt one is passed an "inplace" option is specified', function () {

            const duplicates = []

            const uniques = nodups(duplicates, { inplace: true })

            assert.equal(duplicates, uniques)
        })

        it('returns passed array if it has no dups', function () {

            const array = [ 1, 2, 3, 4, 5 ]

            const result = nodups(array, { inplace: true })

            assert.deepStrictEqual(result, [ 1, 2, 3, 4, 5 ])
            assert.equal(result, array)
        })

        it('returns passed array with dups removed', function () {

            const array = [ 1, 4, 2, 5, 3, 4, 5, 1 ]

            const result = nodups(array, { inplace: true })

            assert.deepStrictEqual(result, [ 1, 4, 2, 5, 3 ])
            assert.equal(result, array)
        })
    })

    context('"sorted" option', function () {

        it('returns sorted array with dups removed', function () {

            const array = [ 1, 1, 2, 3, 4, 4, 5, 5, 5 ]

            const result = nodups(array, { sorted: true })

            assert.deepStrictEqual(result, [ 1, 2, 3, 4, 5 ])
        })

        it('returns not sorted array with not all dups removed', function () {

            const array = [ 1, 1, 4, 2, 3, 4, 5, 5, 5 ]

            const result = nodups(array, { sorted: true })

            assert.deepStrictEqual(result, [ 1, 4, 2, 3, 4, 5 ])
        })
    })

    context('"strict" option set to false', function () {

        it('compares primitive values of the elements with not strict equals', function () {

            const array = [
                { a: 1 },
                { a: '1' },
            ]

            const result = nodups(array, { strict: false })

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

            const result = nodups(array, { strict: false })

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

            const result = nodups(array, { compare: '===' })

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

            const result = nodups(array, { compare: '==' })

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

            const result = nodups(array, { compare: customCompare })

            assert.deepStrictEqual(result, [ 5, 11, 21, 45, 99 ])
        })
    })

    context('"by" option', function () {

        it('compares object elements only by "by"ed properties', function () {

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

            const result = nodups(array, { by: [ 'a' ] })

            assert.deepStrictEqual(result, [
                { a: 5, b: 10 },
                { b: 12 },
                5,
                7
            ])
        })

        it('merges objects with arrays', function () {

            const array = [
                [ 1 ],
                { 0: 1 },
                [ 1, 2 ],
            ]

            const result = nodups(array, { by: [ '0' ] })

            assert.deepStrictEqual(result, [
                [ 1 ],
            ])
        })

        it('capable of checking deep props', function () {

            const array = [
                { a: { b: { c: 10, d: 11 }}},
                { c: 10 },
                { a: { b: { c: 10, d: 21 }}},
            ]

            const result = nodups(array, { by: [ 'a.b.c' ] })

            assert.deepStrictEqual(result, [
                { a: { b: { c: 10, d: 11 }}},
                { c: 10 },
            ])
        })

        it('ignores by when it is undefined', function () {

            const array = [
                { undefined: 1, a: 5, b: 10 },
                { undefined: 1, a: 5, b: 11 },
            ]

            const result = nodups(array, { by: undefined })

            assert.deepStrictEqual(result, [
                { undefined: 1, a: 5, b: 10 },
                { undefined: 1, a: 5, b: 11 },
            ])
        })

        it('ignores by when it is null', function () {

            const array = [
                { null: 1, a: 5, b: 10 },
                { null: 1, a: 5, b: 11 },
            ]

            const result = nodups(array, { by: null })

            assert.deepStrictEqual(result, [
                { null: 1, a: 5, b: 10 },
                { null: 1, a: 5, b: 11 },
            ])
        })

        it('understands number as by', function () {

            const array = [
                [ 1, 2 ],
                [ 1 ],
            ]

            const result = nodups(array, { by: 0 })

            assert.deepStrictEqual(result, [
                [ 1, 2 ],
            ])
        })

        it('understands boolean as by', function () {

            const array = [
                { false: true, true: false },
                { false: true, true: true },
                { false: false, true: true },
                { false: false, true: false },
            ]

            const result = nodups(array, { by: false })

            assert.deepStrictEqual(result, [
                { false: true, true: false },
                { false: false, true: true },
            ])
        })

        it('checks by several deep paths', function () {

            const array = [
                { a: 1, b: 2, c: 3, d: { e: { f: 10 }, g: 11, h: 8 } },
                { a: 4, b: 5, c: 6, d: { e: { f: 10 }, g: 10, h: 8 } },
                { a: 7, b: 8, c: 9, d: { e: { f: 10 }, g: 11, h: 7 } },
                { a: 0, b: 21, c: 31, d: { e: { f: 10 }, g: 11 } },
            ]

            const result = nodups(array, { by: [ 'd.e.f', 'd.g' ] })

            assert.deepStrictEqual(result, [
                { a: 1, b: 2, c: 3, d: { e: { f: 10 }, g: 11, h: 8 } },
                { a: 4, b: 5, c: 6, d: { e: { f: 10 }, g: 10, h: 8 } },
            ])
        })

        it('checks by several deep paths each passed as an array', function () {

            const array = [
                { a: 1, b: 2, c: 3, d: { e: { f: 10 }, g: 11, h: 8 } },
                { a: 4, b: 5, c: 6, d: { e: { f: 10 }, g: 10, h: 8 } },
                { a: 7, b: 8, c: 9, d: { e: { f: 10 }, g: 11, h: 7 } },
                { a: 0, b: 21, c: 31, d: { e: { f: 10 }, g: 11 } },
            ]

            const result = nodups(array, { by: [ [ 'd', 'e', 'f' ], [ 'd', 'g' ] ] })

            assert.deepStrictEqual(result, [
                { a: 1, b: 2, c: 3, d: { e: { f: 10 }, g: 11, h: 8 } },
                { a: 4, b: 5, c: 6, d: { e: { f: 10 }, g: 10, h: 8 } },
            ])
        })

        it('affects only own enumerable props, others are still ignored', function () {

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

            const result = nodups(array, { by: 'v1' })

            assert.deepStrictEqual(result, [ a, d, e ])
        })

        it('ignores not existing keys', function () {

            const array = [
                { a: 1 },
                { a: 1 },
            ]

            const result = nodups(array, { by: ['a', 'b.c' ]})

            assert.deepStrictEqual(result, [ { a: 1 } ])
        })
    })

    context('"skip" option', function () {

        it('compares object elements skipping "skip"ed properties', function () {

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

            const result = nodups(array, { skip: [ 'b' ] })

            assert.deepStrictEqual(result, [
                { a: 5, b: 10 },
                { b: 12 },
                { c: 10 },
                5,
                7
            ])
        })

        it('merges objects with arrays', function () {

            const array = [
                [ 1, 2 ],
                { 0: 1, 1: 2 },
                [ 1, 2 ],
            ]

            const result = nodups(array, { skip: [ '1' ] })

            assert.deepStrictEqual(result, [
                [ 1, 2 ],
            ])
        })

        it('capable of skipping deep props', function () {

            const array = [
                { a: { b: { c: 10, d: 11 }}},
                { c: 10 },
                { a: { b: { c: 10, d: 21 }}},
            ]

            const result = nodups(array, { skip: [ 'a.b.d' ] })

            assert.deepStrictEqual(result, [
                { a: { b: { c: 10, d: 11 }}},
                { c: 10 },
            ])
        })

        it('ignores skip when it is undefined', function () {

            const array = [
                { undefined: 1, a: 5, b: 10 },
                { undefined: 1, a: 5, b: 11 },
            ]

            const result = nodups(array, { skip: undefined })

            assert.deepStrictEqual(result, [
                { undefined: 1, a: 5, b: 10 },
                { undefined: 1, a: 5, b: 11 },
            ])
        })

        it('ignores skip when it is null', function () {

            const array = [
                { undefined: 1, a: 5, b: 10 },
                { undefined: 1, a: 5, b: 11 },
            ]

            const result = nodups(array, { skip: null })

            assert.deepStrictEqual(result, [
                { undefined: 1, a: 5, b: 10 },
                { undefined: 1, a: 5, b: 11 },
            ])
        })

        it('understands boolean as skip', function () {

            const array = [
                { false: true, true: false },
                { false: true, true: true },
                { false: false, true: true },
                { false: false, true: false },
            ]

            const result = nodups(array, { skip: true })

            assert.deepStrictEqual(result, [
                { false: true, true: false },
                { false: false, true: true },
            ])
        })

        it('skips by several deep paths', function () {

            const array = [
                { a: { b: { c: 1 } }, d: { e: { f: 10 }, g: 11, h: 8 } },
                { a: { b: { c: 2 } }, d: { e: { f: 10 }, g: 10, h: 8 } },
                { a: { b: { c: 3 } }, d: { e: { f: 10 }, g: 11, h: 7 } },
                { a: { b: { c: 4 } }, d: { e: { f: 10 }, g: 11 } },
            ]

            const result = nodups(array, { skip: [ 'a.b.c', 'd.h' ] })

            assert.deepStrictEqual(result, [
                { a: { b: { c: 1 } }, d: { e: { f: 10 }, g: 11, h: 8 } },
                { a: { b: { c: 2 } }, d: { e: { f: 10 }, g: 10, h: 8 } },
            ])
        })

        it('skips by several deep paths each passed as an array', function () {

            const array = [
                { a: { b: { c: 1 } }, d: { e: { f: 10 }, g: 11, h: 8 } },
                { a: { b: { c: 2 } }, d: { e: { f: 10 }, g: 10, h: 8 } },
                { a: { b: { c: 3 } }, d: { e: { f: 10 }, g: 11, h: 7 } },
                { a: { b: { c: 4 } }, d: { e: { f: 10 }, g: 11 } },
            ]

            const result = nodups(array, { skip: [ [ 'a', 'b', 'c' ], [ 'd', 'h' ] ] })

            assert.deepStrictEqual(result, [
                { a: { b: { c: 1 } }, d: { e: { f: 10 }, g: 11, h: 8 } },
                { a: { b: { c: 2 } }, d: { e: { f: 10 }, g: 10, h: 8 } },
            ])
        })

        it('affects only own enumerable props, others are still used', function () {

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

            const result = nodups(array, { skip: [ 'v0', 'v2' ] })

            assert.deepStrictEqual(result, [ a, d, e ])
        })

        it('ignores not existing keys', function () {

            const array = [
                { a: 1 },
                { a: 1 },
            ]

            const result = nodups(array, { skip: [ 'b.c' ]})

            assert.deepStrictEqual(result, [ { a: 1 } ])
        })

        it('ignores not own props', function () {

            const array = [
                Object.create({ a: 1 }, {
                    b: { value: 2, enumerable: true },
                    c: { value: 3, enumerable: true },
                }),
                Object.create({ a: 1 }, {
                    b: { value: 2, enumerable: true },
                    c: { value: 5, enumerable: true },
                }),
            ]

            const result = nodups(array, { skip: 'c' })

            assert.deepEqual(result, [ { b: 2, c: 3 } ])
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

            nodups(array, {
                by: [ 'a' ],
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

        it('may be used to change each item in resulting array', function () {

            const array = [ 1, 3, 2, 3, 3 ]

            const result = nodups(array, {
                onUnique: (uniq, dups, i, uniqs) => uniqs[i] = uniq * 2
            })

            assert.deepStrictEqual(result, [ 2, 6, 4 ])
        })
    })
})
