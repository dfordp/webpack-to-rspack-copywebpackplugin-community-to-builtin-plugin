const rspack = require('@rspack/core');

module.exports = {
  //...
  plugins: [
    new rspack.CopyRspackPlugin({
      // ...
    }),
  ],
};