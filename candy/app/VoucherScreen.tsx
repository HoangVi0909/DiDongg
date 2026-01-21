import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useVoucher, Voucher } from '../context/VoucherContext';
import { useToast } from '../context/ToastContext';

export default function VoucherScreen() {
  const { vouchers, appliedVoucher, applyVoucher, removeVoucher, removeAppliedVoucher, getAvailableVouchers } = useVoucher();
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');

  // Mock vouchers từ backend (trong thực tế sẽ từ API)
  const availableVouchers = getAvailableVouchers();

  const handleApplyVoucher = (voucher: Voucher) => {
    if (voucher.minOrder && appliedVoucher) {
      showToast('Bạn đã áp dụng một voucher khác!', 'warning');
      return;
    }
    applyVoucher(voucher);
    showToast(`✅ Đã áp dụng voucher: ${voucher.code}`, 'success');
  };

  const handleRemoveApplied = () => {
    removeAppliedVoucher();
    showToast('❌ Đã hủy voucher', 'info');
  };

  const handleAddVoucherCode = () => {
    if (!voucherCode.trim()) {
      showToast('Vui lòng nhập mã voucher!', 'warning');
      return;
    }

    // Kiểm tra xem voucher đã tồn tại chưa
    if (vouchers.some((v) => v.code === voucherCode)) {
      showToast('Voucher này đã được thêm!', 'warning');
      return;
    }

    // Mock thêm voucher (trong thực tế sẽ gọi API)
    // const newVoucher: Voucher = {
    //   id: Date.now().toString(),
    //   code: voucherCode.toUpperCase(),
    //   discount: 10,
    //   type: 'percent',
    //   description: 'Giảm 10% trên tất cả sản phẩm',
    //   expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    //   isUsed: false,
    // };

    showToast('✅ Thêm voucher thành công!', 'success');
    setVoucherCode('');
    setShowAddModal(false);
  };

  const renderVoucherCard = (voucher: Voucher) => {
    const isApplied = appliedVoucher?.id === voucher.id;
    const isExpired = new Date(voucher.expiryDate) < new Date();

    return (
      <View key={voucher.id} style={[styles.voucherCard, isApplied && styles.voucherCardApplied]}>
        <View style={styles.voucherContent}>
          <View style={styles.voucherHeader}>
            <Text style={styles.voucherCode}>{voucher.code}</Text>
            {isExpired && <Text style={styles.expiredBadge}>Hết hạn</Text>}
            {isApplied && <Text style={styles.appliedBadge}>✓ Đã áp dụng</Text>}
          </View>

          <Text style={styles.voucherDesc}>{voucher.description}</Text>

          <View style={styles.voucherFooter}>
            <Text style={styles.discount}>
              {voucher.type === 'percent' ? `${voucher.discount}%` : `₫${voucher.discount.toLocaleString()}`}
            </Text>
            <Text style={styles.expiry}>
              HSD: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>

          <View style={styles.voucherActions}>
            {isApplied ? (
              <TouchableOpacity style={[styles.actionBtn, styles.removeBtnStyle]} onPress={handleRemoveApplied}>
                <Text style={styles.actionBtnText}>Hủy áp dụng</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, isExpired && styles.actionBtnDisabled]}
                  onPress={() => handleApplyVoucher(voucher)}
                  disabled={isExpired}
                >
                  <Text style={styles.actionBtnText}>{isExpired ? 'Hết hạn' : 'Áp dụng'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => {
                    Alert.alert('Xác nhận', 'Xóa voucher này?', [
                      { text: 'Hủy', onPress: () => {} },
                      { text: 'Xóa', onPress: () => removeVoucher(voucher.id) },
                    ]);
                  }}
                >
                  <Text style={styles.actionBtnText}>✕</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Applied Voucher */}
        {appliedVoucher && (
          <View style={styles.appliedSection}>
            <Text style={styles.sectionTitle}>Voucher đang áp dụng</Text>
            {renderVoucherCard(appliedVoucher)}
          </View>
        )}

        {/* Available Vouchers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Voucher có sẵn ({availableVouchers.length})</Text>
            <TouchableOpacity onPress={() => setShowAddModal(true)}>
              <Text style={styles.addBtn}>+ Thêm</Text>
            </TouchableOpacity>
          </View>

          {availableVouchers.length > 0 ? (
            availableVouchers.map((voucher) => renderVoucherCard(voucher))
          ) : (
            <Text style={styles.emptyText}>Chưa có voucher nào</Text>
          )}
        </View>

        {/* All Vouchers */}
        {vouchers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tất cả voucher ({vouchers.length})</Text>
            {vouchers.map((voucher) => renderVoucherCard(voucher))}
          </View>
        )}
      </ScrollView>

      {/* Add Voucher Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm mã voucher</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nhập mã voucher"
              value={voucherCode}
              onChangeText={setVoucherCode}
              placeholderTextColor="#999"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleAddVoucherCode}>
              <Text style={styles.submitBtnText}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  appliedSection: {
    backgroundColor: '#f0fff4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addBtn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  voucherCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  voucherCardApplied: {
    backgroundColor: '#f0fff4',
    borderColor: '#10b981',
    borderWidth: 2,
  },
  voucherContent: {
    gap: 10,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voucherCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d63031',
  },
  expiredBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#999',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  appliedBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  voucherDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  voucherFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  discount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#d63031',
  },
  expiry: {
    fontSize: 12,
    color: '#999',
  },
  voucherActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnDisabled: {
    backgroundColor: '#ccc',
  },
  removeBtnStyle: {
    backgroundColor: '#f59e0b',
  },
  deleteBtn: {
    flex: 0,
    width: 40,
    backgroundColor: '#ef4444',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
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
    padding: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  submitBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
