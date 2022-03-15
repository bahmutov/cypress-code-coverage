module.exports = (on, config) => {
  require('../../../../plugin')(on, config)
  // do not instrument the spec files
  // on('file:preprocessor', require('../../../../use-babelrc'))
  return config
}
