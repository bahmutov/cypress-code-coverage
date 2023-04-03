module.exports = (on, config) => {
  require('../../../../plugin')(on, config)
  on('file:preprocessor', require('../../../../use-babelrc'))
  return config
}
