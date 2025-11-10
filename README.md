# Welcome to Water Sampler app 👋
 **Expo** mobile app can be used for testing.
## Get started
1. Create a file "firebas.config.tsx"  
   ```javascript
   // firebase.config.tsx

   import { initializeApp, getApps, getApp } from "firebase/app";
   import { getFirestore } from "firebase/firestore";
   // @ts-ignore
   import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
   import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
   
   // TODO: Add SDKs for Firebase products that you want to use
   // https://firebase.google.com/docs/web/setup#available-libraries
   
   const firebaseConfig = {
      //Add your firebase configuration here
   };
   const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
   let auth;
   try {
      auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
      });
   } catch (e) {
      auth = getAuth(app);
   }
   
   const db = getFirestore(app);
   
   export { app, auth, db };
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Start the app
   ```bash
   npm run web
   ```
   
# Install the latest Android APK build [here](https://expo.dev/accounts/bibek2442b/projects/WaterSampler/builds/a754d6fa-4077-4ffb-b777-02c66f6c9eb6)

