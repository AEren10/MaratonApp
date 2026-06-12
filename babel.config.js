module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Reanimated 4 / worklets — bu plugin OLMADAN useAnimatedStyle,
      // useSharedValue, FadeInDown vb. herşey "Exception in HostFunction"
      // hatası fırlatır. Listenin EN SONUNDA olması zorunlu.
      "react-native-worklets/plugin",
    ],
  };
};
