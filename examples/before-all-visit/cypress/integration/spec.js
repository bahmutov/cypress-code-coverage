/// <reference types="cypress" />
describe(
  'coverage information',
  { testIsolation: false, viewportHeight: 100, viewportWidth: 100 },
  () => {
    before(() => {
      cy.log('visiting index.html')
      cy.visit('index.html')
    })

    it('calls add', () => {
      cy.window().invoke('add', 2, 3).should('equal', 5)
    })

    it('calls sub', () => {
      cy.window().invoke('sub', 2, 3).should('equal', -1)
    })
  },
)
