import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserContextType {
  userPhone: string | null;
  setUserPhone: (phone: string) => void;
  clearUserPhone: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userPhone, setUserPhone] = useState<string | null>(null);

  // Load saved phone on app start
  useEffect(() => {
    const loadUserPhone = async () => {
      try {
        const saved = await AsyncStorage.getItem('userPhone');
        if (saved) {
          setUserPhone(saved);
        }
      } catch (error) {
        console.error('Error loading user phone:', error);
      }
    };
    loadUserPhone();
  }, []);

  const handleSetUserPhone = async (phone: string) => {
    setUserPhone(phone);
    try {
      await AsyncStorage.setItem('userPhone', phone);
      console.log('✅ Saved user phone:', phone);
    } catch (error) {
      console.error('Error saving user phone:', error);
    }
  };

  const clearUserPhone = async () => {
    setUserPhone(null);
    try {
      await AsyncStorage.removeItem('userPhone');
    } catch (error) {
      console.error('Error clearing user phone:', error);
    }
  };

  return (
    <UserContext.Provider value={{ userPhone, setUserPhone: handleSetUserPhone, clearUserPhone }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
