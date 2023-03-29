import Hello from './Hello'

describe('Hello', () => {
  it('shows the greeting', () => {
    cy.mount(<Hello greeting="World" />)
    cy.contains('Hello, World').should('include.text', 'sum is 5')
  })
})
