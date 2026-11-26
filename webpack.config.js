import path from "node:path";
import { fileURLToPath } from 'node:url';
import WorkboxPlugin from "workbox-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',
  experiments: {
    css: true,
    html: true,
  },
  devServer: {
    hot: true,
  },
  entry: './src/index.html',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node-modules/,
      },
      {
        test: /\.(ico|png)$/,
        type: 'asset/resource',
      },
      {
        test: /sw\.js$/,
        type: 'asset/resource',
      },
      {
        test: /\.css$/i,
        type: 'css/auto',
        mimetype: 'text/css',
      },
      {
        mimetype: 'image/svg+xml',
        scheme: 'data',
        type: 'asset/resource',
        generator: {
          filename: 'icons/[hash].svg'
        }
      }
    ]
  },
  devtool: 'inline-source-map',
  resolve: {
    extensions: ['.css', '.ts', '.tsx', '.js', '.json', '.ico'],
  },
  plugins: [
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
    }),
  ],
  output: {
    html: {
      title: 'Bibbit',
      favicon: {
        icon: [
          { href: './src/images/favicon-16x16.png', sizes: '16x16' },
          { href: './src/images/favicon-32x32.png', sizes: '32x32' },
        ],
      },
      manifest: './src/manifest.json'
    },
    filename: '[name].js',
    cssFilename: '[name].[contenthash].css',
    cssChunkFilename: '[id].[contenthash].css',
    htmlFilename: 'index.html',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  optimization: {
    minimize: {
      javascript: {
        compress: {
          drop_console: true,
          pure_funcs: ['assert'],
          global_defs: { DEBUG: false },
        }
      },
    },
    mangleWasmImports: true,
    runtimeChunk: true,
  },
}
