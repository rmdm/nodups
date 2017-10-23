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

    if (!Array.isArray(array)) {
        return []
    }

    let { uniques, duplicates } = getUniques(array, options)

    if (options.inplace) {
        array.length = 0
        array.push.apply(array, uniques)
        uniques = array
    }

    if (typeof options.onUnique === 'function') {
        for (let i = 0; i < uniques.length; i++) {
            const el = uniques[i]
            options.onUnique(el, duplicates.get(el), i, uniques)
        }
    }

    return uniques
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

    const propsRestricted = arePropsRestricted(options)

    const eq = options.strict === false ? abstractEq : strictEq

    if (!propsRestricted) {

        return function (a, b) {
            return isEqualWith(a, b, eq)
        }
    }

    if (options.pick != null) {
        return function (a, b) {
            return isEqualWithPick(a, b, eq, options.pick)
        }
    }

    if (options.omit != null) {
        return function (a, b) {
            return isEqualWithOmit(a, b, eq, options.omit)
        }
    }
}

function abstractEquals (a, b) {
    return a == b
}

function strictEquals (a, b) {
    return a === b
}

function arePropsRestricted (options) {
    return ( options.pick != null || options.omit != null ) &&
        options.compare !== '==' && options.compare !== '===' &&
        typeof options.compare !== 'function'
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

    if (!tree) { return isEqualWith(a, b, eq) }

    if (!isObject(a) || !isObject(b)) { return isEqualWith(a, b, eq) }

    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) { return false }

    let aKeys = Object.keys(a).length
    let bKeys = Object.keys(b).length

    for (let k in a) {

        if (tree[k] === true) {
            aKeys--
            if (hasOwn(b, k)) { bKeys-- }
            continue
        }

        if ((hasOwn(a, k) ^ hasOwn(b, k)) === 1) { return false }

        if (!hasOwn(a, k)) { continue }

        if (!eqOmit(a[k], b[k], eq, tree[k])) { return false }
    }

    return aKeys === bKeys
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

function getPropsTree (paths) {

    if (!Array.isArray(paths)) {
        paths = [ paths ]
    }

    const result = {}

    for (let path of paths) {

        if (!Array.isArray(path)) {
            path = String(path).split('.')
        }

        const pathDepth = path.length
        const lastKey = pathDepth - 1

        let pointer = result

        for (let i = 0; i < pathDepth; i++) {

            const key = path[i]

            if (i === lastKey) {
                pointer[key] = true
            } else {
                pointer = pointer[key] = pointer[key] || {}
            }
        }
    }

    return result
}

function hasOwn (obj, key) {
    return isObject(obj) && obj.hasOwnProperty(key)
}

function isObject (obj) {
    return obj && typeof obj === 'object'
}
