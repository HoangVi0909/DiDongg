import React, { createContext, useContext, useState } from 'react';

export interface ProductStatistic {
  productId: number;
  productName: string;
  sold: number;
  revenue: number;
  rating: number;
}

export interface OrderStatistic {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  pendingOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
}

export interface DailyStatistic {
  date: string;
  orders: number;
  revenue: number;
}

interface AdminStatisticsType {
  orderStats: OrderStatistic | null;
  productStats: ProductStatistic[];
  dailyStats: DailyStatistic[];
  loading: boolean;
  fetchOrderStatistics: () => Promise<void>;
  fetchProductStatistics: () => Promise<void>;
  fetchDailyStatistics: (days: number) => Promise<void>;
}

const AdminStatisticsContext = createContext<AdminStatisticsType | undefined>(undefined);

export function AdminStatisticsProvider({ children }: { children: React.ReactNode }) {
  const [orderStats, setOrderStats] = useState<OrderStatistic | null>(null);
  const [productStats, setProductStats] = useState<ProductStatistic[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStatistic[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrderStatistics = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockStats: OrderStatistic = {
        totalOrders: 156,
        totalRevenue: 15600000,
        avgOrderValue: 100000,
        pendingOrders: 12,
        confirmedOrders: 120,
        cancelledOrders: 24,
      };
      setOrderStats(mockStats);
      console.log('✅ Order statistics loaded');
    } catch (error) {
      console.error('Error fetching order statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductStatistics = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockProducts: ProductStatistic[] = [
        { productId: 1, productName: 'Bánh quy bơ', sold: 45, revenue: 2250000, rating: 4.8 },
        { productId: 2, productName: 'Kẹo socola', sold: 38, revenue: 1140000, rating: 4.5 },
        { productId: 3, productName: 'Bánh su kem', sold: 32, revenue: 1600000, rating: 4.9 },
        { productId: 4, productName: 'Nước cam', sold: 28, revenue: 840000, rating: 4.3 },
        { productId: 5, productName: 'Cà phê đen', sold: 25, revenue: 500000, rating: 4.6 },
      ];
      setProductStats(mockProducts);
      console.log('✅ Product statistics loaded');
    } catch (error) {
      console.error('Error fetching product statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyStatistics = async (days: number = 7) => {
    try {
      setLoading(true);
      // Mock data - tạo dữ liệu cho 7 ngày gần đây
      const mockDaily: DailyStatistic[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        mockDaily.push({
          date: date.toISOString().split('T')[0],
          orders: Math.floor(Math.random() * 30) + 10,
          revenue: Math.floor(Math.random() * 3000000) + 1000000,
        });
      }
      setDailyStats(mockDaily);
      console.log('✅ Daily statistics loaded');
    } catch (error) {
      console.error('Error fetching daily statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOrderStatistics();
    fetchProductStatistics();
    fetchDailyStatistics(7);
  }, []);

  return (
    <AdminStatisticsContext.Provider
      value={{
        orderStats,
        productStats,
        dailyStats,
        loading,
        fetchOrderStatistics,
        fetchProductStatistics,
        fetchDailyStatistics,
      }}
    >
      {children}
    </AdminStatisticsContext.Provider>
  );
}

export function useAdminStatistics() {
  const context = useContext(AdminStatisticsContext);
  if (!context) {
    throw new Error('useAdminStatistics must be used within AdminStatisticsProvider');
  }
  return context;
}
