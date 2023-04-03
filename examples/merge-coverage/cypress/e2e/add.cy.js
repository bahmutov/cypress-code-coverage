/// <reference types="cypress" />
import { add } from '../../src/math'

it('adds two numbers', () => {
  expect(add(1, 3)).to.equal(4)
  expect(add(2, 3)).to.equal(5)
})
