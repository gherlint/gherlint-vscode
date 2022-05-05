module.exports = {
    target: 'webworker',
    devtool: 'source-map',
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
