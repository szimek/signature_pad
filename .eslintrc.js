module.exports = {
  "extends": "airbnb-base",

  "env": {
    "browser": true
  },

  "rules": {
    "no-console": 0,
    "no-underscore-dangle": "off",
    "func-names": "off",
    "import/prefer-default-export": "off",
    "no-restricted-properties": "off",
    "prefer-arrow-callback": ["error", { "allowNamedFunctions": true }]
  }
};
