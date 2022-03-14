/// <reference types="cypress" />
describe('second page', () => {
  it('loads', () => {
    cy.visit('/second.html').should('have.property', '__coverage__')
  })
})
