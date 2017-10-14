'use strict'

const isEqualWith = require('lodash.isequalwith')

export default function (array, options) {

    if (notAnArray(array)) {
        return []
    }

    return getUniq(array, options)
}

function getUniq (array, options = {}) {

    let noduped

    if (options.sorted) {
        noduped = getSortedUniq(array, options)
    } else {
        noduped = getRandomUniq(array, options)
    }

    let result = noduped.array

    if (options.inplace) {
        array.length = 0
        array.push.apply(array, noduped.array)
        result = array
    }

    if (typeof options.onUnique === 'function') {
        for (let i = 0; i < result.length; i++) {
            const el = result[i]
            options.onUnique(el, noduped.duplicates.get(el), i, result)
        }
    }

    return result
}

function getSortedUniq (array, options) {

    const result = [], duplicates = new Map()

    if (!array.length) {
        return result
    }

    let last = array[0]

    result.push(last)
    duplicates.set(last, [])

    for (let i = 1; i < array.length; i++) {

        const el = array[i]

        if (compare(el, last, options)) {
            duplicates.get(last).push(el)
        } else {
            result.push(el)
            duplicates.set(el, [])
            last = el
        }
    }

    return { array: result, duplicates: duplicates }
}

function getRandomUniq (array, options) {

    const result = [], duplicates = new Map()

    for (let el of array) {

        let hasNoDuplicates = true

        for (let unique of result) {
            if (compare(unique, el, options)) {
                hasNoDuplicates = false
                duplicates.get(unique).push(el)
                break
            }
        }

        if (hasNoDuplicates) {
            result.push(el)
            duplicates.set(el, [])
        }
    }

    return { array: result, duplicates: duplicates }
}

function compare (a, b, options) {

    if (options.compare === '==') {
        return a == b
    }

    if (options.compare === '===') {
        return a === b
    }

    if (typeof options.compare === 'function') {
        return options.compare(a, b)
    }

    if (options.pick) {
        a = pick(a, options.pick)
        b = pick(b, options.pick)
    }

    if (options.omit) {
        a = omit(a, options.omit)
        b = omit(b, options.omit)
    }

    return equals(a, b, options.strict)
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

    const result = {}

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

    const result = isObject(obj) ? {} : obj

    for (let key in obj) {

        if (exclusion[key] === true) { continue }

        result[key] = copyObjectWithExclusion(obj[key], exclusion[key])
    }

    return result
}

const strictEq = function (a, b) {

    if (!isObject(a) && !isObject(b)) {

        if (isNaN(a) && isNaN(b)) {
            return true
        }

        return a === b
    }
}

const abstractEq = function (a, b) {

    if (!isObject(a) && !isObject(b)) {

        if (isNaN(a) && isNaN(b)) {
            return true
        }

        return a == b
    }
}

function equals (a, b, strict) {
    return isEqualWith(a, b, strict === false ? abstractEq : strictEq)
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
