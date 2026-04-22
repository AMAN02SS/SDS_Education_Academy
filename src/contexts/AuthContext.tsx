import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsubscribe: () => void;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDoc);
          
          if (!docSnap.exists()) {
            // Create initial profile
            const newProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: firebaseUser.email === 'mayanksikarwar1999@gmail.com' ? 'admin' : 'student',
              onboardingCompleted: false,
              createdAt: serverTimestamp(),
            };
            await setDoc(userDoc, newProfile);
          }

          profileUnsubscribe = onSnapshot(userDoc, (snapshot) => {
            if (snapshot.exists()) {
              setProfile(snapshot.data());
            }
            setLoading(false);
          }, (error) => {
            console.error("Firestore Profile Sync Error:", error);
            setLoading(false);
          });
        } catch (error: any) {
          console.error("Firebase Authentication/Firestore Error:", error);
          // If Firestore fails (e.g. database not initialized), we still want to finish loading 
          // so the app can show an error state or fallback.
          setLoading(false);
        }

      } else {
        setProfile(null);
        setLoading(false);
        if (profileUnsubscribe) profileUnsubscribe();
      }
    });

    return () => {
      unsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
