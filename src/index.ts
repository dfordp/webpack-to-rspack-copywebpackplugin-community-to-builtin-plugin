export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Set of supported plugins, including partially supported ones
  const supportedPlugins = new Set([
      'BannerPlugin',
      'DefinePlugin',
      'EnvironmentPlugin',
      'HotModuleReplacementPlugin',
      'IgnorePlugin',
      'LimitChunkCountPlugin',
      'ModuleFederationPlugin',
      'NormalModuleReplacementPlugin',
      'ProvidePlugin',
      'SourceMapDevToolPlugin',
      'NodeTemplatePlugin',
      'NodeTargetPlugin',
      'ElectronTargetPlugin',
      'EnableChunkLoadingPlugin',
      'EnableLibraryPlugin',
      'EnableWasmLoadingPlugin',
      'ExternalsPlugin',
      'FetchCompileAsyncWasmPlugin',
      'EvalSourceMapDevToolPlugin',
      'ModuleConcatenationPlugin',
      'NoEmitOnErrorsPlugin',
      'NodeEnvironmentPlugin',
      'WebWorkerTemplatePlugin',
      'EvalDevToolModulePlugin',
      'APIPlugin',
      'ConstPlugin',
      'CommonJsPlugin',
      'MergeDuplicateChunksPlugin',
      'RemoveEmptyChunksPlugin',
      'ConsumeSharedPlugin',
      'ContainerPlugin',
      'ContainerReferencePlugin',
      'EntryOptionPlugin',
      'JavascriptModulesPlugin',
      'LoaderOptionsPlugin',
      'NaturalChunkIdsPlugin',
      'NaturalModuleIdsPlugin',
      'RuntimeChunkPlugin',
      'SideEffectsFlagPlugin',
      // Partially supported plugins
      'ProgressPlugin',
      'SplitChunksPlugin',
      'EntryPlugin',
      'RealContentHashPlugin',
      'DeterministicChunkIdsPlugin',
      'DeterministicModuleIdsPlugin',
      'DynamicEntryPlugin',
      'NamedChunkIdsPlugin',
      'NamedModuleIdsPlugin',
      'ProvideSharedPlugin',
  ]);

  // Replace `webpack` with `rspack` in require statements
  root.find(j.VariableDeclarator, {
      id: { name: 'webpack' },
      init: {
          callee: { name: 'require' },
          arguments: [{ value: 'webpack' }],
      },
  }).forEach((path) => {
      path.node.id.name = 'rspack';
      path.node.init.arguments[0].value = '@rspack/core';
      dirtyFlag = true;
  });

  // Replace `import webpack from 'webpack';` with `import rspack from '@rspack/core';`
  root.find(j.ImportDeclaration, {
      source: { value: 'webpack' },
  }).forEach((path) => {
      path.node.source.value = '@rspack/core';
      path.node.specifiers.forEach((specifier) => {
          if (specifier.local.name === 'webpack') {
              specifier.local.name = 'rspack';
          }
      });
      dirtyFlag = true;
  });

  // Handle destructured require statements like `const { ProvidePlugin } = require('webpack');`
  root.find(j.VariableDeclarator, {
      init: {
          callee: { name: 'require' },
          arguments: [{ value: 'webpack' }],
      },
  }).forEach((path) => {
      if (j.ObjectPattern.check(path.node.id)) {
          path.node.init.arguments[0].value = '@rspack/core';
          path.node.id.properties.forEach((property) => {
              if (supportedPlugins.has(property.key.name)) {
                  dirtyFlag = true;
              }
          });
      }
  });

  // Replace `new ProvidePlugin({})` with `new rspack.ProvidePlugin({})`
  root.find(j.NewExpression, {
      callee: {
          name: (name) => supportedPlugins.has(name),
      },
  }).forEach((path) => {
      if (supportedPlugins.has(path.node.callee.name)) {
          path.node.callee = j.memberExpression(
              j.identifier('rspack'),
              j.identifier(path.node.callee.name),
          );
          dirtyFlag = true;
      }
  });

  // Replace `new webpack.*Plugin` with `new rspack.*Plugin` for supported plugins
  root.find(j.NewExpression, {
      callee: {
          object: { name: 'webpack' },
          property: { name: (name) => supportedPlugins.has(name) },
      },
  }).forEach((path) => {
      if (j.MemberExpression.check(path.node.callee)) {
          path.node.callee.object.name = 'rspack';
          dirtyFlag = true;
      }
  });

  // General check for nested plugins like `webpack.anything.*Plugin`
  root.find(j.NewExpression, {
      callee: {
          object: {
              object: { name: 'webpack' },
          },
          property: { name: (name) => supportedPlugins.has(name) },
      },
  }).forEach((path) => {
      if (j.MemberExpression.check(path.node.callee)) {
          path.node.callee.object.object.name = 'rspack';
          dirtyFlag = true;
      }
  });

  return dirtyFlag ? root.toSource() : undefined;
}

export const parser = 'tsx';
