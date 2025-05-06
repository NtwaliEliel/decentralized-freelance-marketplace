const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
    },
    configure: (webpackConfig) => {
      webpackConfig.ignoreWarnings = [
        {
          module: /node_modules\/@walletconnect/,
        },
      ];
      return webpackConfig;
    },
  },
}; 