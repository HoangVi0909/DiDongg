import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';
import { getApiUrl } from '../config/network';

interface Order {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  transactionCode?: string;
  createdAt?: string;
}

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userPhone } = useUser();

  const fetchOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Clean phone: chỉ giữ lại các chữ số (fix lỗi nếu phone bị lưu sai format)
      const cleanPhone = userPhone 
        ? userPhone.replace(/\D/g, '').substring(0, 20) 
        : null;
      
      let ordersArray: Order[] = [];
      
      // Thử fetch by phone trước nếu có phone
      if (cleanPhone && cleanPhone.length > 0) {
        const url = `${getApiUrl()}/api/orders/by-phone?phone=${encodeURIComponent(cleanPhone)}`;
        console.log('📱 Fetching orders with phone:', url);
        
        const res = await fetch(url);
        console.log('📱 Response status (by-phone):', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('📱 Response data (by-phone):', data);
          ordersArray = data.orders || (Array.isArray(data) ? data : []);
          console.log('📱 Found', ordersArray.length, 'orders by phone');
        }
      }
      
      // Nếu không tìm thấy order by phone, fallback lấy tất cả (cho compatible với order cũ)
      if (ordersArray.length === 0) {
        console.log('⚠️ No orders found by phone, falling back to fetch all orders...');
        const url = `${getApiUrl()}/api/orders`;
        console.log('📱 Fetching all orders:', url);
        
        const res = await fetch(url);
        console.log('📱 Response status (all):', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('📱 Response data (all):', data);
          ordersArray = Array.isArray(data) ? data : [];
          console.log('📱 Found', ordersArray.length, 'orders (all)');
        }
      }
      
      const sortedOrders = ordersArray.sort((a: Order, b: Order) => b.id - a.id);
      
      // Kiểm tra xem có đơn hàng nào được xác nhận không
      setOrders((prevOrders) => {
        const hasStatusUpdates = sortedOrders.some((newOrder: Order) => {
          const oldOrder = prevOrders.find((o) => o.id === newOrder.id);
          return oldOrder && oldOrder.status !== newOrder.status;
        });

        // Nếu có cập nhật trạng thái, hiển thị notification
        if (hasStatusUpdates) {
          sortedOrders.forEach((newOrder: Order) => {
            const oldOrder = prevOrders.find((o) => o.id === newOrder.id);
            if (oldOrder && oldOrder.status !== newOrder.status && newOrder.status === 'confirmed') {
              Alert.alert(
                '✅ Đơn hàng đã được xác nhận!',
                `Đơn hàng #${newOrder.id} của bạn đã được shop xác nhận. Chuẩn bị giao hàng...`
              );
            }
          });
        }

        return sortedOrders;
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userPhone]);

  // Fetch orders khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
      
      // Polling: kiểm tra cập nhật mỗi 3 giây
      const pollingInterval = setInterval(() => {
        fetchOrders();
      }, 3000);

      return () => {
        clearInterval(pollingInterval);
      };
    }, [fetchOrders])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'confirmed':
        return '#10b981';
      case 'shipped':
        return '#3b82f6';
      case 'delivered':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'shipped':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCardWrapper}>
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => {
          Alert.alert(
            `Đơn hàng #${item.id}`,
            `Khách: ${item.customerName}\nSĐT: ${item.phone}\nĐịa chỉ: ${item.address}\nTổng: ${formatCurrency(item.totalAmount)}\nTrạng thái: ${getStatusLabel(item.status)}`,
            [{ text: 'Đóng' }]
          );
        }}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>Đơn hàng #{item.id}</Text>
            <Text style={styles.customerInfo}>{item.customerName}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(item.status),
              },
            ]}
          >
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phương thức:</Text>
            <Text style={styles.detailValue}>
              {item.paymentMethod === 'COD' ? 'Thanh toán khi nhận' : 'Chuyển khoản'}
            </Text>
          </View>
          {item.transactionCode && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã giao dịch:</Text>
              <Text style={[styles.detailValue, styles.transactionCode]}>
                {item.transactionCode}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Tổng tiền:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount)}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.trackingBtn}
        onPress={() => router.push(`/OrderTrackingScreen?id=${item.id}`)}
      >
        <Text style={styles.trackingBtnText}>📍 Theo Dõi</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  listContainer: {
    padding: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  customerInfo: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '600',
  },
  transactionCode: {
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  orderCardWrapper: {
    marginBottom: 12,
  },
  trackingBtn: {
    backgroundColor: '#FF6B6B',
    marginHorizontal: 12,
    marginTop: -8,
    marginBottom: 12,
    paddingVertical: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    alignItems: 'center',
  },
  trackingBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
