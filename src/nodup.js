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

    let { uniques, duplicates } = traversal(array, options)

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

function traversal (array, options) {

    const uniques = []

    if (!array.length) {
        return uniques
    }

    const contains = options.sorted ? containsSorted : containsRandom
    const trackDuplicates = typeof options.onUnique === 'function'

    let duplicates

    if (trackDuplicates) {
        duplicates = new Map()
    }

    const propsRestricted = arePropsRestricted(options)
    const restricted = [], cache = propsRestricted ? [] : array

    for (let i = 0; i < array.length; i++) {

        if (propsRestricted && !cache.hasOwnProperty(i)) {

            if (options.pick) {
                cache[i] = pick(array[i], options.pick)
            }

            if (options.omit) {
                cache[i] = omit(array[i], options.omit)
            }
        }

        const el = cache[i]
        const current = array[i]


        const { index, same } = contains(restricted, el, options)

        if (same) {

            if (trackDuplicates) {
                duplicates.get(uniques[index]).push(current)
            }

        } else {

            if (trackDuplicates) {
                duplicates.set(current, [])
            }

            uniques.push(current)
            restricted.push(el)
        }
    }

    return trackDuplicates ? { uniques, duplicates } : { uniques }
}

function arePropsRestricted (options) {
    return ( hasOwn(options, 'pick') || hasOwn(options, 'omit') ) &&
        options.compare !== '==' && options.compare !== '===' &&
        typeof options.compare !== 'function'
}

function containsSorted (array, el, options) {

    const lastIndex = array.length - 1

    if (lastIndex !== -1) {

        const lastEl = array[lastIndex]

        if (equals(lastEl, el, options)) {
            return { index: lastIndex, same: true }
        }
    }

    return { index: -1, same: false }
}

function containsRandom (array, el, options) {

    for (let i = 0; i < array.length; i++) {

        const unique = array[i]

        if (equals(unique, el, options)) {
            return { index: i, same: true }
        }
    }

    return { index: -1, same: false }
}

function equals (a, b, { compare, strict }) {

    if (compare === '==') {
        return a == b
    }

    if (compare === '===') {
        return a === b
    }

    if (typeof compare === 'function') {
        return compare(a, b)
    }

    return isEqualWith(a, b, strict === false ? abstractEq : strictEq)
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

function pick (v, props) {

    if (!isObject(v)) {
        return v
    }

    if (typeof props === 'string'){
        props = [ props ]
    }

    if (notAnArray(props)) {
        throw new Error('"pick" should be array.')
    }

    const result = baseObject(v)

    for (let keys of props) {

        if (typeof keys !== 'string') {
            throw new Error('"pick" values should be strings.')
        }

        copyProperty(v, result, keys.split('.'))
    }

    return result
}

function copyProperty (src, dst, keys) {

    let pointer = src

    const len = keys.length
    const lastIndex = len - 1

    for (let i = 0; i < len; i++) {

        const key = keys[i]

        if (!hasOwn(pointer, key)) {
            return
        }

        if (isObject(pointer[key]) && i < lastIndex) {
            dst = dst[key] = {}
            pointer = pointer[key]
        } else {
            dst[key] = pointer[key]
            return
        }
    }
}

function omit (v, props) {

    if (!isObject(v)) {
        return v
    }

    if (typeof props === 'string') {
        props = [ props ]
    }

    if (notAnArray(props)) {
        throw new Error('"omit" should be array.')
    }

    const exclusionTree = getExclusion(props)

    return copyObjectWithExclusion(v, exclusionTree)
}

function getExclusion (props) {

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

function copyObjectWithExclusion (obj, exclusion) {

    const result = isObject(obj) ? baseObject(obj) : obj

    for (let key in obj) {

        if (exclusion[key] === true) { continue }

        result[key] = copyObjectWithExclusion(obj[key], exclusion[key])
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

function baseObject (obj) {
    const Ctor = function () {}
    Ctor.prototype = Object.getPrototypeOf(obj)
    return new Ctor()
}
