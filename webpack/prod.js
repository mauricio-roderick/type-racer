const workingDir = process.cwd()
const path = require('path')
const _set = require('lodash.set')
const _merge = require('lodash.merge')
const _cloneDeep = require('lodash.clonedeep')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const TerserPlugin = require("terser-webpack-plugin")

const dirName = 'build'

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

const prodCssLoader = _set(_cloneDeep(cssLoader), 'options.modules.localIdentName', '[hash:base64:5]')

_merge(config, {
  mode: 'production',
  devtool: 'source-map',
  output: {
    path: path.resolve(workingDir, dirName),
    publicPath: '/'
  },
  module: {
    rules: [
      jsLoader,
      fileLoader,
      {
        test: /\.(scss)$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          prodCssLoader,
          postCssLoader,
          sassLoader,
          'import-glob-loader'
        ]
      }
    ]
  },
  plugins: [
    environmentPlugin,
    htmlWebpackPlugin,
    copyWebpackPlugin,
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css'
    }),
    new TerserPlugin({ 
      sourceMap: true,
      parallel: true
    })
  ],
  resolve
})

module.exports = config