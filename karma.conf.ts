process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config: { set(options: Record<string, unknown>): void; }) => {
    config.set({
        basePath: '.',
        frameworks: ['jasmine', 'karma-typescript'],
        browsers: ['ChromeHeadless'],
        preprocessors: {
            '**/*.ts': 'karma-typescript'
        },
        karmaTypescriptConfig: {
            include: ['__tests__/*.test.ts'],
            bundlerOptions: {
                exclude: ['perf_hooks']
            }
        },
        files: [
            '__tests__/*.test.ts',
            'src/**/*.ts'
        ]
    });
};
