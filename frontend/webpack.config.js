const path = require('path')

var config = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../transitions_gui/static/js')
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}

module.exports = (env, argv) => {
  config.devtool = (argv.mode === 'development') ? 'eval-source-map' : 'source-map'
  return config
}