import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  FlatList,
} from 'react-native';
import AdminSidebar from '../components/AdminSidebar';
import { useToast } from '../context/ToastContext';

const isWeb = Platform.OS === 'web';

interface InventoryItem {
  id: number;
  productName: string;
  sku: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  lastRestocked: string;
  unit: string;
}

export default function AdminInventoryScreen() {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'critical'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    quantity: '',
    reason: 'Nhập kho',
  });

  useEffect(() => {
    const loadInventory = async () => {
      await fetchInventory();
    };
    loadInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockInventory: InventoryItem[] = [
        {
          id: 1,
          productName: 'Kẹo Xoàn Vàng',
          sku: 'CANDY-001',
          currentStock: 45,
          minStock: 20,
          maxStock: 100,
          reorderLevel: 30,
          lastRestocked: '2026-01-20',
          unit: 'hộp',
        },
        {
          id: 2,
          productName: 'Nước Cam Squeeze',
          sku: 'JUICE-002',
          currentStock: 8,
          minStock: 15,
          maxStock: 50,
          reorderLevel: 20,
          lastRestocked: '2026-01-15',
          unit: 'chai',
        },
        {
          id: 3,
          productName: 'Bánh Quy Hương Vani',
          sku: 'BISCUIT-003',
          currentStock: 2,
          minStock: 10,
          maxStock: 80,
          reorderLevel: 25,
          lastRestocked: '2026-01-10',
          unit: 'gói',
        },
        {
          id: 4,
          productName: 'Socola Đen Nguyên Chất',
          sku: 'CHOCO-004',
          currentStock: 156,
          minStock: 30,
          maxStock: 200,
          reorderLevel: 50,
          lastRestocked: '2026-01-22',
          unit: 'cái',
        },
        {
          id: 5,
          productName: 'Mứt Dâu Tây',
          sku: 'JAM-005',
          currentStock: 0,
          minStock: 10,
          maxStock: 40,
          reorderLevel: 15,
          lastRestocked: '2025-12-15',
          unit: 'lọ',
        },
      ];
      setInventory(mockInventory);
    } catch {
      showToast('Lỗi kết nối API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (item: InventoryItem): 'critical' | 'low' | 'normal' => {
    if (item.currentStock === 0) return 'critical';
    if (item.currentStock < item.minStock) return 'critical';
    if (item.currentStock < item.reorderLevel) return 'low';
    return 'normal';
  };

  const getStatusColor = (status: 'critical' | 'low' | 'normal') => {
    switch (status) {
      case 'critical':
        return '#e74c3c';
      case 'low':
        return '#f39c12';
      default:
        return '#10b981';
    }
  };

  const getStatusLabel = (status: 'critical' | 'low' | 'normal') => {
    switch (status) {
      case 'critical':
        return '🔴 HẾT / NGUY HIỂM';
      case 'low':
        return '🟡 SẮP HẾT';
      default:
        return '🟢 BÌNH THƯỜNG';
    }
  };

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({ quantity: '', reason: 'Nhập kho' });
    setModalVisible(true);
  };

  const handleSaveStock = () => {
    if (!formData.quantity) {
      showToast('Vui lòng nhập số lượng!', 'error');
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity === 0) {
      showToast('Số lượng không hợp lệ!', 'error');
      return;
    }

    setInventory(inventory.map(item =>
      item.id === selectedItem!.id
        ? {
          ...item,
          currentStock: Math.max(0, item.currentStock + quantity),
          lastRestocked: new Date().toISOString().split('T')[0],
        }
        : item
    ));

    showToast(
      quantity > 0
        ? `✅ Thêm ${quantity} ${selectedItem!.unit} thành công!`
        : `✅ Giảm ${Math.abs(quantity)} ${selectedItem!.unit} thành công!`,
      'success'
    );

    setModalVisible(false);
  };

  const handleViewHistory = (item: InventoryItem) => {
    Alert.alert(
      `📋 Lịch sử: ${item.productName}`,
      `SKU: ${item.sku}\nTồn kho hiện tại: ${item.currentStock} ${item.unit}\nLần nhập gần nhất: ${item.lastRestocked}`,
      [{ text: 'Đóng', style: 'cancel' }]
    );
  };

  // Filter
  const filteredInventory = inventory.filter(item => {
    const matchSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || getStockStatus(item) === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  // Web view
  if (isWeb) {
    return (
      <View style={styles.containerWeb}>
        <AdminSidebar />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📦 Quản lý Hàng Tồn Kho</Text>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Tìm kiếm tên sản phẩm, SKU..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.filterButtons}>
            {(['all', 'low', 'critical'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterBtn,
                  filterStatus === status && styles.filterBtnActive,
                ]}
                onPress={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    filterStatus === status && styles.filterBtnTextActive,
                  ]}
                >
                  {status === 'all' ? 'Tất Cả' : status === 'low' ? '🟡 Sắp Hết' : '🔴 Nguy Hiểm'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
          ) : paginatedInventory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            </View>
          ) : (
            <>
              {paginatedInventory.map((item) => {
                const status = getStockStatus(item);
                return (
                  <View key={item.id} style={styles.inventoryCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.productName}</Text>
                        <Text style={styles.sku}>SKU: {item.sku}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(status) },
                        ]}
                      >
                        <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
                      </View>
                    </View>

                    <View style={styles.stockInfo}>
                      <View style={styles.stockRow}>
                        <Text style={styles.stockLabel}>📊 Tồn kho:</Text>
                        <Text style={[styles.stockValue, { color: getStatusColor(status) }]}>
                          {item.currentStock} {item.unit}
                        </Text>
                      </View>
                      <View style={styles.stockRow}>
                        <Text style={styles.stockLabel}>⚠️ Tối thiểu:</Text>
                        <Text style={styles.stockValue}>{item.minStock} {item.unit}</Text>
                      </View>
                      <View style={styles.stockRow}>
                        <Text style={styles.stockLabel}>📈 Tối đa:</Text>
                        <Text style={styles.stockValue}>{item.maxStock} {item.unit}</Text>
                      </View>
                      <View style={styles.stockRow}>
                        <Text style={styles.stockLabel}>🔔 Mức đặt hàng:</Text>
                        <Text style={styles.stockValue}>{item.reorderLevel} {item.unit}</Text>
                      </View>
                    </View>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.updateBtn]}
                        onPress={() => handleUpdateStock(item)}
                      >
                        <Text style={styles.actionBtnText}>✏️ Cập nhật</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.historyBtn]}
                        onPress={() => handleViewHistory(item)}
                      >
                        <Text style={styles.actionBtnText}>📋 Lịch sử</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    disabled={currentPage === 1}
                    onPress={() => setCurrentPage(currentPage - 1)}
                    style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                  >
                    <Text style={styles.pageBtnText}>← Trước</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageInfo}>{currentPage}/{totalPages}</Text>
                  <TouchableOpacity
                    disabled={currentPage === totalPages}
                    onPress={() => setCurrentPage(currentPage + 1)}
                    style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                  >
                    <Text style={styles.pageBtnText}>Sau →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    );
  }

  // Mobile view
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📦 Hàng Tồn Kho</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Tìm kiếm..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView horizontal style={styles.filterButtonsScroll}>
        {(['all', 'low', 'critical'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterBtn,
              filterStatus === status && styles.filterBtnActive,
            ]}
            onPress={() => {
              setFilterStatus(status);
              setCurrentPage(1);
            }}
          >
            <Text
              style={[
                styles.filterBtnText,
                filterStatus === status && styles.filterBtnTextActive,
              ]}
            >
              {status === 'all' ? 'Tất Cả' : status === 'low' ? '🟡' : '🔴'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
      ) : (
        <FlatList
          data={paginatedInventory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const status = getStockStatus(item);
            return (
              <View style={styles.inventoryCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.productName}
                    </Text>
                    <Text style={styles.sku}>{item.sku}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(status) },
                    ]}
                  >
                    <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
                  </View>
                </View>

                <View style={styles.stockRow}>
                  <Text style={styles.stockLabel}>📊 Tồn:</Text>
                  <Text style={[styles.stockValue, { color: getStatusColor(status), fontSize: 16, fontWeight: 'bold' }]}>
                    {item.currentStock} {item.unit}
                  </Text>
                  <Text style={styles.stockLabel}>/ {item.minStock}-{item.maxStock}</Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.updateBtn]}
                    onPress={() => handleUpdateStock(item)}
                  >
                    <Text style={styles.actionBtnText}>✏️ Cập nhật</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.historyBtn]}
                    onPress={() => handleViewHistory(item)}
                  >
                    <Text style={styles.actionBtnText}>📋</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            </View>
          }
        />
      )}

      {/* Modal */}
      {modalVisible && selectedItem && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>✏️ Cập nhật Hàng Tồn Kho</Text>

            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoText}>📦 {selectedItem.productName}</Text>
              <Text style={styles.modalInfoText}>📊 Tồn kho hiện tại: {selectedItem.currentStock} {selectedItem.unit}</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Số lượng (+ để thêm, - để giảm)"
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
              keyboardType="number-pad"
            />

            <View style={styles.reasonContainer}>
              <Text style={styles.reasonLabel}>Lý do:</Text>
              {(['Nhập kho', 'Kiểm tra', 'Hư hỏng', 'Mất mát'] as const).map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonBtn,
                    formData.reason === reason && styles.reasonBtnActive,
                  ]}
                  onPress={() => setFormData({ ...formData, reason })}
                >
                  <Text
                    style={[
                      styles.reasonBtnText,
                      formData.reason === reason && styles.reasonBtnTextActive,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveStock}>
                <Text style={styles.saveBtnText}>💾 Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>✖️ Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  containerWeb: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    marginBottom: 16,
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterButtonsScroll: {
    marginBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterBtnActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  filterBtnText: {
    color: '#7f8c8d',
    fontWeight: '600',
    fontSize: 12,
  },
  filterBtnTextActive: {
    color: 'white',
  },
  loader: {
    marginTop: 20,
  },
  inventoryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sku: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  stockInfo: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  stockValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateBtn: {
    backgroundColor: '#3498db',
  },
  historyBtn: {
    backgroundColor: '#9b59b6',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3498db',
    borderRadius: 6,
  },
  pageBtnDisabled: {
    backgroundColor: '#bdc3c7',
  },
  pageBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  modalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: isWeb ? 500 : '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  modalInfo: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  modalInfoText: {
    fontSize: 13,
    color: '#2c3e50',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    fontSize: 14,
  },
  reasonContainer: {
    marginBottom: 16,
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  reasonBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  reasonBtnActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  reasonBtnText: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  reasonBtnTextActive: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
