module.exports = {
  name: "JanSoochna",
  slug: "jansoochna",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  scheme: "jansoochna",
  splash: {
    backgroundColor: "#0F5C3A"
  },
  android: {
    package: "in.jansoochna.app",
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""
      }
    },
    permissions: [
      "ACCESS_FINE_LOCATION",
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "RECORD_AUDIO"
    ]
  },
  ios: {
    bundleIdentifier: "in.jansoochna.app",
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ""
    }
  },
  plugins: [
    "expo-router",
    "expo-speech-recognition",
    [
      "expo-font",
      {
        fonts: [
          "./assets/fonts/Mukta-Regular.ttf",
          "./assets/fonts/Mukta-Medium.ttf",
          "./assets/fonts/Mukta-SemiBold.ttf",
          "./assets/fonts/Mukta-Bold.ttf",
          "./assets/fonts/Mukta-ExtraBold.ttf",
          "./assets/fonts/CrimsonPro-Italic.ttf",
          "./assets/fonts/SpaceMono-Regular.ttf",
          "./assets/fonts/SpaceMono-Bold.ttf"
        ]
      }
    ],
    "expo-web-browser"
  ],
  experiments: {
    typedRoutes: true
  }
};
