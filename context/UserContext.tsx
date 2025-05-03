import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, UserPreferences } from '@/types/user';
import { initialUser } from '@/data/initialData';
import { auth, db } from '@/FirebaseConfig'; // Import auth and db
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore'; // Import Firestore functions
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface UserContextProps {
  user: User | null; // User can be null initially or when logged out
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateUserPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>;
  loading: boolean; // Add loading state
}

// Update initial context value
export const UserContext = createContext<UserContextProps>({
  user: null,
  updateUser: async () => {},
  updateUserPreference: async () => {},
  loading: true,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Listen for Auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      if (!currentUser) {
        setUser(null); // Clear user data on logout
        setLoading(false);
      }
      // Data loading will be triggered by the firebaseUser state change below
    });
    return () => unsubscribeAuth(); // Unsubscribe on cleanup
  }, []);

  // Listen for Firestore changes when user is logged in
  useEffect(() => {
    if (firebaseUser) {
      setLoading(true);
      const userDocRef = doc(db, 'users', firebaseUser.uid);

      // Use onSnapshot for real-time updates
      const unsubscribeFirestore = onSnapshot(userDocRef, async (docSnap) => {
        if (docSnap.exists()) {
          setUser({ id: docSnap.id, ...docSnap.data() } as User);
          setLoading(false);
        } else {
          console.log("User document not found, creating it now.");
          
          // Create a new user document if it doesn't exist
          try {
            const initialUserData = {
              ...initialUser,
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'New User',
            };
            
            // Remove id from the object being saved
            const { id, ...dataToSave } = initialUserData;
            
            await setDoc(userDocRef, dataToSave);
            
            // After creating, set the user
            setUser(initialUserData);
            setLoading(false);
          } catch (error) {
            console.error("Error creating user document:", error);
            setUser(null);
            setLoading(false);
          }
        }
      }, (error) => {
        console.error("Error listening to user document:", error);
        setUser(null);
        setLoading(false);
      });

      return () => unsubscribeFirestore(); // Unsubscribe Firestore listener on cleanup or user change
    } else {
      // No user logged in
      setUser(null);
      setLoading(false);
    }
  }, [firebaseUser]); // Re-run when firebaseUser changes

  const updateUser = async (userData: Partial<User>) => {
    if (!firebaseUser || !user) return; // Need logged-in user and existing user state
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
      // Filter out undefined values before updating Firestore
      const filteredData = Object.fromEntries(
        Object.entries(userData).filter(([_, value]) => value !== undefined)
      );
      
      // Use updateDoc for partial updates
      await updateDoc(userDocRef, filteredData);
      // Local state updates handled by onSnapshot
    } catch (error) {
      console.error('Failed to update user data:', error);
    }
  };

  const updateUserPreference = async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    if (!firebaseUser || !user) return;
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    try {
      // Update nested preference field
      await updateDoc(userDocRef, {
        [`preferences.${key}`]: value
      });
      // Local state updates handled by onSnapshot
    } catch (error) {
      console.error('Failed to update user preference:', error);
    }
  };

  // Remove AsyncStorage logic

  return (
    <UserContext.Provider value={{ user, updateUser, updateUserPreference, loading }}>
      {children}
    </UserContext.Provider>
  );
};
