import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useToast } from '../context/ToastContext';

interface OrderWithStatus {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
  notes?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#3b82f6',
  confirmed: '#f59e0b',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Chờ xử lý',
  confirmed: '✅ Đã xác nhận',
  shipped: '🚚 Đang giao',
  delivered: '📦 Đã giao',
  cancelled: '❌ Bị hủy',
};

export default function AdminOrdersStatusScreen() {
  const { showToast } = useToast();

  const [orderList, setOrderList] = useState<OrderWithStatus[]>([
    {
      id: '1',
      orderNumber: 'ORD001',
      customerName: 'Nguyễn Văn A',
      totalAmount: 150000,
      status: 'pending',
      createdAt: new Date().toISOString(),
      items: [
        { name: 'Kẹo gấu dẻo', quantity: 2, price: 50000 },
        { name: 'Nước cam Fanta', quantity: 1, price: 50000 },
      ],
      notes: '',
    },
    {
      id: '2',
      orderNumber: 'ORD002',
      customerName: 'Trần Thị B',
      totalAmount: 250000,
      status: 'confirmed',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      items: [
        { name: 'Snack Olay', quantity: 3, price: 50000 },
        { name: 'Bánh quy Oreo', quantity: 2, price: 25000 },
      ],
      notes: '',
    },
    {
      id: '3',
      orderNumber: 'ORD003',
      customerName: 'Lê Văn C',
      totalAmount: 180000,
      status: 'shipped',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      items: [
        { name: 'Kem ốc quế', quantity: 4, price: 40000 },
        { name: 'Cà phê sữa', quantity: 1, price: 20000 },
      ],
      notes: '',
    },
  ]);
  const [filteredList, setFilteredList] = useState<OrderWithStatus[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithStatus | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Filter orders based on status and search
  useEffect(() => {
    let filtered = orderList;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (searchText) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchText.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    setFilteredList(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchText]);

  const handleStatusChange = (order: OrderWithStatus) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNotes(order.notes || '');
    setShowModal(true);
  };

  const handleSaveStatus = () => {
    if (!selectedOrder || !newStatus) {
      showToast('Vui lòng chọn trạng thái!', 'warning');
      return;
    }

    // Update local state
    const updatedList = orderList.map((order) =>
      order.id === selectedOrder.id
        ? { ...order, status: newStatus as any, notes }
        : order,
    );
    setOrderList(updatedList);

    showToast(`✅ Cập nhật đơn hàng ${selectedOrder.orderNumber} thành công!`, 'success');
    setShowModal(false);
  };

  const getStatusIndex = (status: string): number => {
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    return statuses.indexOf(status);
  };

  const renderStatusTimeline = (order: OrderWithStatus) => {
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = getStatusIndex(order.status);

    return (
      <View style={styles.timeline}>
        {statuses.map((status, index) => (
          <View key={status} style={styles.timelineItem}>
            <View
              style={[
                styles.timelineCircle,
                {
                  backgroundColor: index <= currentIndex ? STATUS_COLORS[status] : '#e5e7eb',
                },
              ]}
            >
              <Text style={styles.timelineLabel}>{index + 1}</Text>
            </View>
            {index < statuses.length - 1 && (
              <View
                style={[
                  styles.timelineLine,
                  {
                    backgroundColor: index < currentIndex ? STATUS_COLORS[status] : '#e5e7eb',
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: OrderWithStatus }) => {
    const statusColor = STATUS_COLORS[item.status];
    const statusLabel = STATUS_LABELS[item.status];

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>Đơn #{item.orderNumber}</Text>
            <Text style={styles.customerName}>{item.customerName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusBadgeText}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.infoLabel}>Số tiền:</Text>
          <Text style={styles.infoValue}>₫{item.totalAmount?.toLocaleString() || 0}</Text>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.infoLabel}>Ngày đặt:</Text>
          <Text style={styles.infoValue}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
        </View>

        {item.items && item.items.length > 0 && (
          <View style={styles.itemsSection}>
            <Text style={styles.itemsTitle}>Sản phẩm ({item.items.length}):</Text>
            {item.items.slice(0, 2).map((product: any, index: number) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {product.name}
                </Text>
                <Text style={styles.itemQty}>x{product.quantity}</Text>
              </View>
            ))}
            {item.items.length > 2 && (
              <Text style={styles.moreItems}>+{item.items.length - 2} sản phẩm khác</Text>
            )}
          </View>
        )}

        {renderStatusTimeline(item)}

        <TouchableOpacity
          style={styles.updateBtn}
          onPress={() => handleStatusChange(item)}
        >
          <Text style={styles.updateBtnText}>🔄 Cập nhật trạng thái</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Trạng thái Đơn hàng</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo mã đơn hoặc tên khách..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#bbb"
        />
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterBtn,
              statusFilter === status && styles.filterBtnActive,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterBtnText,
                statusFilter === status && styles.filterBtnTextActive,
              ]}
            >
              {status === 'all'
                ? '📋 Tất cả'
                : STATUS_LABELS[status]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Order List */}
      <ScrollView style={styles.content}>
        {filteredList.length > 0 ? (
          <FlatList
            data={filteredList}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Status Update Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cập nhật trạng thái</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.orderCard}>
                  <Text style={styles.orderNumber}>Đơn #{selectedOrder.orderNumber}</Text>
                  <Text style={styles.customerName}>{selectedOrder.customerName}</Text>
                  <Text style={styles.orderInfoText}>
                    Số tiền: ₫{selectedOrder.totalAmount?.toLocaleString() || 0}
                  </Text>
                </View>

                <Text style={styles.label}>Trạng thái hiện tại</Text>
                <View style={styles.currentStatusContainer}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: STATUS_COLORS[selectedOrder.status],
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                      },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {STATUS_LABELS[selectedOrder.status]}
                    </Text>
                  </View>
                </View>

                <Text style={styles.label}>Chọn trạng thái mới</Text>
                <View style={styles.statusPicker}>
                  {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        newStatus === status && styles.statusOptionSelected,
                      ]}
                      onPress={() => setNewStatus(status)}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: STATUS_COLORS[status],
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusOptionText,
                          newStatus === status && styles.statusOptionTextSelected,
                        ]}
                      >
                        {STATUS_LABELS[status]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Ghi chú (tùy chọn)</Text>
                <TextInput
                  style={[styles.notesInput]}
                  placeholder="Nhập ghi chú cho khách hàng..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#bbb"
                />
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={handleSaveStatus}
              >
                <Text style={styles.submitBtnText}>Cập nhật</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#d63031',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  filterScroll: {
    backgroundColor: '#fff',
  },
  filterContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterBtnActive: {
    backgroundColor: '#d63031',
    borderColor: '#d63031',
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    padding: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#d63031',
  },
  customerName: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  itemsSection: {
    marginVertical: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 11,
    color: '#666',
  },
  itemQty: {
    fontSize: 11,
    color: '#999',
  },
  moreItems: {
    fontSize: 11,
    color: '#3b82f6',
    marginTop: 4,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingVertical: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timelineCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  timelineLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 2,
  },
  updateBtn: {
    backgroundColor: '#d63031',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  updateBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '95%',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeBtn: {
    fontSize: 24,
    color: '#999',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  currentStatusContainer: {
    marginBottom: 12,
  },
  orderInfoText: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  statusPicker: {
    gap: 8,
    marginBottom: 12,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  statusOptionSelected: {
    backgroundColor: '#fff',
    borderColor: '#d63031',
    borderWidth: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOptionText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  statusOptionTextSelected: {
    color: '#d63031',
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#e0e0e0',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  submitBtn: {
    backgroundColor: '#10b981',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
