const path = require('path');
const { merge } = require('webpack-merge');
const common = require('../webpack');

module.exports = merge(common, {
    entry: './src/extension.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
    },
    externals: {
        vscode: 'commonjs vscode',
    },
    optimization: {
        // minimizer: [new MinifyJsPlugin()],
    },
});
