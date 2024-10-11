export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Handle CommonJS require statements
  root.find(j.VariableDeclarator, {
    init: {
      callee: { name: 'require' },
      arguments: [{ value: 'copy-webpack-plugin' }],
    },
  }).forEach((path) => {
    const localName = path.node.id.name;
    path.node.init.arguments[0].value = '@rspack/core';
    path.node.id.name = 'rspack';
    dirtyFlag = true;

    // Replace new CopyWebpackPlugin with new rspack.CopyRspackPlugin
    root.find(j.NewExpression, {
      callee: { name: localName },
    }).forEach((newPath) => {
      newPath.node.callee = j.memberExpression(
        j.identifier('rspack'),
        j.identifier('CopyRspackPlugin'),
      );
      dirtyFlag = true;
    });
  });

  // Handle ES6 import statements
  root.find(j.ImportDeclaration, {
    source: { value: 'copy-webpack-plugin' },
  }).forEach((path) => {
    const localName = path.node.specifiers[0].local.name;
    path.node.source.value = '@rspack/core';
    path.node.specifiers[0].local.name = 'rspack';
    path.node.specifiers[0].imported = null;
    dirtyFlag = true;

    // Replace new CopyPlugin with new rspack.CopyRspackPlugin
    root.find(j.NewExpression, {
      callee: { name: localName },
    }).forEach((newPath) => {
      newPath.node.callee = j.memberExpression(
        j.identifier('rspack'),
        j.identifier('CopyRspackPlugin'),
      );
      dirtyFlag = true;
    });
  });

  return dirtyFlag ? root.toSource() : undefined;
}

export const parser = 'tsx';