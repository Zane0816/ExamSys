const path = require('path')
const pkg = require('./package.json')
const webpack = require('webpack')

process.env.NODE_ENV = process.env.BUILD_TYPE.startsWith('dev') ? 'development' : 'production'// 根据构建模式设置环境变量

const IsProduction = process.env.NODE_ENV === 'production'

const IsBuildMaster = process.env.BUILD_TYPE.includes('Master')//是否构建主考端
const IsBuildClient = process.env.BUILD_TYPE.includes('Client')//是否构建考试端

let mainConfig = {
  entry: {
    main: path.join(__dirname, 'main/index.ts'),
    worker: path.join(__dirname, 'main/master/worker.ts')
  },
  // externals: Object.keys(pkg.dependencies || {}),
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          cacheDirectory: true,
          babelrc: false,
          presets: [
            '@babel/preset-env',
            '@babel/preset-typescript'
          ],
          plugins: [
            // plugin-proposal-decorators is only needed if you're using experimental decorators in TypeScript
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            '@babel/plugin-syntax-dynamic-import',
            '@babel/plugin-transform-runtime',
          ],
        }
      },
    ]
  },
  cache: true, watch: !IsProduction,
  watchOptions: {
    ignored: '/main/'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: (IsProduction ? path.join(__dirname, 'dist/') : path.join(__dirname, 'app'))
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    })
  ],
  resolve: {
    extensions: ['.js', '.json', '.ts', '.node'],
    modules: [
      path.join(__dirname, 'node_modules')
    ]
  },
  target: 'electron-main',
  mode: process.env.NODE_ENV,
  devtool: 'cheap-module-eval-source-map',
}

if (IsBuildClient) {
  mainConfig.entry.worker = path.join(__dirname, 'main/client/worker.ts')
}
if (IsProduction) {
  mainConfig.devtool = false
}
module.exports = mainConfig
