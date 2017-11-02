'use strict'

import assert from 'assert-match'
import nodups from '../src/nodups'

describe('nodups polyfill', function () {

    it('is not available until activated', function () {
        assert.throws(function () {
            [ 1, 1, 1 ].nodups()
        })
    })

    context('when activated', function () {

        before(function () {
            nodups.polyfill()
        })

        it('returns nodups module itself', function () {
            const polyfilled = nodups.polyfill()
            assert.equal(polyfilled, nodups)
        })

        it('makes available nodups convenient method on Array.prototype', function () {
            assert.deepEqual([ 1, 1, 1 ].nodups(), [ 1 ])
        })

        it('added method accepts and applies options', function () {

            const result = [ 15, 5, 14, 33, 73 ].nodups({
                compare: (a,b) => a % 10 === b % 10
            })

            assert.deepEqual(result, [ 15, 14, 33 ])
        })

        it('allows for method chaining', function () {

            const array = [
                {
                    title: 'ball',
                    category: 'physical activity toys',
                },
                {
                    title: 'frisbee',
                    category: 'physical activity toys',
                },
                {
                    title: 'ball',
                    category: 'physical activity toys',
                },
                {
                    title: 'quicksort',
                    category: 'algorithms',
                },
                {
                    title: 'hard coding',
                    category: 'anti-patterns',
                },
                {
                    title: 'espresso',
                    category: 'coffee',
                },
                {
                    title: 'espresso',
                    category: 'coffee',
                },
                {
                    title: 'magic number',
                    category: 'anti-patterns',
                },
                {
                    title: 'espresso',
                    category: 'coffee',
                },
                {
                    title: 'hard coding',
                    category: 'anti-patterns',
                },
            ]

            const categoryTypes = {
                'physical activity toys': 'toys',
                'algorithms': 'programming',
                'anti-patterns': 'programming',
                'coffee': 'drinks',
            }

            function getType (category) {
                return categoryTypes[category]
            }

            const result = array
                .nodups()
                .map(x => x.category)
                .nodups()
                .filter(x => x[0] === 'a')
                .map(getType)
                .nodups()

            assert(result, [ 'programming' ])
        })
    })
})
