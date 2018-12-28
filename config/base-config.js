const path = require('path')
function resolve(src) {
  return path.join(__dirname, '../src', src)
}

module.exports = {
  resolve: {
    alias: {
      '@comps': resolve('components'),
      '@views': resolve('views'),
      '@styles': resolve('styles'),
      '@lib': resolve('lib'),
      '@app-lib': resolve('app-lib'),
      '@ui': resolve('ui'),
      '@icon': resolve('components/icon'),
      '@store': resolve('store'),
      '@assets': resolve('assets'),
    }
  }
}