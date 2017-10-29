nodup
=====

**nodup** is a small yet powerful library specialized in working with arrays basically to get unique values and to drop duplicates. But it's more than just that. Let's see this in action:

Usage
=====

First of all, **nodup** basic usage, without any options, allows you to get unique values of the passed array:

```javascript
nodup([ 1, { a: 5 }, 2, { a: 5 },  1 ])
// result is [ 1, { a: 5 }, 2 ]
```

It leaves the original array unchainged and returns resulting array with unique values in the order of appearence.

Next, to change the original array directly just pass **`inplace`** option:

```javascript
const array = [ 1, { a: 5 }, 2, { a: 5 },  1 ]
nodup(array, { inplace: true })
// array now contains [ 1, { a: 5 }, 2 ]
```

**nodup** compares objects values in depth and only checks own enumerable properties of the objects. Primitive properties and values are compared with [`SameValueZero`](https://www.ecma-international.org/ecma-262/8.0/#sec-samevaluezero) algorithm - that means **nodup** threats `NaN` values as equal to each other by default:

```javascript
nodup([ NaN, 0, NaN, NaN ])
// result is [ NaN, 0 ]
```
To change the way **nodup** compares values you can pass **`compare`** option with the compare function:

```javascript
nodup([ 1, 5, 7, 14, 19, 33, 36 ], { compare: (a, b) => ~~(a/10) === ~~(b/10) })
// result is [ 1, 14, 33 ]
```

You may also pass `'==='` and `'=='` shorthands with **`compare`**:

```javascript
const obj = { a: 1 }
nodup([ obj, { a: 1 }, obj, { a: 1 }, obj ], { compare: '===' })
// result is [ obj, { a: 1 }, { a: 1 } ]

nodup([ 0, '', false, [] ], { compare: '==' })
// result is [ 0 ]
```

If you would like to change the strictness of comparison primitive properties and values are compared with, you may pass **`strict`** option with `false` value:

```javascript
nodup([ { a: 1 }, { a: '1' } ], { strict: false })
// result is [ { a: 1 } ]
```

Please note that `{ strict: false }` and `{ compare: '==' }` are different concepts:

```javascript
nodup([ 0, '', false, NaN, NaN, { a: 1 }, { a: '1' }, { a: '1' } ], { strict: false })
// result is [ 0, NaN, { a: 1 } ]

nodup([ 0, '', false, NaN, NaN, { a: 1 }, { a: '1' }, { a: '1' } ], { compare: '==' })
// result is [ 0, NaN, NaN, { a: 1 }, { a: '1' }, { a: '1' } ]
```

When you know that your array is sorted you can gain additional performance by passing **`sorted`** option:

```javascript
nodup([ 1, 1, 1, 3, 3, 4, 5 ], { sorted: true })
// result is [ 1, 3, 4, 5 ]
```

But be careful, in case of not sorted array using **`sorted`** would lead to failure to drop all duplicates:

```javascript
nodup([ 1, 3, 1, 1, 3, 4, 5 ], { sorted: true })
// result is [ 1, 3, 1, 3, 4, 5 ]
```

As already noted, **nodup** by default compares objects in depth by all their own enumerable properties. To restrict set of properties by which objects are compared you can use **`pick`**:

```javascript
nodup([
    { a: 1, b: 3 },
    { a: 2, b: 4 },
    { a: 1, b: 5 },
], { pick: [ 'a' ] })
// result is [
//     { a: 1, b: 3 },
//     { a: 2, b: 4 },
// ]
```

And to ignore some of the properties you can use **`omit`**:

```javascript
nodup([
    { a: 1, b: 3 },
    { a: 2, b: 4 },
    { a: 1, b: 5 },
], { omit: [ 'b' ] })
// result is [
//     { a: 1, b: 3 },
//     { a: 2, b: 4 },
// ]
```

If both are specified, **`pick`** wins:

```javascript
nodup([
    { a: 1, b: 3 },
    { a: 2, b: 4 },
    { a: 1, b: 5 },
], { pick: [ 'a' ], omit: [ 'a' ] })
// result is [
//     { a: 1, b: 3 },
//     { a: 2, b: 4 },
// ]
```

**`pick`** and **`omit`** options accept path or array of paths in objects. Each path may be represented as either `.`-separated keys of each object level or as array of keys of each level (similar to **lodash** notion of paths):

```javascript
nodup([
    { a: { b: 1, c: 2 }, d: 7 },
    { a: { b: 5, c: 4 }, d: 8 },
    { a: { b: 1, c: 2 }, d: 9 },
], { pick: [ 'a.b', [ 'a', 'c' ] ] })
// result is [
//     { a: { b: 1, c: 2 }, d: 7 },
//     { a: { b: 5, c: 4 }, d: 8 },
// ]
```

Though normally we want to drop duplicates, sometimes it is useful to know what are they or how many, so **nodup** provides you with **`onUnique`** option. **`onUnique`** option value is expected to be a function with the following signature: `(unique, duplicates, index, uniques)` and it is called for each unique value:

```javascript
nodup([
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
nodup([ 1, 3, 2, 3 ], { onUnique: (uniq, dups, i, uniqs) => uniqs[i] = uniq * 2 })
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

To summarize [usage](#usage) section here is more formal description of **nodup** options:

- **`inplace`**
- **`compare`**
- **`strict`**
- **`sorted`**
- **`pick`**
- **`omit`**
- **`onUnique`**
