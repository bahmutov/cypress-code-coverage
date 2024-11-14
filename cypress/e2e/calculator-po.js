function enterExpression(expression) {
  cy.log(`Entering expression "**${expression}**"`)
  expression.split('').forEach((char) => {
    cy.contains('#buttons button', char, { log: false }).click({
      log: false,
    })
  })
}

export const CalculatorPage = {
  visit() {
    cy.visit('public/index.html')
  },

  /**
   * @param {string} expression to enter into the calculator, like "1+2+3"
   */
  enterExpression,

  /**
   * @param {string} expression to be evaluated, like "1+2"
   * @param {string} expectedResult the expected result, like "3"
   */
  compute(expression, expectedResult) {
    enterExpression(expression)
    cy.contains('#buttons button', '=', { log: false }).click({
      log: false,
    })
    cy.get('#display').should('have.text', expectedResult)
    return this
  },

  clear() {
    cy.log('**clearing the calculator**')
    cy.contains('#buttons button', 'C', { log: false }).click({
      log: false,
    })
    return this
  },

  /**
   * @param {string[]} items list of history items to check
   */
  checkHistory(...items) {
    cy.log(`**checking history with ${items.length} items**`)
    cy.get('#history li', { log: false }).should('have.length', items.length)
    items.forEach((item, k) => {
      cy.get('#history li', { log: false })
        .eq(k, { log: false })
        .should('have.text', item)
    })
  },
}
