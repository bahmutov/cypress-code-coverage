/// <reference types="cypress" />
import { sub } from '../../src/math'

it('subtracts two numbers', () => {
  expect(sub(2, 3)).to.equal(-1)
})
