import { boot } from 'quasar/wrappers';
import GoogleSignInPlugin from 'vue3-google-signin';

export default boot(({ app }) => {
  app.use(GoogleSignInPlugin, {
    clientId:
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      '141644547282-pp3sl8jh31nlnf7ugu5r6pjmcpnc3c49.apps.googleusercontent.com',
  });
});
