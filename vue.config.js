module.exports = {
  runtimeCompiler: true,
  configureWebpack: {
    module: {
      rules: [
        {
          test: /Worklet\.js$/,
          loader: 'worklet-loader',
          options: {
            name: 'js/[hash].worklet.js',
            publicPath: '/'
          }
        }
      ]
    }
  }
}

