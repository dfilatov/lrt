import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default {
    input: './src/index.ts',
    output: {
        name: pkg.name,
        file: pkg.main,
        format: 'cjs'
    },
    plugins: [
        typescript({
            useTsconfigDeclarationDir: true
        })
    ]
};
