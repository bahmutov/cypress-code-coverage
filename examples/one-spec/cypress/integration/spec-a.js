/// <reference types="cypress" />
it('spec a', () => {
  cy.visit('index.html')
  cy.contains('Page body')

  cy.window().invoke('add', 2, 3).should('equal', 5)

  cy.window().invoke('sub', 2, 3).should('equal', -1)
})

it('goes to another origin', () => {
  cy.visit('index.html')
  cy.get('a[title="another site"]').click()
})
