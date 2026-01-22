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
import { useRouter } from 'expo-router';
import { useToast } from '../context/ToastContext';

const isWeb = Platform.OS === 'web';

interface Promotion {
  id: number;
  title: string;
  description: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts?: string;
  code?: string;
}

export default function AdminPromotionsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: '',
    startDate: '',
    endDate: '',
    code: '',
  });

  const menuItems = [
    { id: 1, title: 'Trang chu', icon: '', route: '/AdminScreen' },
    { id: 2, title: 'Menu', icon: '', route: '#' },
    { id: 3, title: 'San pham', icon: '', route: '/AdminProductsScreen' },
    { id: 6, title: 'Danh muc', icon: '', route: '/AdminCategoriesScreen' },
    { id: 9, title: 'Don hang', icon: '', route: '/AdminOrders' },
    { id: 4, title: 'Voucher', icon: '', route: '/AdminVouchersScreen' },
    { id: 5, title: 'Nguoi dung', icon: '', route: '/AdminUsersScreen' },
    { id: 7, title: 'Thong ke', icon: '', route: '/AdminAnalyticsScreen' },
    { id: 8, title: 'Binh luan', icon: '', route: '/AdminCommentsScreen' },
    { id: 10, title: 'Khuyen mai', icon: '', route: '/AdminPromotionsScreen' },
  ];

  useEffect(() => {
    const loadPromotions = async () => {
      await fetchPromotions();
    };
    loadPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      // Mock data - thay thế bằng API thực
      const mockPromotions: Promotion[] = [
        {
          id: 1,
          title: 'Flash Sale Giáp Tết',
          description: 'Giảm 30% tất cả kẹo',
          discountType: 'percent',
          discountValue: 30,
          startDate: '2026-01-22',
          endDate: '2026-01-25',
          isActive: true,
          code: 'TETDEAL',
        },
        {
          id: 2,
          title: 'Khuyến mãi tháng 1',
          description: 'Mua 2 tặng 1',
          discountType: 'fixed',
          discountValue: 50000,
          startDate: '2026-01-01',
          endDate: '2026-01-31',
          isActive: true,
          code: 'JANUARY50K',
        },
        {
          id: 3,
          title: 'Sale nước ép',
          description: 'Giảm 20% nước ép tươi',
          discountType: 'percent',
          discountValue: 20,
          startDate: '2026-01-15',
          endDate: '2026-01-20',
          isActive: false,
          code: 'JUICE20',
        },
        {
          id: 4,
          title: 'Black Friday',
          description: 'Giảm 50% sản phẩm chọn',
          discountType: 'percent',
          discountValue: 50,
          startDate: '2026-01-30',
          endDate: '2026-02-05',
          isActive: false,
          code: 'BLACKFRI',
        },
      ];
      setPromotions(mockPromotions);
    } catch {
      showToast('Lỗi kết nối API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromotion = () => {
    setSelectedPromotion(null);
    setFormData({
      title: '',
      description: '',
      discountType: 'percent',
      discountValue: '',
      startDate: '',
      endDate: '',
      code: '',
    });
    setModalVisible(true);
  };

  const handleEditPromotion = (promo: Promotion) => {
    setSelectedPromotion(promo);
    setFormData({
      title: promo.title,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue.toString(),
      startDate: promo.startDate,
      endDate: promo.endDate,
      code: promo.code || '',
    });
    setModalVisible(true);
  };

  const handleSavePromotion = () => {
    if (!formData.title || !formData.discountValue || !formData.startDate || !formData.endDate) {
      showToast('Vui lòng điền đầy đủ thông tin!', 'error');
      return;
    }

    if (selectedPromotion) {
      setPromotions(promotions.map(p =>
        p.id === selectedPromotion.id
          ? {
            ...p,
            ...formData,
            discountValue: parseFloat(formData.discountValue),
          }
          : p
      ));
      showToast('✅ Cập nhật khuyến mãi thành công!', 'success');
    } else {
      const newPromotion: Promotion = {
        id: Math.max(...promotions.map(p => p.id), 0) + 1,
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        isActive: true,
      };
      setPromotions([...promotions, newPromotion]);
      showToast('✅ Thêm khuyến mãi thành công!', 'success');
    }

    setModalVisible(false);
  };

  const handleDeletePromotion = (promo: Promotion) => {
    Alert.alert('Xóa khuyến mãi', 'Bạn chắc chắn xóa khuyến mãi này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        onPress: () => {
          setPromotions(promotions.filter(p => p.id !== promo.id));
          showToast('✅ Xóa thành công!', 'success');
        },
        style: 'destructive',
      },
    ]);
  };

  const handleToggleActive = (promo: Promotion) => {
    setPromotions(promotions.map(p =>
      p.id === promo.id ? { ...p, isActive: !p.isActive } : p
    ));
    showToast(promo.isActive ? '⏸️ Tạm dừng khuyến mãi' : '▶️ Kích hoạt khuyến mãi', 'success');
  };

  const filteredPromotions = promotions.filter(promo =>
    promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    promo.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPromotions = filteredPromotions.slice(startIndex, startIndex + itemsPerPage);

  const getDiscountLabel = (promo: Promotion) => {
    return promo.discountType === 'percent'
      ? `${promo.discountValue}%`
      : `₫${promo.discountValue.toLocaleString('vi-VN')}`;
  };

  const isPromotionActive = (promo: Promotion): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return promo.isActive && promo.startDate <= today && today <= promo.endDate;
  };

  // Web view
  if (isWeb) {
    return (
      <View style={styles.containerWeb}>
        <Sidebar menuItems={menuItems} router={router} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🎉 Quản lý Khuyến Mãi</Text>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddPromotion}>
              <Text style={styles.addBtnText}>➕ Thêm Khuyến Mãi</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Tìm kiếm khuyến mãi, mã code..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
          ) : paginatedPromotions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyText}>Không tìm thấy khuyến mãi</Text>
            </View>
          ) : (
            <>
              {paginatedPromotions.map((promo) => (
                <View key={promo.id} style={styles.promoCard}>
                  <View style={styles.promoHeader}>
                    <View style={styles.promoInfo}>
                      <View style={styles.promoTitleRow}>
                        <Text style={styles.promoTitle}>{promo.title}</Text>
                        {isPromotionActive(promo) && (
                          <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>🔴 ĐANG CHẠY</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.promoDescription}>{promo.description}</Text>
                    </View>
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{getDiscountLabel(promo)}</Text>
                    </View>
                  </View>

                  <View style={styles.promoDetails}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>💳 Mã Code:</Text>
                      <Text style={styles.detailValue}>{promo.code || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>📅 Từ:</Text>
                      <Text style={styles.detailValue}>{promo.startDate}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>📅 Đến:</Text>
                      <Text style={styles.detailValue}>{promo.endDate}</Text>
                    </View>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, promo.isActive ? styles.pauseBtn : styles.playBtn]}
                      onPress={() => handleToggleActive(promo)}
                    >
                      <Text style={styles.actionBtnText}>{promo.isActive ? '⏸️ Tạm dừng' : '▶️ Kích hoạt'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.editBtn]}
                      onPress={() => handleEditPromotion(promo)}
                    >
                      <Text style={styles.actionBtnText}>✏️ Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => handleDeletePromotion(promo)}
                    >
                      <Text style={styles.actionBtnText}>🗑️ Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

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

        {/* Modal */}
        {modalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>
                {selectedPromotion ? '✏️ Cập nhật Khuyến mãi' : '➕ Thêm Khuyến mãi'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Tên khuyến mãi"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Mô tả"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Mã khuyến mãi"
                value={formData.code}
                onChangeText={(text) => setFormData({ ...formData, code: text })}
              />

              <View style={styles.formRow}>
                <TouchableOpacity
                  style={[styles.typeBtn, formData.discountType === 'percent' && styles.typeBtnActive]}
                  onPress={() => setFormData({ ...formData, discountType: 'percent' })}
                >
                  <Text style={styles.typeBtnText}>%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, formData.discountType === 'fixed' && styles.typeBtnActive]}
                  onPress={() => setFormData({ ...formData, discountType: 'fixed' })}
                >
                  <Text style={styles.typeBtnText}>₫</Text>
                </TouchableOpacity>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Giá trị giảm"
                  value={formData.discountValue}
                  onChangeText={(text) => setFormData({ ...formData, discountValue: text })}
                  keyboardType="numeric"
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Ngày bắt đầu (YYYY-MM-DD)"
                value={formData.startDate}
                onChangeText={(text) => setFormData({ ...formData, startDate: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Ngày kết thúc (YYYY-MM-DD)"
                value={formData.endDate}
                onChangeText={(text) => setFormData({ ...formData, endDate: text })}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSavePromotion}>
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

  // Mobile view
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎉 Khuyến Mãi</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleAddPromotion}>
          <Text style={styles.addBtnText}>➕</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Tìm kiếm..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
      ) : (
        <FlatList
          data={paginatedPromotions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: promo }) => (
            <View style={styles.promoCard}>
              <View style={styles.promoHeader}>
                <View style={styles.promoInfo}>
                  <View style={styles.promoTitleRow}>
                    <Text style={styles.promoTitle} numberOfLines={1}>
                      {promo.title}
                    </Text>
                    {isPromotionActive(promo) && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>🔴</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.promoDescription} numberOfLines={1}>
                    {promo.description}
                  </Text>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{getDiscountLabel(promo)}</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, promo.isActive ? styles.pauseBtn : styles.playBtn]}
                  onPress={() => handleToggleActive(promo)}
                >
                  <Text style={styles.actionBtnText}>{promo.isActive ? '⏸️' : '▶️'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => handleEditPromotion(promo)}
                >
                  <Text style={styles.actionBtnText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeletePromotion(promo)}
                >
                  <Text style={styles.actionBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyText}>Không tìm thấy khuyến mãi</Text>
            </View>
          }
        />
      )}

      {/* Modal */}
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modal}>
            <Text style={styles.modalTitle}>
              {selectedPromotion ? '✏️ Cập nhật' : '➕ Thêm'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Tên khuyến mãi"
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Mô tả"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Mã khuyến mãi"
              value={formData.code}
              onChangeText={(text) => setFormData({ ...formData, code: text })}
            />

            <View style={styles.formRow}>
              <TouchableOpacity
                style={[styles.typeBtn, formData.discountType === 'percent' && styles.typeBtnActive]}
                onPress={() => setFormData({ ...formData, discountType: 'percent' })}
              >
                <Text style={styles.typeBtnText}>%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, formData.discountType === 'fixed' && styles.typeBtnActive]}
                onPress={() => setFormData({ ...formData, discountType: 'fixed' })}
              >
                <Text style={styles.typeBtnText}>₫</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Giá trị"
                value={formData.discountValue}
                onChangeText={(text) => setFormData({ ...formData, discountValue: text })}
                keyboardType="numeric"
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Từ (YYYY-MM-DD)"
              value={formData.startDate}
              onChangeText={(text) => setFormData({ ...formData, startDate: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Đến (YYYY-MM-DD)"
              value={formData.endDate}
              onChangeText={(text) => setFormData({ ...formData, endDate: text })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSavePromotion}>
                <Text style={styles.saveBtnText}>💾 Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>✖️ Đóng</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function Sidebar({ menuItems, router }: any) {
  return (
    <ScrollView style={styles.sidebar}>
      {menuItems.map((item: any) => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuItem}
          onPress={() => router.push(item.route)}
        >
          <Text style={styles.menuText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
  sidebar: {
    width: 200,
    backgroundColor: '#2c3e50',
    paddingVertical: 20,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#34495e',
    borderBottomWidth: 1,
  },
  menuText: {
    color: '#ecf0f1',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    marginBottom: 16,
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
    flexDirection: isWeb ? 'row' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  addBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loader: {
    marginTop: 20,
  },
  promoCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promoInfo: {
    flex: 1,
  },
  promoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  promoDescription: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  discountBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 12,
  },
  discountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  promoDetails: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    flexDirection: isWeb ? 'row' : 'column',
    gap: 16,
  },
  detailItem: {
    flex: isWeb ? 1 : undefined,
  },
  detailLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
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
  editBtn: {
    backgroundColor: '#3498db',
  },
  pauseBtn: {
    backgroundColor: '#f39c12',
  },
  playBtn: {
    backgroundColor: '#27ae60',
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
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
  input: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  typeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
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
