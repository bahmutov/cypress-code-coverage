/**
 * Adds two numbers together
 * @param {number} a
 * @param {number} b
 */
export const add = (a, b) => {
  console.log('add %d to %d', a, b)
  if (a === 2) {
    console.log('a is 2')
  }
  return a + b
}

/**
 * subtracts numbers
 * @param {number} a
 * @param {number} b
 */
export const sub = (a, b) => {
  console.log('sub %d to %d', a, b)
  return a - b
}
