// webpack.config.js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // This is the key fix - ignore the AsyncStorage resolution error
  config.resolve.fullySpecified = false;

  // Add fallback for AsyncStorage on web
  config.resolve.alias = {
    ...config.resolve.alias,
    '@react-native-async-storage/async-storage': false,
  };

  // OneDrive/Windows can lock files in the output folder and crash the clean step.
  // Removing this plugin avoids EPERM unlink failures during `expo export:web`.
  if (process.platform === 'win32') {
    config.plugins = config.plugins.filter(
      (plugin) => plugin?.constructor?.name !== 'CleanWebpackPlugin',
    );
  }

  return config;
};
