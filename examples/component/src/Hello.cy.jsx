import Hello from './Hello'

describe('Hello', () => {
  it('shows the greeting', () => {
    cy.mount(<Hello greeting="World" />)
    cy.contains('Hello, World')
  })
})
