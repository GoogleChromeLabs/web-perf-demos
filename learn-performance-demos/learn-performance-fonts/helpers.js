const utils = require('./utils');
const helpers = module.exports;

'use strict';

/** 
 * Returns true if equality
 * @param {arg1} arg
 * @param {arg1} value
 * @return {Boolean}
 */
helpers.ifeq = (arg1, arg2, options) => {
  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
};

/** 
 * Returns true if not equal
 * @param {arg1} arg
 * @param {arg1} value
 * @return {Boolean}
 */
helpers.ifneq = (arg1, arg2, options) => {
  return arg1 != arg2 ? options.fn(this) : options.inverse(this);
};

/**
 * Return the magnitude of `a`.
 *
 * @param {Number} `a`
 * @return {Number}
 */

helpers.abs = function(num) {
  if (isNaN(num)) {
    throw new TypeError('expected a number');
  }
  return Math.abs(num);
};

/**
 * Return the sum of `a` plus `b`.
 *
 * @param {Number} `a`
 * @param {Number} `b`
 * @return {Number}
 */

helpers.add = function(a, b) {
  if (!isNaN(a) && !isNaN(b)) {
    return Number(a) + Number(b);
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a + b;
  }
  return '';
};

/**
 * Returns the average of all numbers in the given array.
 *
 * ```handlebars
 * {{avg "[1, 2, 3, 4, 5]"}}
 * <!-- results in: '3' -->
 * ```
 *
 * @param {Array} `array` Array of numbers to add up.
 * @return {Number}
 */

helpers.avg = function() {
  var args = [].concat.apply([], arguments);
  // remove handlebars options object
  args.pop();
  return helpers.sum(args) / args.length;
};

/**
 * Get the `Math.ceil()` of the given value.
 *
 * @param {Number} `value`
 * @return {Number}
 */

helpers.ceil = function(num) {
  if (isNaN(num)) {
    throw new TypeError('expected a number');
  }
  return Math.ceil(num);
};

/**
 * Divide `a` by `b`
 *
 * @param {Number} `a` numerator
 * @param {Number} `b` denominator
 */

helpers.divide = function(a, b) {
  if (isNaN(a)) {
    throw new TypeError('expected the first argument to be a number');
  }
  if (isNaN(b)) {
    throw new TypeError('expected the second argument to be a number');
  }
  return Number(a) / Number(b);
};

/**
 * Get the `Math.floor()` of the given value.
 *
 * @param {Number} `value`
 * @return {Number}
 */

helpers.floor = function(num) {
  if (isNaN(num)) {
    throw new TypeError('expected a number');
  }
  return Math.floor(num);
};

/**
 * Return the difference of `a` minus `b`.
 *
 * @param {Number} `a`
 * @param {Number} `b`
 */

helpers.minus = function(a, b) {
  if (isNaN(a)) {
    throw new TypeError('expected the first argument to be a number');
  }
  if (isNaN(b)) {
    throw new TypeError('expected the second argument to be a number');
  }
  return Number(a) - Number(b);
};

/**
 * Get the remainder of a division operation.
 *
 * @param {Number} `a`
 * @param {Number} `b`
 * @return {Number}
 */

helpers.modulo = function(a, b) {
  if (isNaN(a)) {
    throw new TypeError('expected the first argument to be a number');
  }
  if (isNaN(b)) {
    throw new TypeError('expected the second argument to be a number');
  }
  return Number(a) % Number(b);
};

/**
 * Return the product of `a` times `b`.
 *
 * @param {Number} `a` factor
 * @param {Number} `b` multiplier
 * @return {Number}
 */

helpers.multiply = function(a, b) {
  if (isNaN(a)) {
    throw new TypeError('expected the first argument to be a number');
  }
  if (isNaN(b)) {
    throw new TypeError('expected the second argument to be a number');
  }
  return Number(a) * Number(b);
};

/**
 * Add `a` by `b`.
 *
 * @param {Number} `a` factor
 * @param {Number} `b` multiplier
 */

helpers.plus = function(a, b) {
  if (isNaN(a)) {
    throw new TypeError('expected the first argument to be a number');
  }
  if (isNaN(b)) {
    throw new TypeError('expected the second argument to be a number');
  }
  return Number(a) + Number(b);
};

/**
 * Generate a random number between two values
 *
 * @param {Number} `min`
 * @param {Number} `max`
 * @return {String}
 */

helpers.random = function(min, max) {
  if (isNaN(min)) {
    throw new TypeError('expected minimum to be a number');
  }
  if (isNaN(max)) {
    throw new TypeError('expected maximum to be a number');
  }
  return utils.random(min, max);
};

/**
 * Get the remainder when `a` is divided by `b`.
 *
 * @param {Number} `a` a
 * @param {Number} `b` b
 */

helpers.remainder = function(a, b) {
  return a % b;
};

/**
 * Round the given number.
 *
 * @param {Number} `number`
 * @return {Number}
 */

helpers.round = function(num) {
  if (isNaN(num)) {
    throw new TypeError('expected a number');
  }
  return Math.round(num);
};

/**
 * Return the product of `a` minus `b`.
 *
 * @param {Number} `a`
 * @param {Number} `b`
 * @return {Number}
 */

helpers.subtract = function(a, b) {
  if (isNaN(a)) {
    throw new TypeError('expected the first argument to be a number');
  }
  if (isNaN(b)) {
    throw new TypeError('expected the second argument to be a number');
  }
  return Number(a) - Number(b);
};

/**
 * Returns the sum of all numbers in the given array.
 *
 * ```handlebars
 * {{sum "[1, 2, 3, 4, 5]"}}
 * <!-- results in: '15' -->
 * ```
 * @param {Array} `array` Array of numbers to add up.
 * @return {Number}
 */

helpers.sum = function() {
  var args = [].concat.apply([], arguments);
  var len = args.length;
  var sum = 0;

  while (len--) {
    if (!isNaN(args[len])) {
      sum += Number(args[len]);
    }
  }
  return sum;
};

/**
 * Multiply number `a` by number `b`.
 *
 * @param {Number} `a` factor
 * @param {Number} `b` multiplier
 * @return {Number}
 */

helpers.times = function() {
  return helpers.multiply.apply(this, arguments);
};
