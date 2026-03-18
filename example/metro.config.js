const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Root of the SDK package (parent directory)
const sdkRoot = path.resolve(__dirname, '..');

// Watch the parent SDK for changes during development
config.watchFolders = [sdkRoot];

// Resolve modules from both example and SDK node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(sdkRoot, 'node_modules'),
];

// Block the SDK's node_modules/react-native from being resolved
// (it has an old version 0.70.4 as a devDependency)
config.resolver.blockList = [
  new RegExp(path.resolve(sdkRoot, 'node_modules', 'react-native') + '/.*'),
  new RegExp(path.resolve(sdkRoot, 'node_modules', 'react') + '/.*'),
];

// Ensure react and react-native resolve from the example's node_modules
// to avoid duplicate React instances
config.resolver.extraNodeModules = {
  'react': path.resolve(__dirname, 'node_modules/react'),
  'react-native': path.resolve(__dirname, 'node_modules/react-native'),
  'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
};

module.exports = config;
