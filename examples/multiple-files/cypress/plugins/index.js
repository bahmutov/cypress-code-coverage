const NYC = require('nyc')
const nyc = new NYC({
  cwd: process.cwd(),
  reporter: 'text',
})

module.exports = (on, config) => {
  require('../../../../task')(on, config)
  on('file:preprocessor', require('../../../../use-babelrc'))

  on('after:spec', (t) => {
    console.log('after spec %s', t.relative)
    return nyc.report()
  })

  return config
}
