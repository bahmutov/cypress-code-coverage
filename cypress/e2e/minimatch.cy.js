describe('minimatch', () => {
  it('string matches', () => {
    expect(
      Cypress.minimatch('/path/to/specA.js', '/path/to/specA.js'),
      'matches full strings',
    ).to.be.true

    expect(
      Cypress.minimatch('/path/to/specA.js', 'specA.js'),
      'does not match just the end',
    ).to.be.false

    expect(
      Cypress.minimatch('/path/to/specA.js', '**/specA.js'),
      'matches using **',
    ).to.be.true
  })
})
