const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

// Prisma 7 emits `export * as $Enums from './enums'`. Nx's webpack plugin
// unconditionally sets `optimization.concatenateModules: true`, and webpack's
// module concatenation cannot rename the `$`-prefixed re-export, failing the
// build with "Cannot get final name for export '$Enums'". Disable it. This must
// run AFTER NxAppWebpackPlugin, which otherwise re-enables it.
class DisableConcatenateModules {
  apply(compiler) {
    compiler.options.optimization = compiler.options.optimization || {};
    compiler.options.optimization.concatenateModules = false;
  }
}

// Prisma 7's generated client (src/generated/prisma/*) uses ESM namespace
// imports from `@prisma/client/runtime/client` (e.g. `import * as runtime from ...`
// then `runtime.getPrismaClient(...)`), and the client entry does
// `export const PrismaClient = $Class.getPrismaClientClass()` at module top
// level. Webpack's CJS output resolves that namespace lazily, so PrismaClient is
// `undefined` at class-definition time and `class PrismaService extends PrismaClient`
// throws "Class extends value undefined". The runtime siblings are already
// external (below) and load fine natively, so the same applies to the generated
// client itself: externalize it and let Node load it natively via tsx (the
// serve runner is tsx, see apps/api/project.json). The client is copied to dist
// as an asset so the relative require resolves at runtime.
//
// Use a function external: webpack resolves the import to an absolute path, so a
// plain object key (relative or package-name) won't match. Match by suffix.
const prismaExternals = function ({ request }, callback) {
  if (!request) return callback();
  if (request.endsWith('generated/prisma/client') || request.endsWith('generated/prisma/client.ts')) {
    // Require it relative to the bundle output dir (dist/apps/api); the folder
    // is copied there as an asset so tsx can load the .ts natively.
    return callback(null, 'commonjs ./src/generated/prisma/client');
  }
  if (request === '@prisma/client/runtime/client') return callback(null, 'commonjs @prisma/client/runtime/client');
  if (request === '@prisma/client/runtime/library') return callback(null, 'commonjs @prisma/client/runtime/library');
  if (request === '@prisma/client/extension') return callback(null, 'commonjs @prisma/client/extension');
  if (request === '@prisma/adapter-pg') return callback(null, 'commonjs @prisma/adapter-pg');
  return callback();
};

module.exports = {
  externals: [prismaExternals],
  output: {
    path: join(__dirname, '../../dist/apps/api'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ["./src/assets", { glob: "src/generated/**/*", input: ".", output: "." }],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMap: true,
      mergeExternals: true,
    }),
    new DisableConcatenateModules(),
  ],
};
