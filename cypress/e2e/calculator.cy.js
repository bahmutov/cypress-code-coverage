import { CalculatorPage } from './calculator-po'

// @ts-ignore
import { createInstrumenter } from 'istanbul-lib-instrument'

const instrumenter = createInstrumenter({
  esModules: true,
  compact: false,
  preserveComments: true,
})

const baseUrl = Cypress.config('baseUrl')
// @ts-ignore
const proxyServer = Cypress.config('proxyServer') + '/'

it(
  'collects code coverage on the fly',
  { viewportWidth: 1200, viewportHeight: 1000, baseUrl: null },
  () => {
    cy.intercept(
      {
        method: 'GET',
        resourceType: 'script',
      },
      (req) => {
        // TODO: remove caching headers for now
        // @ts-ignore
        req.continue((res) => {
          const relativeUrl = req.url
            // @ts-ignore
            .replace(baseUrl, '')
            .replace(proxyServer, '')
          console.log('instrumenting', relativeUrl)

          // @ts-ignore
          const instrumented = instrumenter.instrumentSync(
            res.body,
            relativeUrl,
          )
          res.body = instrumented
          return res
        })
      },
    )
    cy.visit('cypress/calculator/index.html')
    // after instrumenting the coverage should be collected in the window object
    // under window.__coverage__ key
    // There should be two keys: one for the main script and one for the spec
    cy.window()
      .should('have.property', '__coverage__')
      .should('have.keys', [
        'cypress/calculator/app.js',
        'cypress/calculator/utils.js',
      ])

    // compute an expression and see the increased code coverage
    CalculatorPage.compute('1+2.1', '3.1')
  },
)
