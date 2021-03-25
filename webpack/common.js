const fs = require('fs')
const dotenv = require('dotenv')
const path = require('path')
const webpack = require('webpack')
const _get = require('lodash.get')
const workingDir = process.cwd()
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin')

const packageInfo = require('../package.json')
const envPath = path.join(workingDir, '.config/.env')
const env = dotenv.parse(fs.readFileSync(envPath))

exports.loadEnv = () => {
  process.env.APP_VERSION = packageInfo.version;
  dotenv.config({ path: envPath });
}

exports.environmentPlugin = new webpack.EnvironmentPlugin([
  'ENV', 'APP_NAME', 'PLATFORM_API_URL', 'SENTRY_DSN', 'APP_VERSION'
]);

exports.htmlWebpackPlugin = new HtmlWebpackPlugin({
  template: path.join(workingDir, './src/index.html'),
  templateParameters: {
    title: env.APP_NAME
  }
})

exports.copyWebpackPlugin = new CopyWebpackPlugin([{ 
  from: 'node_modules/antd/dist/antd.min.css', 
  to: 'antd.min.css'
}]);

exports.jsLoader = {
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  loader: [{
    loader: 'babel-loader',
  }, {
    loader: 'eslint-loader'
  }]
}

exports.cssLoader = {
  loader: 'css-loader',
  options: {
    sourceMap: true,
    importLoaders: 1,
    modules: {
      localIdentName: '[name]--[local]--[hash:base64:5]'
    }
  }
}

exports.postCssLoader = {
  loader: 'postcss-loader',
  options: {
    config: {
      path: path.resolve(workingDir, '.config/postcss.config.js')
    }
  }
}

exports.sassLoader = {
  loader: 'sass-loader'
}

exports.fileLoader = {
  test: /\.(woff|woff2|eot|ttf|otf|svg|png|jpg|jpeg)$/,
  use: [
    {
      loader: 'file-loader',
    }
  ]
}

exports.baseConfig = {
  entry: ['core-js', './src/index.js'],
  output: {
    chunkFilename: 'chunks/[name].[chunkhash].js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 10000
    }
  },
  resolve: {
    extensions: [".js", ".jsx", ".css", ".json"]
  }
}

exports.resolve = {
  alias: {
    '@node_modules': path.resolve(workingDir, 'node_modules/'),
    '@helpers': path.resolve(workingDir, 'src/helpers/'),
    '@providers': path.resolve(workingDir, 'src/providers/'),
    '@config': path.resolve(workingDir, 'src/config/'),
    '@services': path.resolve(workingDir, 'src/services/'),
    '@components': path.resolve(workingDir, 'src/components/'),
    '@containers': path.resolve(workingDir, 'src/containers/'),
    '@assets': path.resolve(workingDir, 'src/assets/')
  }
}
