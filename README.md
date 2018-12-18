# collector.js

This module is responsible for resolve the synchronous call on Node.js.

As you should know we should not write synchronous function in Node.js, but the problem is sometime we need to do synchronous stuff, so how to do that without write synchronous functions?

Collector.js is responsible for collecting the functions response and trigger a callback with the all responses at once.

## Instal

```
npm install collector.js
```

## All

Executes all function and collect their responses.

```javascript
const Collector = require("collector.js");

function fncA(callback) {
  callback(null, "A");
}

function fncB(callback) {
  callback(null, "B");
}

function fncC(callback) {
  callback(null, "C");
}

Collector.all([fncA, fncB, fncC], results => {
  console.log(results[0][0]); //prints null
  console.log(results[0][1]); //prints "A"

  console.log(results[1][0]); //prints null
  console.log(results[1][1]); //prints "B"

  console.log(results[2][0]); //prints null
  console.log(results[2][1]); //prints "C"
});
```

## Sequence

Executes all function with the same callback.

```javascript
const Collector = require("collector.js");

function fncOne(callback) {
  callback(null, "One", 1);
}

function fncTwo(callback) {
  callback(null, "Two", 2);
}

function fncThree(callback) {
  callback(null, "Three", 3);
}

function print(err, text, num) {
  console.log(num, text);
}

Collector.sequence([fncA, fncB, fncC], print);
// prints 1 One
// prints 2 Two
// prints 3 Three
```

## Exec

Chains the functions sending the response as the input for the next function.

```javascript
const Collector = require("collector.js");

function fncA(callback) {
  callback(null, "A");
}

function fncB(text, callback) {
  callback(null, text + "B");
}

function fncC(text, callback) {
  callback(null, text + "C");
}

Collector.exec(fncA)
  .then(fncB)
  .then(fncC)
  .done((err, text) => console.log(text));
// prints ABC
```

## Collect

Collect the response from all triggered functions

```javascript
const Collector = require("collector.js");

function fncOne(callback) {
  callback(null, "One");
}

function fncTwo(callback) {
  callback(new Error("Error Message"));
}

function fncThree(callback) {
  callback(null, "Three");
}

let collector = new Collector();
collector.trigger("one", fncOne);
collector.trigger("two", fncTwo);
collector.trigger("three", fncThree);

collector.done((err, data) => {
  console.log("one", data.one.data);
  // prints one

  console.log("two", data.two.data);
  // prints null

  console.log("two (error)", data.two.err);
  // prints Error Message

  console.log("three", data.three.data);
  // prints three
});
```
