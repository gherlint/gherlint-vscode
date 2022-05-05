module.exports = {
    mode: 'development',
    target: 'webworker',
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
