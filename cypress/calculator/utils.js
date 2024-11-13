// pure functions used during computation

export function appendDot(expression) {
  // check if we are trying a number right now
  // this will split expressions like
  // "1+2.3" into ["1", "2.3"]
  const parts = expression.split(/[\+\-\*\/]/)
  // the last part is the current number
  // the user is appending to
  const last = parts[parts.length - 1]
  //
  // if the last part already has a dot, do nothing
  if (last.includes('.')) {
    return expression
  }
  // if the last part is empty, add a zero before the dot
  // this will cover starting to type a number with a dot
  // or typing a dot after an expression like "1+"

  if (last === '') {
    return expression + '0.'
  }
  // otherwise, add the dot and return the expression
  return expression + '.'
}
