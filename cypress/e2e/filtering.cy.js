const { filterSpecsFromCoverage } = require('../../support-utils')

describe('filtering specs', () => {
  it('filters out the config filename', () => {
    const config = cy.stub()
    config.withArgs('specPattern').returns([])
    config.withArgs('configFile').returns('/root/path/cypress.config.js')
    config.withArgs('projectRoot').returns('/')

    const totalCoverage = {
      '/path/to/specA.js': {},
      '/path/to/specB.js': {},
      // the config file should be filtered out
      'cypress.config.js': {},
    }
    const result = filterSpecsFromCoverage(totalCoverage, config)
    expect(result).to.deep.equal({
      '/path/to/specA.js': {},
      '/path/to/specB.js': {},
    })
  })

  it('filters list of specs by single string', () => {
    const config = cy.stub()
    config.withArgs('specPattern').returns(['**/specA.js'])
    config.withArgs('configFile').returns('/root/path/cypress.config.js')
    config.withArgs('projectRoot').returns('/')

    const totalCoverage = {
      '/path/to/specA.js': {},
      '/path/to/specB.js': {},
    }
    const result = filterSpecsFromCoverage(totalCoverage, config)
    expect(result).to.deep.equal({
      '/path/to/specB.js': {},
    })
  })

  it('filters list of specs by pattern', () => {
    const config = cy.stub()
    config.withArgs('specPattern').returns(['**/*B.js'])
    config.withArgs('configFile').returns('/root/path/cypress.config.js')
    config.withArgs('projectRoot').returns('/')

    const totalCoverage = {
      '/path/to/specA.js': {},
      '/path/to/specB.js': {},
    }
    const result = filterSpecsFromCoverage(totalCoverage, config)
    expect(result).to.deep.equal({
      '/path/to/specA.js': {},
    })
  })

  it('filters list of specs by pattern and single spec', () => {
    const config = cy.stub()
    config.withArgs('specPattern').returns(['**/*B.js', '**/specA.js'])
    config.withArgs('configFile').returns('/root/path/cypress.config.js')
    config.withArgs('projectRoot').returns('/')

    const totalCoverage = {
      '/path/to/specA.js': {},
      '/path/to/specB.js': {},
    }
    const result = filterSpecsFromCoverage(totalCoverage, config)
    expect(result, 'all specs have been filtered out').to.deep.equal({})
  })

  it('filters list of specs in integration folder', () => {
    const config = cy.stub()
    config.withArgs('specPattern').returns('**/*.cy.*')
    config.withArgs('configFile').returns('/root/path/cypress.config.js')
    config.withArgs('projectRoot').returns('/')

    const totalCoverage = {
      '/path/to/specA.js': {},
      '/path/to/specB.js': {},
      // these files should be removed
      '/path/to/e2e/spec1.cy.js': {},
      '/path/to/e2e/feature/spec2.cy.js': {},
    }
    const result = filterSpecsFromCoverage(totalCoverage, config)
    expect(result).to.deep.equal({
      '/path/to/specA.js': {},
      '/path/to/specB.js': {},
    })
  })
})
