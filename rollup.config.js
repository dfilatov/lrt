import replace from 'rollup-plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

const BROWSER = !!process.env.BROWSER;

export default {
    input: './src/index.ts',
    output: {
        name: pkg.name,
        file: BROWSER? pkg.browser : pkg.main,
        format: 'cjs'
    },
    plugins: [
        typescript({
            useTsconfigDeclarationDir: true
        }),
        replace({
            'process.env.BROWSER': JSON.stringify(BROWSER)
        })
    ]
};
