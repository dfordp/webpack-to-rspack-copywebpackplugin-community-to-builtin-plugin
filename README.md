Handles the migration of the CopyWebpackPlugin web pack plug into an included plugin in rspack.

### Before

```ts
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
```

### After

```ts
const rspack = require('@rspack/core');

module.exports = {
  //...
  plugins: [
    new rspack.CopyRspackPlugin({
      // ...
    }),
  ],
};
```
,This codemod turns X into Y. It also does Z.
Note: this is a contrived example. Please modify it.

### Before

```ts
//handle for es6 module import

import CopyPlugin from 'copy-webpack-plugin';

module.exports = {
  //...
  plugins: [
    new CopyPlugin({
      // ...
    }),
  ],
};
```

### After

```ts
import rspack from '@rspack/core';

module.exports = {
  //...
  plugins: [
    new rspack.CopyRspackPlugin({
      // ...
    }),
  ],
};
```

