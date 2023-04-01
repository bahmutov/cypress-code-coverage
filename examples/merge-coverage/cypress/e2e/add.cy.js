/// <reference types="cypress" />
import { add } from '../../src/math'

it('adds two numbers', () => {
  expect(add(2, 3)).to.equal(5)
})
