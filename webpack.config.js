const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => ({
    mode: argv.mode || 'development',
    entry: {
        app: ['./node_modules/leaflet/dist/leaflet.css', './src/assets/scss/_index.scss', './src/index.ts'],
        starter: ['./src/starter.ts'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
        alias: {
            vue$: 'vue/dist/vue.esm.js',
        },
        plugins: [new TsconfigPathsPlugin()],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: [path.resolve(__dirname, 'src')],
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader'
                    },
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    // Creates `style` nodes from JS strings
                    // 'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                includePaths: [ path.resolve(__dirname, 'node_modules') ]
                            },
                        }
                    },
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    // Translates CSS into CommonJS
                    'css-loader'
                ],
            },
            {
                test: /\.(png|svg)$/,
                include: [ path.resolve(__dirname, 'src/assets/images'), path.resolve(__dirname, 'node_modules') ],
                use: [
                    { loader: 'file-loader' }
                ]
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/index.html',
            chunks: [ 'app', 'starter' ],
        }),
        new CopyWebpackPlugin({
            patterns: [
                'src/config.json'
            ],
        })
    ],
});
