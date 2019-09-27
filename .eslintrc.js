module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        ecmaFeatures: {
            esversion: 8,
        },
        sourceType: 'module',
    },
    env: {
        browser: true,
    },
    extends: 'airbnb-base',
    globals: {
        __static: true,
    },
    plugins: [
        'html',
    ],
    'rules': {
        'global-require': 0,
        'import/no-unresolved': 0,
        'no-param-reassign': 0,
        'no-shadow': 0,
        'import/extensions': 0,
        'import/newline-after-import': 0,
        'import/prefer-default-export': 0,
        'no-multi-assign': 0,
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,

        'indent': [2, 4, { SwitchCase: 1 }],
        'key-spacing': 0,
        'arrow-parens': [2, 'as-needed'],
        'no-multi-spaces': [2, { exceptions: { 'VariableDeclarator': true } }],
        'radix': [2, 'as-needed'],
        'no-plusplus': 0,
        'max-len': [2, 180],
        'no-confusing-arrow': 0,
        'linebreak-style': 0,
        'no-trailing-spaces': 1,
        'padded-blocks': 1,
        'no-case-declarations': 1,
        'yoda': 0,
        'no-void': 0,
        'no-continue': 0,
    },
};
