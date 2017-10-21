'use strict'

const isEqualWith = require('lodash.isequalwith')

/**
 * @param {Object} [options]
 * @param {Boolean} [options.sorted]
 * @param {Boolean} [options.inplace]
 * @param {Boolean} [options.strict = true]
 * @param {String|Function} [options.compare]
 * @param {String|Array(String)|Array(Array(String))} [options.pick]
 * @param {String|Array(String)|Array(Array(String))} [options.omit]
 * @param {Function} [options.onUnique]
 */

export default function (array, options = {}) {

    if (notAnArray(array)) {
        return []
    }

    let { uniques, duplicates } = getUniques(array, options)

    let result = uniques

    if (options.inplace) {
        array.length = 0
        array.push.apply(array, result)
        result = array
    }

    if (typeof options.onUnique === 'function') {
        for (let i = 0; i < result.length; i++) {
            const el = result[i]
            options.onUnique(el, duplicates.get(el), i, result)
        }
    }

    return result
}

function getUniques (array, options) {

    const uniques = []

    if (!array.length) {
        return uniques
    }

    const contains = options.sorted ? containsSorted : containsRandom
    const equals = getEquals(options)

    const trackDuplicates = typeof options.onUnique === 'function'

    let duplicates

    if (trackDuplicates) {
        duplicates = new Map()
    }

    for (let el of array) {

        const index = contains(uniques, el, equals, options)

        if (index === -1) {

            if (trackDuplicates) {
                duplicates.set(el, [])
            }

            uniques.push(el)

        } else if (trackDuplicates) {
            duplicates.get(uniques[index]).push(el)
        }
    }

    return { uniques, duplicates }
}

function arePropsRestricted (options) {
    return ( hasOwn(options, 'pick') || hasOwn(options, 'omit') ) &&
        options.compare !== '==' && options.compare !== '===' &&
        typeof options.compare !== 'function'
}

function containsSorted (array, el, equals, options) {

    const lastIndex = array.length - 1

    if (lastIndex !== -1) {

        const lastEl = array[lastIndex]

        if (equals(lastEl, el, options)) {
            return lastIndex
        }
    }

    return -1
}

function containsRandom (array, el, equals, options) {

    for (let i = 0; i < array.length; i++) {

        const unique = array[i]

        if (equals(unique, el, options)) {
            return i
        }
    }

    return -1
}

function getEquals (options) {

    if (typeof options.compare === 'function') {
        return options.compare
    }

    if (options.compare === '==') {
        return abstractEquals
    }

    if (options.compare === '===') {
        return strictEquals
    }

    const eq = options.strict === false ? abstractEq : strictEq

    if (hasOwn(options, 'pick')) {
        return function (a, b) {
            return isEqualWithPick(a, b, eq, options.pick)
        }
    }

    if (hasOwn(options, 'omit')) {
        return function (a, b) {
            return isEqualWithOmit(a, b, eq, options.omit)
        }
    }

    return function (a, b) {
        return isEqualWith(a, b, eq)
    }
}

function abstractEquals (a, b) {
    return a == b
}

function strictEquals (a, b) {
    return a === b
}

function isEqualWithPick (a, b, eq, pick) {

    const propsTree = getPropsTree(pick)

    return eqPick(a, b, eq, propsTree)
}

function eqPick (a, b, eq, tree) {

    if (!isObject(a) || !isObject(b)) { return isEqualWith(a, b, eq) }

    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) { return false }

    for (let key in tree) {

        if (tree[key] === true) {
            if (!isEqualWith(a[key], b[key], eq)) {
                return false
            }
        }

        if (!eqPick(a[key], b[key], eq, tree[key])) {
            return false
        }
    }

    return true
}

function isEqualWithOmit (a, b, eq, omit) {

    const propsTree = getPropsTree(omit)

    return eqOmit(a, b, eq, propsTree)
}

function eqOmit (a, b, eq, tree) {

    if (tree === true) { return true }

    if (!tree) { return isEqualWith(a, b, eq) }

    if (!isObject(a) || !isObject(b)) { return isEqualWith(a, b, eq) }

    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) { return false }

    for (let k in a) {

        if ((hasOwn(a, k) ^ hasOwn(b, k)) === 1) { return false }

        if (!hasOwn(a, k)) { continue }

        if (!eqOmit(a[k], b[k], eq, tree[k])) { return false }
    }

    return Object.keys(b).length === Object.keys(a).length
}

function strictEq (a, b) {

    if (!isObject(a) && !isObject(b)) {

        if (isNaN(a) && isNaN(b)) {
            return true
        }

        return a === b
    }
}

function abstractEq (a, b) {

    if (!isObject(a) && !isObject(b)) {

        if (isNaN(a) && isNaN(b)) {
            return true
        }

        return a == b
    }
}

function getPropsTree (props) {

    const result = {}

    for (let keys of props) {

        keys = keys.split('.')

        const keysDepth = keys.length
        const lastKey = keysDepth - 1

        let pointer = result

        for (let i = 0; i < keysDepth; i++) {

            const key = keys[i]

            if (i === lastKey) {
                pointer[key] = true
            } else {
                pointer = pointer[key] = pointer[key] || {}
            }
        }
    }

    return result
}

function notAnArray (array) {
    return !Array.isArray(array)
}

function hasOwn (obj, key) {
    return isObject(obj) && obj.hasOwnProperty(key)
}

function isObject (obj) {
    return obj && typeof obj === 'object'
}
