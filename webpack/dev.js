const _merge = require('lodash.merge')
const _cloneDeep = require('lodash.clonedeep')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

const {
  baseConfig,
  jsLoader,
  fileLoader,
  cssLoader,
  postCssLoader,
  sassLoader,
  htmlWebpackPlugin,
  copyWebpackPlugin,
  environmentPlugin,
  resolve,
  loadEnv
} = require('./common.js')
let config = _cloneDeep(baseConfig)

loadEnv()

_merge(config, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    port: 3000,
    historyApiFallback: true
  },
  output: {
    publicPath: '/'
  },
  module: {
    rules: [
      jsLoader,
      {
        test: /\.(scss)$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          cssLoader,
          postCssLoader,
          sassLoader,
          'import-glob-loader'
        ]
      },
      fileLoader
    ]
  },
  plugins: [
    environmentPlugin,
    htmlWebpackPlugin,
    copyWebpackPlugin,
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css'
    }),
  ],
  resolve
})

module.exports = config