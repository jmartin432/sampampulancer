const htmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  runtimeCompiler: true,
  configureWebpack: {
    plugins: [
      new htmlWebpackPlugin({  // Also generate a test.html
        title: 'Sampampulancer',
        template: './public/index.html',
        favicon: './public/favicon.ico'
      })
    ],
    module: {
      rules: [
        {
          test: /Worklet\.js$/,
          loader: 'worklet-loader',
          options: {
            name: 'js/[hash].worklet.js',
            publicPath: '/public/modules/'
          }
        }
      ]
    }
  }
}

