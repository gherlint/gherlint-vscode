module.exports = {
    target: 'webworker',
    devtool: 'source-map',
    resolve: {
        extensions: ['.js'],
        fallback: {
            minimatch: require.resolve('minimatch'),
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
