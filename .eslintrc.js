module.exports = {
  // 为我们提供运行环境，一个环境定义了一组预定义的全局变量
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  // 一个配置文件可以被基础配置中的已启用的规则继承。
  extends: ['airbnb-typescript', 'prettier', 'prettier/@typescript-eslint', 'prettier/react'],
  // 自定义全局变量
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    _: true,
    $: true,
  },
  // ESLint 默认使用Espree作为其解析器，你可以在配置文件中指定一个不同的解析器
  parser: '@typescript-eslint/parser',
  // 配置解析器支持的语法
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  // ESLint 支持使用第三方插件。在使用插件之前，你必须使用 npm 安装它。
  // 在配置文件里配置插件时，可以使用 plugins 关键字来存放插件名字的列表。插件名称可以省略 eslint-plugin- 前缀。
  plugins: ['prettier'],
  settings: {
    //自动发现React的版本，从而进行规范react代码
    react: {
      pragma: 'React',
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.tsx'],
      rules: {
        'react/prop-types': 'off',
      },
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  // ESLint 附带有大量的规则。你可以使用注释或配置文件修改你项目中要使用的规则。要改变一个规则设置，你必须将规则 ID 设置为下列值之一：
  // "off" 或 0 - 关闭规则
  // "warn" 或 1 - 开启规则，使用警告级别的错误：warn (不会导致程序退出)
  // "error" 或 2 - 开启规则，使用错误级别的错误：error (当被触发的时候，程序会退出)
  rules: {
    'spaced-comment': 0, //注释要求或不允许以空格
    'no-underscore-dangle': 0,
    'no-restricted-syntax': [
      0,
      {
        //允许使用的操作符
        selector: "BinaryExpression[operator='of']",
        message: 'Function expressions are not allowed.',
      },
    ],
    'react/jsx-props-no-spreading': 0, //允许使用解构props
    '@typescript-eslint/camelcase': 0, //无需使用驼峰命名
    '@typescript-eslint/no-use-before-define': 0, //无需在使用前定义
    '@typescript-eslint/no-unused-expressions': 0, //允许未使用过的表达式
    '@typescript-eslint/no-empty-function': [2, { allow: [] }], //不允许空函数
    '@typescript-eslint/no-throw-literal': 0,
  },
}
