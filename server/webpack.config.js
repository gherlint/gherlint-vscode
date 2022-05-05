const path = require('path');
const { merge } = require('webpack-merge');
const common = require('../webpack');

module.exports = merge(common, {
    entry: './src/server.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'server.js',
        libraryTarget: 'commonjs2',
    },
    optimization: {
        // minimizer: [new MinifyJsPlugin()],
    },
});
