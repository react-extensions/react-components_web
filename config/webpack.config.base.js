const path = require('path')

function resolve(u) {
  return path.join(__dirname, '../src', u)
}

module.exports = {
  resolve: {
    alias: {
      '@views': resolve('views'),
      '@comps': resolve('components'),
      '@lib': resolve('lib'),
      '@redux': resolve('redux'),
      '@ui': resolve('ui'),
      '@ajax': resolve('ajax'),
      '@style': resolve('style'),
      '@func': resolve('public-func'),
      '@store': resolve('store'),
      '@business': resolve('business-func-extend'),
      
      '@components': resolve('components'),
      '@public': resolve('components/public'),
      '@form': resolve('components/extend-form-comps'),
      '@filter': resolve('components/content-header/filter'),
      '@editor': resolve('components/rich-text-editor')
    },
  },

 
}