import React from 'react'
import { add } from './calc'

const sum = add(2, 3)

const Hello = ({ greeting }) => (
  <div id="greeting">
    Hello, {greeting}! sum is {sum}
  </div>
)

export default Hello
