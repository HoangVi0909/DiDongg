import React, { createContext, useContext, useState } from 'react';
// ⚠️ VOUCHER API DISABLED - getApiUrl import removed
// import { getApiUrl } from '../config/network';

export interface AdminVoucher {
  id?: string | number;
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  description: string;
  expiryDate: string;
  minOrder?: number;
  maxUse?: number;
  usedCount?: number;
  isActive: boolean;
}

interface AdminVoucherManagerType {
  vouchers: AdminVoucher[];
  loading: boolean;
  createVoucher: (voucher: AdminVoucher) => Promise<boolean>;
  updateVoucher: (voucher: AdminVoucher) => Promise<boolean>;
  deleteVoucher: (voucherId: string) => Promise<boolean>;
  toggleVoucher: (voucherId: string) => Promise<boolean>;
  fetchVouchers: () => Promise<void>;
}

const AdminVoucherContext = createContext<AdminVoucherManagerType | undefined>(undefined);

export function AdminVoucherProvider({ children }: { children: React.ReactNode }) {
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      // ⚠️ VOUCHER API DISABLED - Using mock data only
      // const response = await fetch(`${getApiUrl()}/api/vouchers`);
      // if (response.ok) {
      //   const data = await response.json();
      //   setVouchers(data);
      // } else {
      const mockVouchers: AdminVoucher[] = [
        {
          id: '1',
          code: 'SALE2025',
          discount: 15,
          type: 'percent',
          description: 'Giảm 15% cho tất cả sản phẩm',
          expiryDate: '2025-12-31',
          minOrder: 100000,
          maxUse: 100,
          usedCount: 25,
          isActive: true,
        },
      ];
      setVouchers(mockVouchers);
      // }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      // Fallback to mock data if API fails
      const mockVouchers: AdminVoucher[] = [
        {
          id: '1',
          code: 'SALE2025',
          discount: 15,
          type: 'percent',
          description: 'Giảm 15% cho tất cả sản phẩm',
          expiryDate: '2025-12-31',
          minOrder: 100000,
          maxUse: 100,
          usedCount: 25,
          isActive: true,
        },
      ];
      setVouchers(mockVouchers);
    } finally {
      setLoading(false);
    }
  };

  const createVoucher = async (voucher: AdminVoucher): Promise<boolean> => {
    // ⚠️ VOUCHER API DISABLED - Create operation not available
    console.warn('Voucher API is disabled - Create operation not available');
    return false;
    /* 
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/vouchers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: voucher.code,
          discount: voucher.discount,
          type: voucher.type,
          description: voucher.description,
          expiryDate: voucher.expiryDate,
          minOrder: voucher.minOrder,
          maxUse: voucher.maxUse,
        }),
      });

      if (response.ok) {
        const newVoucher = await response.json();
        setVouchers([...vouchers, newVoucher]);
        console.log('✅ Voucher created:', newVoucher);
        return true;
      } else {
        console.error('Failed to create voucher');
        return false;
      }
    } catch (error) {
      console.error('Error creating voucher:', error);
      return false;
    } finally {
      setLoading(false);
    }
    */
  };

  const updateVoucher = async (voucher: AdminVoucher): Promise<boolean> => {
    // ⚠️ VOUCHER API DISABLED - Update operation not available
    console.warn('Voucher API is disabled - Update operation not available');
    return false;
    /*
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/vouchers/${voucher.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: voucher.code,
          discount: voucher.discount,
          type: voucher.type,
          description: voucher.description,
          expiryDate: voucher.expiryDate,
          minOrder: voucher.minOrder,
          maxUse: voucher.maxUse,
          isActive: voucher.isActive,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setVouchers(vouchers.map(v => v.id === voucher.id ? updated : v));
        console.log('✅ Voucher updated:', voucher);
        return true;
      } else {
        console.error('Failed to update voucher');
        return false;
      }
    } catch (error) {
      console.error('Error updating voucher:', error);
      return false;
    } finally {
      setLoading(false);
    }
    */
  };

  const deleteVoucher = async (voucherId: string): Promise<boolean> => {
    // ⚠️ VOUCHER API DISABLED - Delete operation not available
    console.warn('Voucher API is disabled - Delete operation not available');
    return false;
    /*
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/vouchers/${voucherId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVouchers(vouchers.filter(v => v.id !== voucherId));
        console.log('✅ Voucher deleted:', voucherId);
        return true;
      } else {
        console.error('Failed to delete voucher');
        return false;
      }
    } catch (error) {
      console.error('Error deleting voucher:', error);
      return false;
    } finally {
      setLoading(false);
    }
    */
  };

  const toggleVoucher = async (voucherId: string): Promise<boolean> => {
    // ⚠️ VOUCHER API DISABLED - Toggle operation not available
    console.warn('Voucher API is disabled - Toggle operation not available');
    return false;
    /*
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/api/vouchers/${voucherId}/toggle`, {
        method: 'PUT',
      });

      if (response.ok) {
        const updated = await response.json();
        setVouchers(vouchers.map(v => v.id === voucherId ? updated : v));
        console.log('✅ Voucher toggled:', voucherId);
        return true;
      } else {
        console.error('Failed to toggle voucher');
        return false;
      }
    } catch (error) {
      console.error('Error toggling voucher:', error);
      return false;
    } finally {
      setLoading(false);
    }
    */
  };

  React.useEffect(() => {
    fetchVouchers();
  }, []);

  return (
    <AdminVoucherContext.Provider
      value={{ vouchers, loading, createVoucher, updateVoucher, deleteVoucher, toggleVoucher, fetchVouchers }}
    >
      {children}
    </AdminVoucherContext.Provider>
  );
}

export function useAdminVoucher() {
  const context = useContext(AdminVoucherContext);
  if (!context) {
    throw new Error('useAdminVoucher must be used within AdminVoucherProvider');
  }
  return context;
}
