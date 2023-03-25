/// <reference types="cypress" />
it('works', () => {
  cy.visit('/')
  cy.contains('Page body')

  cy.window().invoke('reverse', 'super').should('equal', 'repus')
})

it('uses minimatch', () => {
  expect(Cypress.minimatch('/path/to/file.js', 'to/*.js'), 'relative').to.be
    .false
  expect(Cypress.minimatch('/path/to/file.js', '/path/to/*.js'), 'absolute').to
    .be.true
  expect(Cypress.minimatch('/path/to/file.js', '**/to/*.js'), '** prefix').to.be
    .true
  cy.wrap(Cypress)
    .invoke({ timeout: 0 }, 'minimatch', '/path/to/file.js', '**/to/*.js')
    .should('be.true')
})
