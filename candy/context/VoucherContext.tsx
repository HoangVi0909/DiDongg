import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../config/network';

export interface Voucher {
  id: string;
  code: string;
  discount: number; // Phần trăm hoặc số tiền
  type: 'percent' | 'fixed'; // Loại giảm giá
  description: string;
  expiryDate: string;
  minOrder?: number;
  isUsed: boolean;
  appliedAt?: string;
}

interface VoucherContextType {
  vouchers: Voucher[];
  appliedVoucher: Voucher | null;
  addVoucher: (voucher: Voucher) => Promise<void>;
  removeVoucher: (voucherId: string) => Promise<void>;
  applyVoucher: (voucher: Voucher) => Promise<void>;
  removeAppliedVoucher: () => Promise<void>;
  getAvailableVouchers: () => Voucher[];
  validateVoucher: (code: string, totalAmount: number) => Promise<{valid: boolean; message: string; discount?: number; type?: string; discountValue?: number}>;
}

const VoucherContext = createContext<VoucherContextType | undefined>(undefined);

export function VoucherProvider({ children }: { children: React.ReactNode }) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);

  // Load vouchers khi app start
  React.useEffect(() => {
    const loadVouchers = async () => {
      try {
        const saved = await AsyncStorage.getItem('userVouchers');
        const savedApplied = await AsyncStorage.getItem('appliedVoucher');
        if (saved) {
          setVouchers(JSON.parse(saved));
        }
        if (savedApplied) {
          setAppliedVoucher(JSON.parse(savedApplied));
        }
      } catch (error) {
        console.error('Error loading vouchers:', error);
      }
    };
    loadVouchers();
  }, []);

  const addVoucher = async (voucher: Voucher) => {
    try {
      const updated = [...vouchers, voucher];
      setVouchers(updated);
      await AsyncStorage.setItem('userVouchers', JSON.stringify(updated));
      console.log('✅ Voucher added:', voucher.code);
    } catch (error) {
      console.error('Error adding voucher:', error);
    }
  };

  const removeVoucher = async (voucherId: string) => {
    try {
      const updated = vouchers.filter((v) => v.id !== voucherId);
      setVouchers(updated);
      await AsyncStorage.setItem('userVouchers', JSON.stringify(updated));
      console.log('✅ Voucher removed');
    } catch (error) {
      console.error('Error removing voucher:', error);
    }
  };

  const applyVoucher = async (voucher: Voucher) => {
    try {
      setAppliedVoucher(voucher);
      await AsyncStorage.setItem('appliedVoucher', JSON.stringify(voucher));
      console.log('✅ Voucher applied:', voucher.code);
    } catch (error) {
      console.error('Error applying voucher:', error);
    }
  };

  const removeAppliedVoucher = async () => {
    try {
      setAppliedVoucher(null);
      await AsyncStorage.removeItem('appliedVoucher');
      console.log('✅ Applied voucher removed');
    } catch (error) {
      console.error('Error removing applied voucher:', error);
    }
  };

  const getAvailableVouchers = (): Voucher[] => {
    const now = new Date();
    return vouchers.filter((v) => {
      const expiry = new Date(v.expiryDate);
      return expiry > now && !v.isUsed;
    });
  };

  const validateVoucher = async (code: string, totalAmount: number): Promise<{valid: boolean; message: string; discount?: number; type?: string; discountValue?: number}> => {
    try {
      const response = await fetch(`${getApiUrl()}/vouchers/${code}/validate?totalAmount=${totalAmount}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        return {
          valid: false,
          message: 'Không thể xác thực voucher',
        };
      }
    } catch (error) {
      console.error('Error validating voucher:', error);
      return {
        valid: false,
        message: 'Lỗi kết nối',
      };
    }
  };

  return (
    <VoucherContext.Provider
      value={{
        vouchers,
        appliedVoucher,
        addVoucher,
        removeVoucher,
        applyVoucher,
        removeAppliedVoucher,
        getAvailableVouchers,
        validateVoucher,
      }}
    >
      {children}
    </VoucherContext.Provider>
  );
}

export function useVoucher() {
  const context = useContext(VoucherContext);
  if (!context) {
    throw new Error('useVoucher must be used within VoucherProvider');
  }
  return context;
}
