import typescript from 'rollup-plugin-typescript2';
import cleanup from 'rollup-plugin-cleanup';
import { visualizer } from 'rollup-plugin-visualizer';

const packageJson = require('./package.json');

export default [
  {
    input: 'src/index.ts',
    external: [
      ...Object.keys(packageJson.dependencies),
      ...Object.keys(packageJson.peerDependencies),
      'react',
      /^lodash\/.*/,
      /^@material-ui\/.*/,
      /^dayjs\/.*/,
    ],
    output: {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      typescript(),
      cleanup({ extensions: ['js', 'ts', 'jsx', 'tsx'] }),
      visualizer({ open: false }),
    ],
  }
];
