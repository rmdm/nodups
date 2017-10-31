[![Build Status](https://travis-ci.org/rmdm/nodups.svg?branch=master)](https://travis-ci.org/rmdm/nodups)
[![Coverage Status](https://coveralls.io/repos/github/rmdm/nodups/badge.svg?branch=master)](https://coveralls.io/github/rmdm/nodups?branch=master)

nodups
=====

**nodups** is a small yet powerful library specialized in working with arrays basically to get unique values and to drop duplicates. But it's more than just that. Let's see this in action:

Usage
=====

First of all, **nodups** basic usage, without any options, allows you to get unique values of the passed array:

```javascript
nodups([ 1, { a: 5 }, 2, { a: 5 },  1 ])
// result is [ 1, { a: 5 }, 2 ]
```

It leaves the original array unchainged and returns resulting array with unique values in the order of appearence.

Next, to change the original array directly just pass **`inplace`** option:

```javascript
const array = [ 1, { a: 5 }, 2, { a: 5 },  1 ]
nodups(array, { inplace: true })
// array now contains [ 1, { a: 5 }, 2 ]
```

**nodups** compares objects values in depth and only checks own enumerable properties of the objects. Primitive properties and values are compared with [`SameValueZero`](https://www.ecma-international.org/ecma-262/8.0/#sec-samevaluezero) algorithm - that means **nodups** treats `NaN` values as equal to each other by default:

```javascript
nodups([ NaN, 0, NaN, NaN ])
// result is [ NaN, 0 ]
```
To change the way **nodups** compares values you can pass **`compare`** option with the compare function:

```javascript
nodups([ 1, 5, 7, 14, 19, 33, 36 ], { compare: (a, b) => ~~(a/10) === ~~(b/10) })
// result is [ 1, 14, 33 ]
```

You may also pass `'==='` and `'=='` shorthands with **`compare`**:

```javascript
const obj = { a: 1 }
nodups([ obj, { a: 1 }, obj, { a: 1 }, obj ], { compare: '===' })
// result is [ obj, { a: 1 }, { a: 1 } ]

nodups([ 0, '', false, [] ], { compare: '==' })
// result is [ 0 ]
```

If you would like to change the strictness of comparison primitive properties and values are compared with, you may pass **`strict`** option with `false` value:

```javascript
nodups([ { a: 1 }, { a: '1' } ], { strict: false })
// result is [ { a: 1 } ]
```

Please note that `{ strict: false }` and `{ compare: '==' }` are different concepts:

```javascript
nodups([ 0, '', false, NaN, NaN, { a: 1 }, { a: '1' }, { a: '1' } ], { strict: false })
// result is [ 0, NaN, { a: 1 } ]

nodups([ 0, '', false, NaN, NaN, { a: 1 }, { a: '1' }, { a: '1' } ], { compare: '==' })
// result is [ 0, NaN, NaN, { a: 1 }, { a: '1' }, { a: '1' } ]
```

When you know that your array is sorted you can gain additional performance by passing **`sorted`** option:

```javascript
nodups([ 1, 1, 1, 3, 3, 4, 5 ], { sorted: true })
// result is [ 1, 3, 4, 5 ]
```

But be careful, in case of not sorted array using **`sorted`** would lead to failure to drop all duplicates:

```javascript
nodups([ 1, 3, 1, 1, 3, 4, 5 ], { sorted: true })
// result is [ 1, 3, 1, 3, 4, 5 ]
```

As already noted, **nodups** by default compares objects in depth by all their own enumerable properties. To restrict set of properties by which objects are compared you can use **`by`**:

```javascript
nodups([
    { a: 1, b: 3 },
    { a: 2, b: 4 },
    { a: 1, b: 5 },
], { by: [ 'a' ] })
// result is [
//     { a: 1, b: 3 },
//     { a: 2, b: 4 },
// ]
```

And to ignore some of the properties you can use **`skip`**:

```javascript
nodups([
    { a: 1, b: 3 },
    { a: 2, b: 4 },
    { a: 1, b: 5 },
], { skip: [ 'b' ] })
// result is [
//     { a: 1, b: 3 },
//     { a: 2, b: 4 },
// ]
```

If both are specified, **`by`** wins:

```javascript
nodups([
    { a: 1, b: 3 },
    { a: 2, b: 4 },
    { a: 1, b: 5 },
], { by: [ 'a' ], skip: [ 'a' ] })
// result is [
//     { a: 1, b: 3 },
//     { a: 2, b: 4 },
// ]
```

**`by`** and **`skip`** options accept path or array of paths in objects. Each path may be represented as either `.`-separated keys of each object level or as array of keys of each level (similar to **lodash** notion of paths):

```javascript
nodups([
    { a: { b: 1, c: 2 }, d: 7 },
    { a: { b: 5, c: 4 }, d: 8 },
    { a: { b: 1, c: 2 }, d: 9 },
], { by: [ 'a.b', [ 'a', 'c' ] ] })
// result is [
//     { a: { b: 1, c: 2 }, d: 7 },
//     { a: { b: 5, c: 4 }, d: 8 },
// ]
```

Though normally we want to drop duplicates, sometimes it is useful to know what are they or how many, so **nodups** provides you with **`onUnique`** option. **`onUnique`** option value is expected to be a function with the following signature: `(unique, duplicates, index, uniques)` and it is called for each unique value:

```javascript
nodups([
    { a: 1 },
    { a: 2 },
    { a: 1 },
], { onUnique: (unique, duplicates) => unique.dups = duplicates.length })
// result is [
//     { a: 1, dups: 1 },
//     { a: 2, dups: 0 },
// ]
```

**`onUnique`** can be also uses to change resulting array of unique values:

```javascript
nodups([ 1, 3, 2, 3 ], { onUnique: (uniq, dups, i, uniqs) => uniqs[i] = uniq * 2 })
// result is [ 2, 6, 4 ]
```

And, of course, options can be intermixed!

Installation
============

```sh
npm i nodups
```

Options
=======

To summarize [usage](#usage) section here is more formal description of **nodups** options:

- **`inplace`** (Boolean) - drop duplicates from original array.
- **`compare`** (Function(a, b)|'==='|'==') - custom comparison function of any two array elements or string shorthand.
- **`strict`** (Boolean) - compare objects' primitive properties with sligtly changed `==` operation (the only difference is that `NaN` values are treated as equal).
- **`sorted`** (Boolean) - tells `nodups` that array is sorted and performance optimization can be applied.
- **`by`** (String|Array) - compare objects only by own enumerable properties specified by the paths.
- **`skip`** (String|Array) - compare object only by own enumerable properties execept ones specified by the paths.
- **`onUnique`** - (Function(unique, duplicated, index, uniques)) - callback fired for each unique element. Allows to do some additional work with duplicates.
