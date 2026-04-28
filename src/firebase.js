import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDL97pVDOVmrQ14lbpHmW3lXxf3HaWp5Po",
    authDomain: "id-itungin-finance.firebaseapp.com",
    projectId: "id-itungin-finance",
    storageBucket: "id-itungin-finance.firebasestorage.app",
    messagingSenderId: "410398071381",
    appId: "1:410398071381:android:c1832b96cd901c086812dc"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use modern persistent local cache (replaces deprecated enableIndexedDbPersistence)
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});
