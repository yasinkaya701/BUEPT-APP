const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const projectRoot = path.resolve(__dirname, '..');
const appIndex = path.resolve(projectRoot, 'web-rnw/index.web.js');

const modulePathsToTranspile = [
  path.resolve(projectRoot, 'src'),
  path.resolve(projectRoot, 'web-rnw'),
  path.resolve(projectRoot, 'node_modules/@react-native'),
  path.resolve(projectRoot, 'node_modules/react-native-gesture-handler'),
  path.resolve(projectRoot, 'node_modules/react-native-screens'),
  path.resolve(projectRoot, 'node_modules/react-native-safe-area-context'),
  path.resolve(projectRoot, 'node_modules/@react-navigation'),
  path.resolve(projectRoot, 'node_modules/react-native-reanimated'),
  path.resolve(projectRoot, 'node_modules/react-native-vector-icons'),
  path.resolve(projectRoot, 'node_modules/react-native-webview'),
  path.resolve(projectRoot, 'node_modules/react-native-web'),
];

module.exports = (env = {}, argv = {}) => {
  const mode = argv.mode || 'development';
  const isProd = mode === 'production';
  const publicPath = env.publicPath || process.env.WEB_PUBLIC_PATH || '/';

  return {
    mode,
    context: projectRoot,
    entry: {
      app: appIndex,
    },
    output: {
      path: path.resolve(projectRoot, 'web-rnw/dist'),
      publicPath,
      filename: isProd ? '[name].[contenthash:8].js' : '[name].js',
      clean: true,
    },
    resolve: {
      extensions: ['.web.js', '.js', '.jsx', '.json', '.ts', '.tsx'],
      alias: {
        'react-native$': 'react-native-web',
        'react-native-tts': path.resolve(projectRoot, 'web-rnw/shims/react-native-tts.js'),
        '@react-native-voice/voice': path.resolve(projectRoot, 'web-rnw/shims/react-native-voice.js'),
        'react-native-image-picker': path.resolve(projectRoot, 'web-rnw/shims/react-native-image-picker.js'),
        'react-native-linear-gradient': path.resolve(projectRoot, 'web-rnw/shims/react-native-linear-gradient.js'),
        'react-native-webview': path.resolve(projectRoot, 'web-rnw/shims/react-native-webview.js'),
        'react-native-reanimated': path.resolve(projectRoot, 'web-rnw/shims/react-native-reanimated.js'),
        'react-native-vector-icons/Ionicons': path.resolve(projectRoot, 'web-rnw/shims/react-native-vector-icons-ionicons.js'),
      },
      fallback: {
        fs: false,
        path: false,
        crypto: false,
      },
    },
    module: {
      rules: [
        {
          test: /\.[jt]sx?$/,
          include: modulePathsToTranspile,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: ['module:@react-native/babel-preset'],
              plugins: ['@babel/plugin-transform-export-namespace-from'],
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][hash][ext]'
          }
        },
        {
          test: /\.(json)$/i,
          type: 'json',
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(!isProd),
        'process.env.NODE_ENV': JSON.stringify(mode),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(projectRoot, 'web-rnw/index.html'),
      }),
    ],
    devServer: {
      static: {
        directory: path.resolve(projectRoot, 'web-rnw/dist'),
      },
      historyApiFallback: true,
      host: '0.0.0.0',
      port: 8090,
      hot: true,
      client: {
        overlay: true,
      },
    },
    performance: {
      hints: false,
    },
    stats: 'minimal',
  };
};
