const path = require('path');

module.exports = {
  devtool: 'eval',
  entry: [
    path.resolve(__dirname, 'dist', 'main.js')
  ],
  externals: {
    react: 'React',
    reactDOM: 'ReactDOM'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    library: 'components',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
