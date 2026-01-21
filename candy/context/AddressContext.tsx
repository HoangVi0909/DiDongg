import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DeliveryAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
  createdAt: string;
}

interface AddressContextType {
  addresses: DeliveryAddress[];
  defaultAddress: DeliveryAddress | null;
  addAddress: (address: DeliveryAddress) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  updateAddress: (address: DeliveryAddress) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<DeliveryAddress | null>(null);

  // Load addresses khi app start
  React.useEffect(() => {
    const loadAddresses = async () => {
      try {
        const saved = await AsyncStorage.getItem('userAddresses');
        const defaultId = await AsyncStorage.getItem('defaultAddressId');
        
        if (saved) {
          const loadedAddresses = JSON.parse(saved);
          setAddresses(loadedAddresses);
          
          if (defaultId) {
            const def = loadedAddresses.find((a: DeliveryAddress) => a.id === defaultId);
            if (def) setDefaultAddress(def);
          } else if (loadedAddresses.length > 0) {
            setDefaultAddress(loadedAddresses[0]);
          }
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      }
    };
    loadAddresses();
  }, []);

  const addAddress = async (address: DeliveryAddress) => {
    try {
      const updated = [...addresses, address];
      setAddresses(updated);
      
      // Nếu là địa chỉ đầu tiên, set làm default
      if (updated.length === 1) {
        setDefaultAddress(address);
        await AsyncStorage.setItem('defaultAddressId', address.id);
      }
      
      await AsyncStorage.setItem('userAddresses', JSON.stringify(updated));
      console.log('✅ Address added:', address.name);
    } catch (error) {
      console.error('Error adding address:', error);
    }
  };

  const removeAddress = async (addressId: string) => {
    try {
      const updated = addresses.filter((a) => a.id !== addressId);
      setAddresses(updated);
      
      // Nếu xóa địa chỉ default, set địa chỉ đầu tiên làm default
      if (defaultAddress?.id === addressId) {
        if (updated.length > 0) {
          setDefaultAddress(updated[0]);
          await AsyncStorage.setItem('defaultAddressId', updated[0].id);
        } else {
          setDefaultAddress(null);
          await AsyncStorage.removeItem('defaultAddressId');
        }
      }
      
      await AsyncStorage.setItem('userAddresses', JSON.stringify(updated));
      console.log('✅ Address removed');
    } catch (error) {
      console.error('Error removing address:', error);
    }
  };

  const updateAddress = async (address: DeliveryAddress) => {
    try {
      const updated = addresses.map((a) => (a.id === address.id ? address : a));
      setAddresses(updated);
      
      if (defaultAddress?.id === address.id) {
        setDefaultAddress(address);
      }
      
      await AsyncStorage.setItem('userAddresses', JSON.stringify(updated));
      console.log('✅ Address updated:', address.name);
    } catch (error) {
      console.error('Error updating address:', error);
    }
  };

  const setDefaultAddressHandler = async (addressId: string) => {
    try {
      const addr = addresses.find((a) => a.id === addressId);
      if (addr) {
        setDefaultAddress(addr);
        await AsyncStorage.setItem('defaultAddressId', addressId);
        console.log('✅ Default address updated:', addr.name);
      }
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        defaultAddress,
        addAddress,
        removeAddress,
        updateAddress,
        setDefaultAddress: setDefaultAddressHandler,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within AddressProvider');
  }
  return context;
}
