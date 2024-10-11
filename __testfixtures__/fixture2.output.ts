import rspack from '@rspack/core';

module.exports = {
  //...
  plugins: [
    new rspack.CopyRspackPlugin({
      // ...
    }),
  ],
};