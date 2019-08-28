const { resolve } = require('path')
const webpack = require('webpack')
const pkg = require('./package.json')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

process.env.NODE_ENV = process.env.BUILD_TYPE.startsWith('dev') ? 'development' : 'production'// 根据构建模式设置环境变量

const IsProduction = process.env.NODE_ENV === 'production'

const IsBuildMaster = process.env.BUILD_TYPE.includes('Master')//是否构建主考端
const IsBuildClient = process.env.BUILD_TYPE.includes('Client')//是否构建考试端

let rendererConfig = {
  devtool: 'cheap-module-eval-source-map',
  target: 'electron-renderer',
  mode: process.env.NODE_ENV,
  devServer: {
    port: 9006, historyApiFallback: true, hot: true, https: false, progress: true,
    // stats: {
    //   assets: false,
    //   children: false
    // }
  },
  // stats: 'verbose',
  cache: true,
  entry: {
    app: resolve(__dirname, 'app/index.tsx'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            babelrc: false,
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript',
              '@babel/preset-react',
            ],
            plugins: [
              // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
              ['@babel/plugin-proposal-decorators', { legacy: true }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              '@babel/plugin-syntax-dynamic-import',
              '@babel/plugin-transform-runtime',
              'react-hot-loader/babel',
              ['import', { 'libraryName': 'antd', 'libraryDirectory': 'es', 'style': 'css' }, 'ant'],
            ],
          },
        }
      },
      {
        test: /\.css$/,
        use: [IsProduction ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options:
          {
            limit: 10000,
            name: 'imgs/[name].[ext]'
          }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options:
          {
            limit: 10000,
            name: 'fonts/[name].[ext]'
          }
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
      'process.env.BUILD_TYPE': `"${process.env.BUILD_TYPE}"`,
    }),
    new HtmlWebpackPlugin({
      favicon: `./app/images/Logo.ico`,
      filename: 'index.html',
      template: './app/index.html'
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/), // moment 组件只加载中文
  ],
  output: {
    filename: '[name].js',
    path: resolve(__dirname, './dist'),
    publicPath: `${IsProduction ? '.' : ''}/`
  },
  resolve: {
    alias: {},
    extensions: ['.js', '.json', '.css', '.node', '.ts', '.tsx'],
  }
}
/*if (IsBuildClient) {
  rendererConfig.entry.app = resolve(__dirname, 'app/master/index.tsx')
}*/
/**
 * Adjust rendererConfig for production settings
 */
if (IsProduction) {
  rendererConfig.devtool = false
  rendererConfig.plugins.push(
    new MiniCssExtractPlugin('[name].[hash:8].css')
  )
} else {
  rendererConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
}

module.exports = rendererConfig
