import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAdminVoucher, AdminVoucher } from '../context/AdminVoucherContext';
import { useToast } from '../context/ToastContext';

const isWeb = Platform.OS === 'web';

export default function AdminVouchersScreen() {
  const router = useRouter();
  const { vouchers, createVoucher, updateVoucher, deleteVoucher, toggleVoucher } = useAdminVoucher();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<AdminVoucher | null>(null);

  const menuItems = [
    { id: 1, title: 'Trang chu', icon: '', route: '/AdminScreen' },
    { id: 2, title: 'Menu', icon: '', route: '#' },
    { id: 3, title: 'San pham', icon: '', route: '/AdminProductsScreen' },
    { id: 9, title: 'Don hang', icon: '', route: '/AdminOrders' },
    { id: 4, title: 'Voucher', icon: '', route: '/AdminVouchersScreen' },
    { id: 5, title: 'Nguoi dung', icon: '', route: '/AdminUsersScreen' },
  ];
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'percent' as 'percent' | 'fixed',
    description: '',
    expiryDate: '',
    minOrder: '',
    maxUse: '',
  });

  const handleOpenModal = (voucher?: AdminVoucher) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setFormData({
        code: voucher.code,
        discount: voucher.discount.toString(),
        type: voucher.type,
        description: voucher.description,
        expiryDate: voucher.expiryDate,
        minOrder: voucher.minOrder?.toString() || '',
        maxUse: voucher.maxUse?.toString() || '',
      });
    } else {
      setEditingVoucher(null);
      setFormData({
        code: '',
        discount: '',
        type: 'percent',
        description: '',
        expiryDate: '',
        minOrder: '',
        maxUse: '',
      });
    }
    setShowModal(true);
  };

  const handleSaveVoucher = async () => {
    if (!formData.code || !formData.discount || !formData.expiryDate) {
      showToast('Vui lòng điền đủ thông tin!', 'warning');
      return;
    }

    const voucher: AdminVoucher = {
      id: editingVoucher?.id,
      code: formData.code.toUpperCase(),
      discount: parseFloat(formData.discount),
      type: formData.type,
      description: formData.description,
      expiryDate: formData.expiryDate,
      minOrder: formData.minOrder ? parseInt(formData.minOrder) : undefined,
      maxUse: formData.maxUse ? parseInt(formData.maxUse) : undefined,
      isActive: editingVoucher?.isActive || true,
    };

    if (editingVoucher) {
      const success = await updateVoucher(voucher);
      if (success) {
        showToast('✅ Cập nhật voucher thành công!', 'success');
      } else {
        showToast('❌ Cập nhật thất bại!', 'error');
      }
    } else {
      const success = await createVoucher(voucher);
      if (success) {
        showToast('✅ Tạo voucher thành công!', 'success');
      } else {
        showToast('❌ Tạo thất bại!', 'error');
      }
    }

    setShowModal(false);
  };

  const handleDeleteVoucher = (voucher: AdminVoucher) => {
    Alert.alert('Xác nhận xóa', `Xóa voucher "${voucher.code}"?`, [
      { text: 'Hủy', onPress: () => {} },
      {
        text: 'Xóa',
        onPress: async () => {
          if (voucher.id) {
            const success = await deleteVoucher(voucher.id);
            if (success) {
              showToast('✅ Xóa voucher thành công!', 'success');
            } else {
              showToast('❌ Xóa thất bại!', 'error');
            }
          }
        },
      },
    ]);
  };

  const renderVoucherItem = ({ item }: { item: AdminVoucher }) => {
    const isExpired = new Date(item.expiryDate) < new Date();
    const usagePercent = item.maxUse ? Math.round(((item.usedCount || 0) / item.maxUse) * 100) : 0;

    return (
      <View style={styles.voucherCard}>
        <View style={styles.voucherHeader}>
          <View>
            <Text style={styles.voucherCode}>{item.code}</Text>
            <Text style={styles.voucherDesc} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <View style={styles.voucherBadge}>
            <Text style={styles.voucherDiscount}>
              {item.type === 'percent' ? `${item.discount}%` : `₫${item.discount.toLocaleString()}`}
            </Text>
          </View>
        </View>

        <View style={styles.voucherMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>HSD:</Text>
            <Text style={[styles.metaValue, isExpired && styles.expired]}>
              {new Date(item.expiryDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>
          {item.maxUse && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Sử dụng: {item.usedCount || 0}/{item.maxUse}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${usagePercent}%` }]} />
              </View>
            </View>
          )}
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Trạng thái:</Text>
            <Switch
              value={item.isActive && !isExpired}
              onValueChange={() => {
                toggleVoucher(item.id!);
              }}
              disabled={isExpired}
            />
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenModal(item)}>
            <Text style={styles.actionBtnText}>✏️ Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteVoucher(item)}>
            <Text style={styles.actionBtnText}>🗑️ Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    isWeb ? (
      <View style={styles.containerWeb}>
        <Sidebar menuItems={menuItems} router={router} />
        <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Voucher</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()}>
          <Text style={styles.addBtnText}>+ Tạo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {vouchers.length > 0 ? (
          <FlatList
            data={vouchers}
            renderItem={renderVoucherItem}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Chưa có voucher nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Create/Edit Voucher Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingVoucher ? 'Chỉnh sửa voucher' : 'Tạo voucher'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Mã voucher *</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: SALE2025"
                value={formData.code}
                onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
              />

              <Text style={styles.label}>Loại giảm giá *</Text>
              <View style={styles.typePicker}>
                <TouchableOpacity
                  style={[styles.typeOption, formData.type === 'percent' && styles.typeOptionSelected]}
                  onPress={() => setFormData({ ...formData, type: 'percent' })}
                >
                  <Text style={styles.typeOptionText}>Phần trăm (%)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeOption, formData.type === 'fixed' && styles.typeOptionSelected]}
                  onPress={() => setFormData({ ...formData, type: 'fixed' })}
                >
                  <Text style={styles.typeOptionText}>Số tiền (₫)</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Giá trị giảm *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập giá trị"
                value={formData.discount}
                onChangeText={(text) => setFormData({ ...formData, discount: text })}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Mô tả voucher"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={2}
              />

              <Text style={styles.label}>Ngày hết hạn *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.expiryDate}
                onChangeText={(text) => setFormData({ ...formData, expiryDate: text })}
              />

              <Text style={styles.label}>Đơn hàng tối thiểu (₫)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 100000"
                value={formData.minOrder}
                onChangeText={(text) => setFormData({ ...formData, minOrder: text })}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Số lần sử dụng tối đa</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 100"
                value={formData.maxUse}
                onChangeText={(text) => setFormData({ ...formData, maxUse: text })}
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowModal(false)}>
                <Text style={styles.modalBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.submitBtn]} onPress={handleSaveVoucher}>
                <Text style={styles.submitBtnText}>{editingVoucher ? 'Cập nhật' : 'Tạo'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
        </View>
      </View>
    ) : (
      <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Voucher</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()}>
          <Text style={styles.addBtnText}>+ Tạo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {vouchers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có voucher nào</Text>
          </View>
        ) : (
          <FlatList
            data={vouchers}
            renderItem={({ item }) => (
              <View style={styles.voucherCard}>
                <View style={styles.voucherHeader}>
                  <Text style={styles.voucherCode}>{item.code}</Text>
                  <Switch
                    value={item.isActive}
                    onValueChange={() => toggleVoucher(item.id!)}
                    trackColor={{ false: '#767577', true: '#81c784' }}
                    thumbColor={item.isActive ? '#4caf50' : '#f50057'}
                  />
                </View>

                <Text style={styles.voucherDiscount}>
                  Giảm: {item.discount}
                  {item.type === 'percent' ? '%' : '₫'}
                </Text>
                <Text style={styles.voucherDescription}>{item.description}</Text>

                <View style={styles.voucherDetails}>
                  {item.minOrder && (
                    <Text style={styles.detailText}>Đơn tối thiểu: {item.minOrder}₫</Text>
                  )}
                  {item.maxUse && (
                    <Text style={styles.detailText}>Tối đa sử dụng: {item.maxUse}</Text>
                  )}
                  <Text style={styles.detailText}>Hết hạn: {item.expiryDate}</Text>
                </View>

                <View style={styles.voucherActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => handleOpenModal(item)}
                  >
                    <Text style={styles.actionBtnText}>Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => {
                      Alert.alert('Xóa voucher', `Bạn chắc chắn xóa voucher ${item.code}?`, [
                        { text: 'Hủy', style: 'cancel' },
                        {
                          text: 'Xóa',
                          onPress: async () => {
                            const success = await deleteVoucher(item.id);
                            if (success) {
                              showToast('Xóa voucher thành công', 'success');
                            } else {
                              showToast('Lỗi xóa voucher', 'error');
                            }
                          },
                          style: 'destructive',
                        },
                      ]);
                    }}
                  >
                    <Text style={styles.actionBtnText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingVoucher ? 'Chỉnh sửa voucher' : 'Tạo voucher'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Mã voucher *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mã voucher"
                value={formData.code}
                onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
              />

              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập mô tả"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />

              <Text style={styles.label}>Loại giảm giá *</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[styles.typeBtn, formData.type === 'percent' && styles.typeBtnActive]}
                  onPress={() => setFormData({ ...formData, type: 'percent' })}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      formData.type === 'percent' && styles.typeBtnTextActive,
                    ]}
                  >
                    Phần trăm
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, formData.type === 'fixed' && styles.typeBtnActive]}
                  onPress={() => setFormData({ ...formData, type: 'fixed' })}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      formData.type === 'fixed' && styles.typeBtnTextActive,
                    ]}
                  >
                    Cố định
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Giá trị giảm giá *</Text>
              <TextInput
                style={styles.input}
                placeholder={formData.type === 'percent' ? 'VD: 10 (%)' : 'VD: 50000 (₫)'}
                value={formData.discount}
                onChangeText={(text) => setFormData({ ...formData, discount: text })}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Ngày hết hạn *</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 2024-12-31"
                value={formData.expiryDate}
                onChangeText={(text) => setFormData({ ...formData, expiryDate: text })}
              />

              <Text style={styles.label}>Đơn hàng tối thiểu</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 100000"
                value={formData.minOrder}
                onChangeText={(text) => setFormData({ ...formData, minOrder: text })}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Số lần sử dụng tối đa</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: 100"
                value={formData.maxUse}
                onChangeText={(text) => setFormData({ ...formData, maxUse: text })}
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowModal(false)}>
                <Text style={styles.modalBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.submitBtn]} onPress={handleSaveVoucher}>
                <Text style={styles.submitBtnText}>{editingVoucher ? 'Cập nhật' : 'Tạo'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
    )
  );
}

function Sidebar({ menuItems, router }: any) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Admin</Text>
        <Text style={styles.sidebarStatus}> Online</Text>
      </View>
      <Text style={styles.menuLabel}>MENU admin</Text>
      <ScrollView style={styles.sidebarMenu} showsVerticalScrollIndicator={false}>
        {menuItems.map((item: any) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => item.route !== '#' && router.push(item.route)}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={styles.menuText}>{item.title}</Text>
            <Text style={styles.menuArrow}></Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWeb: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#2c3e50',
    paddingVertical: 20,
    borderRightWidth: 1,
    borderRightColor: '#ecf0f1',
  },
  sidebarHeader: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#34495e',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  sidebarStatus: {
    fontSize: 12,
    color: '#27ae60',
    marginLeft: 4,
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#95a5a6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
  },
  sidebarMenu: {
    flex: 1,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
  },
  menuIcon: {
    fontSize: 18,
    color: '#ecf0f1',
    marginRight: 12,
    width: 24,
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    color: '#ecf0f1',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 16,
    color: '#95a5a6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  voucherCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d63031',
  },
  voucherDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  voucherBadge: {
    backgroundColor: '#ffe0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  voucherDiscount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d63031',
  },
  voucherMeta: {
    padding: 12,
    gap: 8,
  },
  metaItem: {
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  expired: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionBtnText: {
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    textAlignVertical: 'top',
    height: 60,
  },
  typePicker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeOption: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  typeOptionSelected: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
  },
  typeOptionText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
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
  submitBtn: {
    backgroundColor: '#10b981',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  voucherDescription: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 12,
    marginVertical: 4,
  },
  voucherDetails: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
  },
  detailText: {
    fontSize: 12,
    color: '#555',
    marginVertical: 3,
  },
  voucherActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
  },
  typeBtnText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  typeBtnTextActive: {
    color: '#fff',
  },
});
