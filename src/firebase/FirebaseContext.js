// src/firebase/FirebaseContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from './config';

const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [db, setDb] = useState(null);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    setDb(firestore);
  }, []);

  return (
    <FirebaseContext.Provider value={{ db }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
