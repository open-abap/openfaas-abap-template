const path = require('path');

module.exports = {
  mode: 'development',
  context: path.resolve(__dirname, '.'),
  devtool: 'nosources-source-map',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, "build"),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.abap$/,
        use: [
          {
            loader: path.resolve('abap_loader.js')
          }
        ]
      }
    ],
  },
}