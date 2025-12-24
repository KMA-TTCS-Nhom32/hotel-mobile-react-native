module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      'react-native-worklets/plugin',
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@/assets': './assets',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/services': './src/services',
            '@/hooks': './src/hooks',
            '@/store': './src/store',
            '@/types': './src/types',
            '@/utils': './src/utils',
            '@/config': './src/config',
            '@/constants': './src/constants',
            '@': './src',
          },
        },
      ],
    ],
  };
};
