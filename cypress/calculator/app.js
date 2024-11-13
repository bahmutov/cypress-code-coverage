// calculator logic

import { appendDot } from './utils.js'

// the current list of history entries
const history = []

// on page visit
// load the last expression from the localStorage (if any)
// use the local storage key "calculator_data"
try {
  const data = JSON.parse(localStorage.getItem('calculator_data'))
  if (data.version === 'v1') {
    const lastExpression = data.expression
    if (lastExpression) {
      document.getElementById('display').innerText = lastExpression
      // push the last expression to the history
      const historyListElement =
        document.getElementById('history-list')
      historyListElement.innerHTML = `<li>${lastExpression}=${lastExpression}</li>`
      history.push(`${lastExpression}=${lastExpression}`)
      // save the migrated data into the localStorage
      const migratedData = {
        version: 'v2',
        expression: lastExpression,
        history,
      }
      localStorage.setItem(
        'calculator_data',
        JSON.stringify(migratedData),
      )
    }
  } else if (data.version === 'v2') {
    // set the DOM elements based on the data stored in the item
    // - expression
    // - history items
    const lastExpression = data.expression
    if (lastExpression) {
      document.getElementById('display').innerText = lastExpression
    }
    if (Array.isArray(data.history)) {
      const historyListElement =
        document.getElementById('history-list')
      historyListElement.innerHTML = data.history
        .map((item) => `<li>${item}</li>`)
        .join('\n')
      history.length = 0
      history.push(...data.history)
    }
  }
} catch {
  // ignore serialization errors
}

// we probably want to keep around the reference to the
// LI element with ID "history-list" to append new history items
const historyListElement = document.getElementById('history-list')

/**
 * Function that receives a digit to append to the currently displayed text
 * @param {number|'+'|'-'|'*'|'/'} digit A single digit to append to the display text
 */
function enterDigit(digit) {
  const display = document.getElementById('display')

  if (digit === '.') {
    // special logic for adding the "." character
    display.innerText = appendDot(display.innerText)
  } else {
    display.innerText += digit
  }

  // store the current expression in the localStorage
  const data = {
    version: 'v2',
    expression: display.innerText,
    history,
  }
  localStorage.setItem('calculator_data', JSON.stringify(data))
}

/**
 * Compute the current display text as a JavaScript arithmetic expression
 * using the `eval` function and replace the display text with the result
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
 */
function calculate() {
  const display = document.getElementById('display')
  const expression = display.innerText

  // check the expression to be a simple numerical expression
  // without any extra characters
  // we only allow the following characters
  // digits, "+", "-", "*", "/", "."
  if (!/^[\d\-\+\*\/\.]+?$/.test(expression)) {
    display.innerText = 'INVALID'
    return
  }

  try {
    const result = eval(expression)
    display.innerText = result
  } catch (err) {
    display.innerText = 'ERROR'
    // after 1 second, put the original
    // expression back in the display
    setTimeout(() => {
      display.innerText = expression
    }, 1000)
  }

  // append the new expression and result to the history list
  const historyItem = `${expression}=${display.innerText}`
  historyListElement.innerHTML += `<li>${historyItem}</li>`
  // store the history in the localStorage
  history.push(historyItem)

  // store the current expression in the localStorage
  const data = {
    version: 'v2',
    expression: display.innerText,
    history,
  }
  localStorage.setItem('calculator_data', JSON.stringify(data))
}

/**
 * Clears the current display text
 */
function clearDisplay() {
  const display = document.getElementById('display')
  display.innerText = ''
}

// attach event handlers
// - button calculate should call the calculate function
// - button clear should call the clearDisplay function
// - all digit buttons should call the enterDigit function
document
  .querySelector('#buttons button[title=calculate]')
  .addEventListener('click', calculate)
document
  .querySelector('#buttons button[title="clear display"]')
  .addEventListener('click', clearDisplay)
document
  .querySelectorAll('#buttons button[title="enter digit"]')
  .forEach((button) => {
    button.addEventListener('click', (e) => {
      // get the character from the event target
      const digit = e.target.innerText
      enterDigit(digit)
    })
  })
