/// <reference types="cypress" />
describe('first page', () => {
  it('loads', () => {
    cy.visit('/').should('have.property', '__coverage__')
  })
})
