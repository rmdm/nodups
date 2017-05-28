'use strict'

export default function (array, options) {

    if (notAnArray(array)) {
        return []
    }

    return getUniq(array, options)
}

function notAnArray (array) {
    return !Array.isArray(array)
}

function getUniq (array, options = {}) {

    let result

    if (options.sorted) {
        result = getSortedUniq(array, options)
    } else {
        result = getRandomUniq(array, options)
    }

    if (options.inplace) {
        array.length = 0
        array.push.apply(array, result)
        result = array
    }

    return result
}

function getSortedUniq (array, options) {

    let result = []

    if (!array.length) {
        return result
    }

    let last = array[0]

    result.push(last)

    for (let i = 1; i < array.length; i++) {

        const el = array[i]

        if (!compare(el, last, options)) {
            result.push(el)
            last = el
        }
    }

    return result
}

function getRandomUniq (array, options) {

    let result = []

    for (let el of array) {
        if (notContains(result, el, options)) {
            result.push(el)
        }
    }

    return result
}

function notContains (array, v, options) {

    for (let el of array) {
        if (compare(el, v, options)) {
            return false
        }
    }

    return true
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

    return equals(a, b, options.strict)
}

function equals (a, b, strict, visited_a, visited_b, basePath) {

    visited_a = makeVisited(visited_a)
    visited_b = makeVisited(visited_b)

    basePath = basePath || []

    if (visited_a.paths(a)) {

        visited_a.add(a, basePath)
        visited_b.add(b, basePath)

        return visited_a.samePaths(a, visited_b.paths(b))
    }

    visited_a.add(a, basePath)
    visited_b.add(b, basePath)

    if (!isObject(a) && !isObject(b)) {

        if (isNaN(a) && isNaN(b)) {
            return true
        }

        return strict === false ? a == b : a === b
    }

    if (!isObject(a) || !isObject(b)) {
        return false
    }

    if (Object.keys(a).length !== Object.keys(b).length) {
        return false
    }

    for (let key in a) {
        if (hasOwn(a, key)) {

            if (!hasOwn(b, key)) {
                return false
            }

            const keyPath = basePath.concat(key)

            if (!equals(a[key], b[key], strict, visited_a, visited_b, keyPath)) {
                return false
            }
        }
    }

    return true
}

function makeVisited (visited) {

    if (visited) {
        return visited
    }

    const nodes = []

    function equalPaths (path1, path2) {

        if (path1.length !== path2.length) {
            return false
        }

        for (let idx in path1) {

            if (path1[idx] !== path2[idx]) {
                return false
            }
        }

        return true
    }

    visited = {

        add: (node, path) => {

            if (visited.has(node, path)) { return }

            const paths = visited.paths(node)

            if (paths) {

                paths.push(path)

            } else {

                nodes.push({
                    node: node,
                    paths: [path],
                })
            }
        },

        has: (node, path) => {

            const paths = visited.paths(node)

            if (!paths) { return false }

            for (let p of paths) {

                if (!equalPaths(p, path)) {
                    return false
                }
            }

            return true
        },

        paths: (node) => {

            for (let n of nodes) {
                if (n.node === node) { return n.paths }
            }

            return null
        },

        samePaths: (node, paths) => {

            const nodePaths = visited.paths(node)

            if (nodePaths === null && paths === null) {
                return true
            }

            if (nodePaths === null || paths === null) {
                return false
            }

            if (nodePaths.length !== paths.length) {
                return false
            }

            for (let pathIdx in nodePaths) {

                if (!equalPaths(nodePaths[pathIdx], paths[pathIdx])) {
                    return false
                }
            }

            return true
        }
    }

    return visited
}

function hasOwn (obj, key) {
    return isObject(obj) && obj.hasOwnProperty(key)
}

function isObject (obj) {
    return obj && typeof obj === 'object'
}
