const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Stub codegenNativeComponent for web compatibility
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native/Libraries/Utilities/codegenNativeComponent': require.resolve('./codegenMock.js'),
};

module.exports = withNativeWind(config, { input: "./global.css" });
