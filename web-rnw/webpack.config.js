const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const projectRoot = path.resolve(__dirname, '..');
const appIndex = path.resolve(projectRoot, 'web-rnw/index.web.js');
const processPolyfill = path.resolve(projectRoot, 'web-rnw/polyfills/process.js');

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
  // Variant support: WEB_VARIANT=buept|odtu builds fully separate editions.
  // Each variant gets its own output dir and public path, so they can be
  // deployed as independent GitHub Pages sites.
  const variant = process.env.WEB_VARIANT || 'buept';
  const distDir = env.distDir || (variant === 'odtu' ? path.resolve(projectRoot, 'web-rnw/dist-odtu') : path.resolve(projectRoot, 'web-rnw/dist'));
  // publicPath: explicit override (web:rnw:build sets /BUEPT-APP/ for the
  // BUEPT edition which GitHub Pages serves under the repo-name base path
  // /BUEPT-APP/). The ODTÜ edition deploys to its own repo
  // (BUEPT-ODTU), whose Pages base path is /BUEPT-ODTU/ — set via
  // WEB_PUBLIC_PATH=/BUEPT-ODTU/ in that repo's build, or / for the default.
  const publicPath = env.publicPath || process.env.WEB_PUBLIC_PATH || '/BUEPT-APP/';
  const devHost = process.env.WEB_DEV_HOST || '127.0.0.1';
  const devPort = Number(process.env.WEB_DEV_PORT || 8090);

  return {
    mode,
    context: projectRoot,
    entry: {
      app: [processPolyfill, appIndex],
    },
    output: {
      path: distDir,
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
        'react-native-vector-icons/MaterialCommunityIcons': path.resolve(projectRoot, 'web-rnw/shims/react-native-vector-icons-mci.js'),
        '@react-native-async-storage/async-storage': path.resolve(projectRoot, 'web-rnw/shims/async-storage.js'),
        '../dev/SimulatorSmokeRunner': path.resolve(projectRoot, 'web-rnw/shims/simulator-smoke-runner.js'),
        './dev/SimulatorSmokeRunner': path.resolve(projectRoot, 'web-rnw/shims/simulator-smoke-runner.js'),
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
          // Some RN ecosystem packages ship mixed CJS/ESM metadata.
          // Force auto mode so `exports`/`module.exports` and ESM both work.
          type: 'javascript/auto',
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
          test: /\.(png|jpe?g|gif|svg|webp)$/i,
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
        __APP_VARIANT__: JSON.stringify(variant),
        __OG_TITLE__: JSON.stringify(variant === 'odtu' ? 'ODTÜ-EPE Hazırlık — ODTÜ İYS/YDS Platformu' : 'BUEPT Hazırlık — Boğaziçi YADYÖK Platformu'),
        __OG_DESCRIPTION__: JSON.stringify(variant === 'odtu' ? 'ODTÜ İYS (İngilizce Yeterlilik Sınavı) hazırlığın tek platformu: dinleme, okuma, not alma ve yazma. AI puanlamayla gerçek sınavdan önce her bölümü provaya al.' : 'BUSEPT\'e hazırlığın tek platformu. Resmi sınavın birebir replikası: dinleme, okuma ve iki essay. AI puanlamayla gerçek sınavdan önce her bölümü provaya al.'),
      }),
      new HtmlWebpackPlugin({
        template: path.resolve(projectRoot, 'web-rnw/index.html'),
        templateParameters: {
          // Variant-aware SEO shell: meta/title/og tags get variant-specific
          // strings while the JS bundle defines the runtime constants.
          TITLE: variant === 'odtu' ? 'ODTÜ-EPE Prep | ODTÜ İYS English Proficiency Practice' : 'BUSEPT Exam Prep | Boğaziçi University English Proficiency Test Practice App',
          META_TITLE: variant === 'odtu' ? 'ODTÜ-EPE Prep | ODTÜ İYS English Proficiency Practice' : 'BUSEPT Exam Prep | Boğaziçi University English Proficiency Test Practice App',
          META_DESCRIPTION: variant === 'odtu' ? 'Free ODTÜ İYS (English Proficiency Exam) preparation: official-format mock exams with listening, reading, note-taking, writing and speaking, AI scoring, and adaptive study plans.' : 'Free BUSEPT (Boğaziçi University English Proficiency Test) preparation app: official-format mock exams, WASC rubric-based AI writing feedback with scored sample essays, reading, listening, grammar, vocabulary with spaced repetition, and adaptive study plans.'
        },
      }),
      new HtmlWebpackPlugin({
        filename: '404.html',
        template: path.resolve(projectRoot, 'web-rnw/index.html'),
        templateParameters: {
          TITLE: variant === 'odtu' ? 'ODTÜ-EPE Prep | ODTÜ İYS English Proficiency Practice' : 'BUSEPT Exam Prep | Boğaziçi University English Proficiency Test Practice App',
          META_TITLE: variant === 'odtu' ? 'ODTÜ-EPE Prep | ODTÜ İYS English Proficiency Practice' : 'BUSEPT Exam Prep | Boğaziçi University English Proficiency Test Practice App',
          META_DESCRIPTION: variant === 'odtu' ? 'Free ODTÜ İYS (English Proficiency Exam) preparation: official-format mock exams with listening, reading, note-taking, writing and speaking, AI scoring, and adaptive study plans.' : 'Free BUSEPT (Boğaziçi University English Proficiency Test) preparation app: official-format mock exams, WASC rubric-based AI writing feedback with scored sample essays, reading, listening, grammar, vocabulary with spaced repetition, and adaptive study plans.'
        },
      }),
    ],
    devServer: {
      static: {
        directory: path.resolve(projectRoot, 'web-rnw/dist'),
      },
      historyApiFallback: true,
      host: devHost,
      port: devPort,
      hot: true,
      proxy: [
        {
          context: ['/api'],
          target: process.env.WEB_API_PROXY_TARGET || 'http://127.0.0.1:8088',
          changeOrigin: true,
          secure: false,
        },
      ],
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
