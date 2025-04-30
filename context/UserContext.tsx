import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserPreferences } from '@/types/user';
import { initialUser } from '@/data/initialData';

interface UserContextProps {
  user: User;
  updateUser: (userData: Partial<User>) => void;
  updateUserPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
}

export const UserContext = createContext<UserContextProps>({
  user: initialUser,
  updateUser: () => {},
  updateUserPreference: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }

      setIsInitialized(true);
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const saveUserData = async () => {
      if (!isInitialized) return;

      try {
        await AsyncStorage.setItem('userData', JSON.stringify(user));
      } catch (error) {
        console.error('Failed to save user data:', error);
      }
    };

    saveUserData();
  }, [user, isInitialized]);

  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData,
    }));
  };

  const updateUserPreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setUser(prevUser => ({
      ...prevUser,
      preferences: {
        ...prevUser.preferences,
        [key]: value,
      },
    }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, updateUserPreference }}>
      {children}
    </UserContext.Provider>
  );
};
