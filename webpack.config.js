const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const useAlias = process.env.USE_ALIAS;

let alias;
if (useAlias) {
  console.log('Using alias to local grommet.');
  alias = {
    'grommet': path.resolve(__dirname, '../grommet/src/js'),
    'grommet-icons': path.resolve(__dirname, '../grommet-icons/src/js'),
  };
}

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve('./dist'),
    filename: 'grommet-swagger.min.js',
    libraryTarget: 'var',
    library: 'GrommetSwagger',
  },
  resolve: {
    alias,
    extensions: ['.js', '.json'],
  },
  plugins: [
    new CopyWebpackPlugin([
      { from: './README.md' },
      { from: './package.json' },
      { from: './public' },
      { from: './node_modules/highlight.js/styles/github.css' },
    ]),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /markdown-to-jsx/,
        loader: 'babel-loader',
      },
    ],
  },
  devServer: {
    contentBase: './dist',
    historyApiFallback: true,
    hot: true,
    port: 8677,
  },
};
