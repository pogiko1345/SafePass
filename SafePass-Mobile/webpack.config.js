const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Ensure favicon is copied to build output
  config.plugins.forEach(plugin => {
    if (plugin.constructor.name === 'HtmlWebpackPlugin') {
      plugin.userOptions.favicon = path.resolve(__dirname, 'assets/LogoSapphire.jpg');
    }
  });
  
  return config;
};