const appJson = require('./app.json');

function trim(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function iosUrlScheme(clientId) {
  const suffix = '.apps.googleusercontent.com';
  if (!clientId.endsWith(suffix)) return '';
  return `com.googleusercontent.apps.${clientId.slice(0, -suffix.length)}`;
}

module.exports = () => {
  const base = appJson.expo;
  const baseExtra = base.extra ?? {};

  // Client IDs are public (they ship inside the app). They can be overridden
  // with .env locally; app.json is the fallback for EAS builds, which do not
  // upload the .env file to the server.
  const iosClientId =
    trim(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) ||
    trim(process.env.CLIENT_ID_IOS) ||
    trim(baseExtra.googleIosClientId);
  const iosScheme = iosUrlScheme(iosClientId);

  return {
    expo: {
      ...base,
      scheme: iosScheme ? ['cellarapp', iosScheme] : base.scheme || 'cellarapp',
      extra: {
        ...baseExtra,
        apiUrl:
          trim(process.env.EXPO_PUBLIC_API_URL) ||
          baseExtra.apiUrl ||
          'http://localhost:3000',
        googleWebClientId:
          trim(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) ||
          trim(process.env.CLIENT_ID_WEB) ||
          baseExtra.googleWebClientId ||
          '',
        googleIosClientId: iosClientId,
        googleAndroidClientId:
          trim(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID) ||
          trim(process.env.CLIENT_ID_ANDROID) ||
          baseExtra.googleAndroidClientId ||
          '',
      },
    },
  };
};
