import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useToast } from '../context/ToastContext';

const isWeb = Platform.OS === 'web';

interface TrackingStep {
  id: number;
  status: string;
  statusCode: 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';
  timestamp: string;
  description: string;
  icon: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  estimatedDelivery: string;
  shippingAddress: string;
  items: { name: string; quantity: number; price: number }[];
  trackingSteps: TrackingStep[];
  driverName?: string;
  driverPhone?: string;
  currentLocation?: { lat: number; lng: number };
}

export default function OrderTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const orderId = params?.id || '12345';

  useEffect(() => {
    const loadOrder = async () => {
      await fetchOrderDetails();
    };
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockOrder: Order = {
        id: '1',
        orderNumber: '#' + orderId,
        customerName: 'Nguyễn Văn A',
        status: 'shipping',
        totalAmount: 285000,
        createdAt: '22 Jan 2026 10:30',
        estimatedDelivery: '22 Jan 2026 18:00',
        shippingAddress: '123 Nguyễn Huệ, Q1, TP HCM',
        items: [
          { name: 'Kẹo Xoàn Vàng', quantity: 2, price: 25000 },
          { name: 'Socola Đen', quantity: 1, price: 55000 },
          { name: 'Bánh Quy Vani', quantity: 1, price: 45000 },
        ],
        trackingSteps: [
          {
            id: 1,
            status: 'Đơn hàng được xác nhận',
            statusCode: 'confirmed',
            timestamp: '22 Jan 10:30',
            description: 'Đơn hàng của bạn đã được xác nhận',
            icon: '✓',
          },
          {
            id: 2,
            status: 'Đang chuẩn bị hàng',
            statusCode: 'preparing',
            timestamp: '22 Jan 11:45',
            description: 'Shop đang chuẩn bị đóng gói sản phẩm',
            icon: '📦',
          },
          {
            id: 3,
            status: 'Đang giao (Hiện tại)',
            statusCode: 'shipping',
            timestamp: '22 Jan 14:00',
            description: 'Đơn hàng đang được vận chuyển đến bạn',
            icon: '🚚',
          },
          {
            id: 4,
            status: 'Dự kiến giao',
            statusCode: 'delivered',
            timestamp: '22 Jan 18:00',
            description: 'Dự kiến giao hàng',
            icon: '🏠',
          },
        ],
        driverName: 'Trần Văn B',
        driverPhone: '+84 123 456 789',
      };
      setOrder(mockOrder);
    } catch {
      showToast('Lỗi kết nối API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = (): number => {
    if (!order) return 0;
    const stepMap: { [key: string]: number } = {
      confirmed: 0,
      preparing: 1,
      shipping: 2,
      delivered: 3,
    };
    return stepMap[order.status] || 0;
  };

  const handleCallDriver = () => {
    if (order?.driverPhone) {
      Linking.openURL(`tel:${order.driverPhone.replace(/\s+/g, '')}`);
    }
  };

  const handleContactSupport = () => {
    showToast('📞 Liên hệ hỗ trợ - Tính năng sẽ được cập nhật', 'info');
  };

  if (loading || !order) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
      </View>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  // Web view
  if (isWeb) {
    return (
      <View style={styles.containerWeb}>
        <ScrollView style={styles.content}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Quay lại</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>📦 Theo Dõi Đơn Hàng</Text>

          {/* Order Header */}
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>Đơn hàng {order.orderNumber}</Text>
              <Text style={styles.orderDate}>{order.createdAt}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {order.status === 'confirmed' && '✅ Đã xác nhận'}
                {order.status === 'preparing' && '📦 Đang chuẩn bị'}
                {order.status === 'shipping' && '🚚 Đang giao'}
                {order.status === 'delivered' && '✓ Đã giao'}
              </Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timeline}>
            <Text style={styles.timelineTitle}>📍 Tiến Trình Giao Hàng</Text>
            {order.trackingSteps.map((step, index) => (
              <View key={step.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineCircle,
                      index <= currentStepIndex && styles.timelineCircleActive,
                    ]}
                  >
                    <Text style={styles.timelineIcon}>{step.icon}</Text>
                  </View>
                  {index < order.trackingSteps.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        index < currentStepIndex && styles.timelineLineActive,
                      ]}
                    />
                  )}
                </View>

                <View style={styles.timelineRight}>
                  <Text style={[styles.timelineStatus, index <= currentStepIndex && styles.timelineStatusActive]}>
                    {step.status}
                  </Text>
                  <Text style={styles.timelineTime}>{step.timestamp}</Text>
                  <Text style={styles.timelineDescription}>{step.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Estimated Delivery */}
          {order.status === 'shipping' && (
            <View style={styles.estimatedCard}>
              <Text style={styles.estimatedTitle}>🕐 Dự Kiến Giao</Text>
              <Text style={styles.estimatedTime}>{order.estimatedDelivery}</Text>
              <Text style={styles.estimatedText}>
                Đơn hàng sẽ được giao trong thời gian dự kiến. Nếu có vấn đề, vui lòng liên hệ chúng tôi.
              </Text>
            </View>
          )}

          {/* Driver Info */}
          {order.driverName && order.status === 'shipping' && (
            <View style={styles.driverCard}>
              <Text style={styles.driverTitle}>👤 Thông Tin Tài Xế</Text>
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarEmoji}>👨</Text>
                </View>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{order.driverName}</Text>
                  <Text style={styles.driverStatus}>Đang giao hàng</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.callBtn} onPress={handleCallDriver}>
                <Text style={styles.callBtnText}>📞 Gọi Tài Xế</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Shipping Address */}
          <View style={styles.addressCard}>
            <Text style={styles.addressTitle}>📍 Địa Chỉ Giao Hàng</Text>
            <Text style={styles.addressName}>{order.customerName}</Text>
            <Text style={styles.addressText}>{order.shippingAddress}</Text>
          </View>

          {/* Order Items */}
          <View style={styles.itemsCard}>
            <Text style={styles.itemsTitle}>📦 Chi Tiết Đơn Hàng</Text>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>₫{(item.price * item.quantity).toLocaleString('vi-VN')}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.itemRow}>
              <Text style={styles.totalLabel}>Tổng Cộng:</Text>
              <Text style={styles.totalAmount}>₫{order.totalAmount.toLocaleString('vi-VN')}</Text>
            </View>
          </View>

          {/* Support Buttons */}
          <View style={styles.supportButtons}>
            <TouchableOpacity style={styles.supportBtn} onPress={handleContactSupport}>
              <Text style={styles.supportBtnText}>💬 Liên Hệ Hỗ Trợ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.supportBtn, styles.cancelBtn]}
              onPress={() => showToast('Tính năng sẽ được cập nhật', 'info')}
            >
              <Text style={styles.supportBtnText}>⚠️ Báo Cáo Vấn Đề</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Mobile view
  return (
    <View style={styles.container}>
      <View style={styles.mobileHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.mobileHeaderTitle}>Theo Dõi Đơn Hàng</Text>
        <TouchableOpacity onPress={handleContactSupport}>
          <Text style={styles.helpIcon}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.mobileContent}>
        {/* Order Header */}
        <View style={styles.mobileOrderHeader}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {order.status === 'confirmed' && '✅'}
              {order.status === 'preparing' && '📦'}
              {order.status === 'shipping' && '🚚'}
              {order.status === 'delivered' && '✓'}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.mobileTimeline}>
          {order.trackingSteps.map((step, index) => (
            <View key={step.id} style={styles.mobileTimelineItem}>
              <View
                style={[
                  styles.mobileTimelineCircle,
                  index <= currentStepIndex && styles.mobileTimelineCircleActive,
                ]}
              >
                <Text style={styles.timelineIcon}>{step.icon}</Text>
              </View>
              <View style={styles.mobileTimelineContent}>
                <Text style={[styles.mobileTimelineStatus, index <= currentStepIndex && styles.mobileTimelineStatusActive]}>
                  {step.status}
                </Text>
                <Text style={styles.mobileTimelineTime}>{step.timestamp}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Estimated */}
        {order.status === 'shipping' && (
          <View style={styles.mobileEstimatedCard}>
            <Text style={styles.estimatedTitle}>🕐 Dự Kiến Giao</Text>
            <Text style={styles.estimatedTime}>{order.estimatedDelivery}</Text>
          </View>
        )}

        {/* Driver */}
        {order.driverName && order.status === 'shipping' && (
          <View style={styles.mobileDriverCard}>
            <Text style={styles.driverTitle}>👤 Tài Xế</Text>
            <View style={styles.mobileDriverInfo}>
              <Text style={styles.driverName}>{order.driverName}</Text>
              <TouchableOpacity style={styles.mobileCallBtn} onPress={handleCallDriver}>
                <Text style={styles.mobileCallBtnText}>📞 Gọi</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Address */}
        <View style={styles.mobileAddressCard}>
          <Text style={styles.addressTitle}>📍 Giao Đến</Text>
          <Text style={styles.addressText}>{order.shippingAddress}</Text>
        </View>

        {/* Items */}
        <View style={styles.mobileItemsCard}>
          <Text style={styles.itemsTitle}>📦 Sản Phẩm</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.mobileItemRow}>
              <View style={styles.mobileItemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₫{(item.price * item.quantity).toLocaleString('vi-VN')}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.mobileItemRow}>
            <Text style={styles.totalLabel}>Tổng:</Text>
            <Text style={styles.totalAmount}>₫{order.totalAmount.toLocaleString('vi-VN')}</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.mobileButtons}>
          <TouchableOpacity style={styles.mobileBtn} onPress={handleContactSupport}>
            <Text style={styles.mobileBtnText}>💬 Liên Hệ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.mobileBtn, styles.mobileBtnSecondary]} onPress={() => showToast('Tính năng sẽ được cập nhật', 'info')}>
            <Text style={styles.mobileBtnText}>⚠️ Báo Cáo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerWeb: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  backBtn: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  backBtnText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mobileHeaderTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  helpIcon: {
    fontSize: 18,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mobileOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  orderDate: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#2c3e50',
  },
  timeline: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  timelineCircleActive: {
    backgroundColor: '#FFE4E1',
    borderColor: '#FF6B6B',
  },
  timelineIcon: {
    fontSize: 24,
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  timelineLineActive: {
    backgroundColor: '#FF6B6B',
  },
  timelineRight: {
    flex: 1,
    justifyContent: 'center',
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  timelineStatusActive: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  timelineTime: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  timelineDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  estimatedCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  mobileEstimatedCard: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  estimatedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  estimatedTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  estimatedText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  driverCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mobileDriverCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  driverTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mobileDriverInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE4E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverAvatarEmoji: {
    fontSize: 24,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  driverStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 2,
  },
  callBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  mobileCallBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  callBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mobileCallBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  addressCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mobileAddressCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  addressName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  addressText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginTop: 4,
    lineHeight: 18,
  },
  itemsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mobileItemsCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mobileItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemInfo: {
    flex: 1,
  },
  mobileItemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    color: '#2c3e50',
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  supportButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  supportBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#e74c3c',
  },
  supportBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mobileContent: {
    flex: 1,
    paddingBottom: 20,
  },
  mobileTimeline: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  mobileTimelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  mobileTimelineCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  mobileTimelineCircleActive: {
    backgroundColor: '#FFE4E1',
    borderColor: '#FF6B6B',
  },
  mobileTimelineContent: {
    flex: 1,
  },
  mobileTimelineStatus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  mobileTimelineStatusActive: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  mobileTimelineTime: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 2,
  },
  mobileButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
  },
  mobileBtn: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mobileBtnSecondary: {
    backgroundColor: '#e74c3c',
  },
  mobileBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loader: {
    marginTop: 20,
  },
});
