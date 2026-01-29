import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import AdminSidebar from '../components/AdminSidebar';
import { getApiUrl } from '../config/network';
import { useToast } from '../context/ToastContext';

const isWeb = Platform.OS === 'web';

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

export default function AdminOrders() {
  const { showToast } = useToast();
  const [allOrders, setAllOrders] = useState<Order[]>([]); // Lưu TẤT CẢ orders
  const [orders, setOrders] = useState<Order[]>([]); // Lưu orders được filter theo tab
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'all'>('pending');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      await fetchOrders();
    };
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Luôn fetch tất cả orders
      const res = await fetch(`${getApiUrl()}/api/orders`);
      if (res.ok) {
        const responseData = await res.json();
        let ordersArray = responseData.orders || responseData;
        ordersArray = Array.isArray(ordersArray) ? ordersArray : [];
        
        // Lưu tất cả orders vào allOrders
        setAllOrders(ordersArray);
        
        // Filter theo tab và set vào orders
        let filteredOrders = ordersArray;
        if (activeTab === 'pending') {
          filteredOrders = ordersArray.filter((o: Order) => o.status === 'pending');
        } else if (activeTab === 'confirmed') {
          filteredOrders = ordersArray.filter((o: Order) => o.status === 'confirmed');
        }
        // Nếu activeTab === 'all' thì giữ nguyên tất cả
        
        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleConfirmPayment = async (orderId: number) => {
    try {
      setConfirming(true);
      console.log('🔄 Confirming payment for order:', orderId);
      
      const res = await fetch(`${getApiUrl()}/api/orders/${orderId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Response status:', res.status);
      
      if (res.ok) {
        const responseData = await res.json();
        console.log('✅ Response data:', responseData);
        
        // Cập nhật allOrders: tìm order cũ và update status
        setAllOrders(prevOrders => {
          const updated = prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'confirmed' }
              : order
          );
          console.log('✓ Updated allOrders');
          return updated;
        });
        
        // Cập nhật orders list theo tab (remove nếu pending)
        if (activeTab === 'pending') {
          setOrders(prevOrders => {
            const filtered = prevOrders.filter(o => o.id !== orderId);
            console.log('✓ Filtered pending orders, count:', filtered.length);
            return filtered;
          });
        } else if (activeTab === 'confirmed') {
          // Nếu đang ở tab confirmed, thêm order vào
          if (responseData.order) {
            setOrders(prevOrders => [responseData.order, ...prevOrders]);
          }
        } else if (activeTab === 'all') {
          // Nếu ở tab all, update order đó
          setOrders(prevOrders => 
            prevOrders.map(order =>
              order.id === orderId 
                ? { ...order, status: 'confirmed' }
                : order
            )
          );
        }
        
        // Update selected order để modal show nút giao hàng
        if (responseData.order) {
          setSelectedOrder(responseData.order);
        }
        
        // Hiển thị toast SETELAH state update
        showToast('✅ Đơn hàng đã được xác nhận!', 'success');
      } else {
        console.log('❌ Response not ok');
        showToast('❌ Không thể xác nhận đơn hàng', 'error');
      }
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      showToast('❌ Đã xảy ra lỗi khi xác nhận thanh toán', 'error');
    } finally {
      setConfirming(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`${getApiUrl()}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await res.json();
        Alert.alert('Thành công', `Trạng thái đơn hàng cập nhật thành "${getStatusLabel(newStatus)}"`, [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              setSelectedOrder(null);
              fetchOrders();
            },
          },
        ]);
      } else {
        Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi cập nhật trạng thái');
    } finally {
      setUpdatingStatus(false);
    }
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

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận';
      case 'BANK':
        return 'Chuyển khoản';
      default:
        return method;
    }
  };

  return (
    isWeb ? (
      <View style={styles.containerWeb}>
        <AdminSidebar />
        <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Chờ xác nhận ({allOrders.filter(o => o.status === 'pending').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'confirmed' && styles.activeTab]}
          onPress={() => setActiveTab('confirmed')}
        >
          <Text style={[styles.tabText, activeTab === 'confirmed' && styles.activeTabText]}>
            Đã xác nhận ({allOrders.filter(o => o.status === 'confirmed').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tất cả ({allOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>📦</Text>
            <Text style={styles.emptyMessage}>Không có đơn hàng</Text>
          </View>
        ) : (
          <View style={styles.ordersList}>
            {orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => {
                    setSelectedOrder(order);
                    setModalVisible(true);
                  }}
                >
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>Đơn hàng #{order.id}</Text>
                    <Text style={styles.customerName}>{order.customerName}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Số điện thoại:</Text>
                    <Text style={styles.detailValue}>{order.phone}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Địa chỉ:</Text>
                    <Text style={styles.detailValue} numberOfLines={2}>
                      {order.address}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phương thức:</Text>
                    <View>
                      <Text style={styles.detailValue}>
                        {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận' : 'Chuyển khoản'}
                      </Text>
                      {order.paymentMethod === 'BANK' && order.status === 'pending' && (
                        <View style={styles.onlinePaymentBadge}>
                          <Text style={styles.onlinePaymentText}>💳 Chờ xác nhận thanh toán</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {order.transactionCode && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Mã giao dịch:</Text>
                      <Text style={[styles.detailValue, styles.transactionCode]}>
                        {order.transactionCode}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.detailRow, styles.totalRow]}>
                    <Text style={styles.detailLabel}>Tổng tiền:</Text>
                    <Text style={styles.totalAmount}>{formatCurrency(order.totalAmount)}</Text>
                  </View>
                </View>
                </TouchableOpacity>

                {order.status === 'pending' && (order.paymentMethod === 'BANK' || order.paymentMethod === 'COD') && (
                  <Pressable
                    style={styles.confirmButtonDirect}
                    onPress={() => handleConfirmPayment(order.id)}
                  >
                    <Text style={styles.confirmButtonDirectText}>✓ Xác nhận đơn hàng</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Chi tiết đơn hàng #{selectedOrder.id}</Text>
                  <Pressable onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </Pressable>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Tên:</Text>
                      <Text style={styles.infoValue}>{selectedOrder.customerName}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Số điện thoại:</Text>
                      <Text style={styles.infoValue}>{selectedOrder.phone}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Địa chỉ:</Text>
                      <Text style={styles.infoValue}>{selectedOrder.address}</Text>
                    </View>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Phương thức thanh toán:</Text>
                      <Text style={styles.infoValue}>
                        {selectedOrder.paymentMethod === 'COD' ? 'Thanh toán khi nhận' : 'Chuyển khoản'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Trạng thái:</Text>
                      <View
                        style={[
                          styles.statusBadgeModal,
                          { backgroundColor: getStatusColor(selectedOrder.status) },
                        ]}
                      >
                        <Text style={styles.statusText}>
                          {getStatusLabel(selectedOrder.status)}
                        </Text>
                      </View>
                    </View>
                    {selectedOrder.transactionCode && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mã giao dịch:</Text>
                        <Text style={styles.infoValue}>{selectedOrder.transactionCode}</Text>
                      </View>
                    )}
                    <View style={[styles.infoRow, styles.highlightRow]}>
                      <Text style={styles.infoLabel}>Tổng tiền:</Text>
                      <Text style={styles.infoValueBold}>
                        {formatCurrency(selectedOrder.totalAmount)}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {selectedOrder.status === 'pending' && selectedOrder.paymentMethod === 'BANK' && (
                  <View style={styles.modalFooter}>
                    <Pressable
                      style={styles.cancelButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>Hủy</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]}
                      onPress={() => handleConfirmPayment(selectedOrder.id)}
                      disabled={confirming}
                    >
                      <Text style={styles.confirmButtonText}>
                        {confirming ? 'Đang xác nhận...' : 'Xác nhận thanh toán'}
                      </Text>
                    </Pressable>
                  </View>
                )}

                {selectedOrder.status === 'pending' && selectedOrder.paymentMethod === 'COD' && (
                  <View style={styles.modalFooter}>
                    <Pressable
                      style={styles.cancelButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>Hủy</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.confirmButton, confirming && styles.confirmButtonDisabled]}
                      onPress={() => handleConfirmPayment(selectedOrder.id)}
                      disabled={confirming}
                    >
                      <Text style={styles.confirmButtonText}>
                        {confirming ? 'Đang xác nhận...' : 'Xác nhận đơn hàng'}
                      </Text>
                    </Pressable>
                  </View>
                )}
                {selectedOrder.status === 'shipped' && (
                  <View style={styles.statusUpdateContainer}>
                    <Text style={styles.sectionTitle}>Hoàn thành giao hàng</Text>
                    <Pressable
                      style={[styles.statusButton, styles.deliveredButton, { width: '100%' }]}
                      onPress={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                    >
                      <Text style={styles.statusButtonText}>✓ Đã giao hàng</Text>
                    </Pressable>
                  </View>
                )}

                {selectedOrder.status === 'delivered' && (
                  <View style={styles.modalFooter}>
                    <View style={styles.completedMessage}>
                      <Text style={styles.completedText}>✓ Đơn hàng đã hoàn thành</Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
        </View>
      </View>
    ) : (
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý đơn hàng</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Chờ xác nhận ({allOrders.filter(o => o.status === 'pending').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'confirmed' && styles.activeTab]}
          onPress={() => setActiveTab('confirmed')}
        >
          <Text style={[styles.tabText, activeTab === 'confirmed' && styles.activeTabText]}>
            Đã xác nhận ({allOrders.filter(o => o.status === 'confirmed').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tất cả ({allOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
          </View>
        ) : (
          <>
            {orders.map((order, idx) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => {
                  setSelectedOrder(order);
                  setModalVisible(true);
                }}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>Đơn #{idx + 1}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
                  </View>
                </View>

                <View style={styles.orderInfo}>
                  <Text style={styles.orderInfoLabel}>Khách hàng:</Text>
                  <Text style={styles.orderInfoValue}>{order.customerName}</Text>
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderInfoLabel}>Điện thoại:</Text>
                  <Text style={styles.orderInfoValue}>{order.phone}</Text>
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderInfoLabel}>Địa chỉ:</Text>
                  <Text style={styles.orderInfoValue} numberOfLines={2}>
                    {order.address}
                  </Text>
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderInfoLabel}>Tổng tiền:</Text>
                  <Text style={styles.orderInfoValue}>{formatCurrency(order.totalAmount)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* Order Detail Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButtonContainer} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Mã đơn hàng:</Text>
                    <Text style={styles.detailValue}>#{selectedOrder.id}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Trạng thái:</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status), alignSelf: 'flex-start' }]}>
                      <Text style={styles.statusText}>{getStatusLabel(selectedOrder.status)}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Khách hàng:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.customerName}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Điện thoại:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.phone}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Địa chỉ:</Text>
                    <Text style={styles.detailValue}>{selectedOrder.address}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Hình thức thanh toán:</Text>
                    <Text style={styles.detailValue}>{getPaymentMethodLabel(selectedOrder.paymentMethod)}</Text>
                  </View>

                  {selectedOrder.transactionCode && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Mã giao dịch:</Text>
                      <Text style={styles.detailValue}>{selectedOrder.transactionCode}</Text>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Tổng tiền:</Text>
                    <Text style={styles.detailValueAmount}>{formatCurrency(selectedOrder.totalAmount)}</Text>
                  </View>

                  {selectedOrder.createdAt && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Ngày tạo:</Text>
                      <Text style={styles.detailValue}>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</Text>
                    </View>
                  )}

                  <View style={styles.modalActions}>
                    {selectedOrder.status === 'pending' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.confirmButton]}
                        onPress={() => handleConfirmPayment(selectedOrder.id)}
                        disabled={confirming}
                      >
                        <Text style={styles.actionButtonText}>{confirming ? 'Đang xác nhận...' : 'Xác nhận thanh toán'}</Text>
                      </TouchableOpacity>
                    )}

                    {selectedOrder.status !== 'cancelled' && (
                      <Pressable
                        style={styles.statusUpdateButton}
                        onPress={() => {
                          Alert.alert('Cập nhật trạng thái', 'Chọn trạng thái mới:', [
                            { text: 'Pending', onPress: () => handleUpdateStatus(selectedOrder.id, 'pending') },
                            { text: 'Confirmed', onPress: () => handleUpdateStatus(selectedOrder.id, 'confirmed') },
                            { text: 'Cancelled', onPress: () => handleUpdateStatus(selectedOrder.id, 'cancelled') },
                            { text: 'Hủy', style: 'cancel' },
                          ]);
                        }}
                        disabled={updatingStatus}
                      >
                        <Text style={styles.actionButtonText}>{updatingStatus ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}</Text>
                      </Pressable>
                    )}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
    )
  );
}

const styles = StyleSheet.create({
  containerWeb: { flex: 1, flexDirection: 'row', backgroundColor: '#E8E8E8' },
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 8,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  tabContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6b7280',
  },
  ordersList: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  orderId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 13,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  transactionCode: {
    fontFamily: 'monospace',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 4,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    margin: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  confirmButtonDirect: {
    backgroundColor: '#10b981',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmButtonDirectText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '300',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  infoValueBold: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold',
    flex: 1.5,
    textAlign: 'right',
  },
  statusBadgeModal: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  highlightRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 4,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  confirmedMessage: {
    flex: 1,
    backgroundColor: '#d1fae5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmedText: {
    color: '#065f46',
    fontWeight: '600',
    fontSize: 14,
  },
  statusUpdateContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shippedButton: {
    backgroundColor: '#3b82f6',
  },
  deliveredButton: {
    backgroundColor: '#8b5cf6',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  completedMessage: {
    backgroundColor: '#d1fae5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    color: '#065f46',
    fontWeight: '600',
    fontSize: 14,
  },
  onlinePaymentBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  onlinePaymentText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderInfoLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  orderInfoValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1.5,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '300',
  },
  detailSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailValueAmount: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold',
    flex: 1.5,
    textAlign: 'right',
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusUpdateButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonContainer: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
