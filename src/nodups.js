'use strict'

const isEqualWith = require('lodash.isequalwith')

/**
 * @param {Object} [options]
 * @param {Boolean} [options.sorted = false]
 * @param {Boolean} [options.inplace = false]
 * @param {Boolean} [options.strict = true]
 * @param {String|Function} [options.compare]
 * @param {String|Array(String)|Array(Array(String))} [options.by]
 * @param {String|Array(String)|Array(Array(String))} [options.skip]
 * @param {Function} [options.onUnique]
 */

export default function nodups (array, options = {}) {

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

nodups.polyfill = function () {
    Array.prototype.nodups = function (options) {
        return nodups(this, options)
    }
    return nodups
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

    const eq = options.strict === false ? abstractCustomizer : null

    if (propsRestricted && options.by != null) {

        const propsTree = getPropsTree(options.by)

        return function (a, b) {
            return isEqualBy(a, b, eq, propsTree)
        }

    } else if (propsRestricted && options.skip != null) {

        const propsTree = getPropsTree(options.skip)

        return function (a, b) {
            return isEqualSkip(a, b, eq, propsTree)
        }

    } else {

        return function (a, b) {
            return isEqualWith(a, b, eq)
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
    return ( options.by != null || options.skip != null ) &&
        options.compare !== '==' && options.compare !== '===' &&
        typeof options.compare !== 'function'
}

function isEqualBy (a, b, eq, tree) {

    if (notObject(a) || notObject(b)) { return isEqualWith(a, b, eq) }

    for (let key in tree) {

        if (tree[key] === true) {
            if (!isEqualWith(a[key], b[key], eq)) {
                return false
            }
        }

        if ((hasOwnEnumerable(a, key) ^ hasOwnEnumerable(b, key)) === 1) {
            return false
        }

        if (!hasOwnEnumerable(a, key)) { continue }

        if (!isEqualBy(a[key], b[key], eq, tree[key])) {
            return false
        }
    }

    return true
}

function isEqualSkip (a, b, eq, tree) {

    if (!tree) { return isEqualWith(a, b, eq) }

    if (notObject(a) || notObject(b)) { return isEqualWith(a, b, eq) }

    for (let key in a) {

        if (tree[key] === true) {
            continue
        }

        if ((hasOwn(a, key) ^ hasOwnEnumerable(b, key)) === 1) {
            return false
        }

        if (!hasOwn(a, key)) { continue }

        if (!isEqualSkip(a[key], b[key], eq, tree[key])) { return false }
    }

    return countNotSkippedKeys(a, tree) === countNotSkippedKeys(b, tree)
}

function countNotSkippedKeys (obj, tree) {

    let nKeys = Object.keys(obj).length

    for (let key in tree) {

        if (tree[key] !== true) { continue }

        if (hasOwnEnumerable(obj, key)) { nKeys-- }
    }

    return nKeys
}

function abstractCustomizer (a, b) {

    if (notObject(a) && notObject(b)) {

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
    return obj.hasOwnProperty(key)
}

function hasOwnEnumerable (obj, key) {
    return hasOwn(obj, key) && obj.propertyIsEnumerable(key)
}

function notObject (obj) {
    return typeof obj !== 'object' || !obj
}
