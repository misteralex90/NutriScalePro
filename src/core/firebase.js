import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyAB3GhcOmEO-f00gxG8iAb-RBexhLQ8-hM',
  authDomain: 'nutriscale-pro.firebaseapp.com',
  projectId: 'nutriscale-pro',
  storageBucket: 'nutriscale-pro.firebasestorage.app',
  messagingSenderId: '375030587498',
  appId: '1:375030587498:web:3be6e33aa7e6b0de13c89d',
  databaseURL: 'https://nutriscale-pro-default-rtdb.europe-west1.firebasedatabase.app',
};

const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
