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
  
  return config;
};