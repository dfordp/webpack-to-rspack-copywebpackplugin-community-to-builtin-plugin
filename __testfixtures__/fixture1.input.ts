//chnage the import statement from copy-webpack-plugin to rspack one and track the variable with which it has been intialized
// change the CopyWebpackPlugin to a nested expression of the rspack object
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  //...
  plugins: [
    new CopyWebpackPlugin({
      // ...
    }),
  ],
};