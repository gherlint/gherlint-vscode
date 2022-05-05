const path = require('path');

module.exports = {
    mode: 'development',
    target: 'node',
    entry: {
        client: './client/src/extension.js',
        server: './server/src/server.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: 'commonjs2',
        },
        devtoolModuleFilenameTemplate: '../[resource-path]',
    },
    externals: {
        vscode: 'commonjs vscode',
    },
    resolve: {
        mainFields: ['browser', 'module', 'main'],
        extensions: ['.js'],
        fallback: {
            path: require.resolve('path-browserify'),
        },
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                ],
            },
        ],
    },
};
