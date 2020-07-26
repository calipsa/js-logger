module.exports = {
  root: true,

  extends: [
    '@calipsa/eslint-config-typescript',
  ],

  parserOptions: {
    project: './tsconfig.json',
  },

  rules: {
    'object-property-newline': [2, {
      allowAllPropertiesOnSameLine: false,
    }],

    '@typescript-eslint/await-thenable': 2,
    '@typescript-eslint/prefer-readonly': 2,
  },
}
