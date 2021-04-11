import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import * as pkg from './package.json';

const BROWSER = !!process.env.BROWSER;
const rollupConfig = {
    input: './src/index.ts',
    output: {
        name: pkg.name,
        file: BROWSER ? pkg.browser : pkg.main,
        format: 'cjs'
    },
    plugins: [
        typescript({
            useTsconfigDeclarationDir: true,
            tsconfigOverride: {
                include: ['src/**/*']
            }
        }),
        replace({
            'process.env.BROWSER': JSON.stringify(BROWSER),
            preventAssignment: true
        })
    ]
};

export default rollupConfig;
