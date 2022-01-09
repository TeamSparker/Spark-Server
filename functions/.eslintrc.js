module.exports = {
    env: {
        node: true,
        commonjs: true,
        es2021: true,
    },
    extends: ["eslint:recommended", "eslint-config-prettier"],
    parserOptions: {
        ecmaVersion: 12,
    },
    rules: {
        "no-prototype-builtins": "off",
        "no-self-assign": "off",
        "no-empty": "off",
        "no-case-declarations": "off",
        "consistent-return": "off",
        "arrow-body-style": "off",
        camelcase: "off",
        quotes: "off",
        "no-unused-vars": "off",
        "comma-dangle": "off",
        "no-bitwise": "off",
        "no-use-before-define": "off",
        "no-extra-boolean-cast": "off",
        "no-empty-pattern": "off",
        curly: "off",
        "no-unreachable": "off",
    },
};
