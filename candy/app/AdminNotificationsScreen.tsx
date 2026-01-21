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
} from 'react-native';
import { useAdminNotification, AdminNotification } from '../context/AdminNotificationContext';
import { useToast } from '../context/ToastContext';

export default function AdminNotificationsScreen() {
  const { notifications, sendNotification, updateNotification, deleteNotification } = useAdminNotification();
  const { showToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<AdminNotification | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'promotion' as 'promotion' | 'update' | 'alert' | 'news',
    targetUsers: 'all' as 'all' | 'specific',
    targetUserIds: '',
    imageUrl: '',
    actionUrl: '',
  });

  const handleOpenModal = (notification?: AdminNotification) => {
    if (notification) {
      setEditingNotification(notification);
      setFormData({
        title: notification.title,
        message: notification.message,
        type: notification.type,
        targetUsers: notification.targetUsers,
        targetUserIds: notification.targetUserIds?.join(',') || '',
        imageUrl: notification.imageUrl || '',
        actionUrl: notification.actionUrl || '',
      });
    } else {
      setEditingNotification(null);
      setFormData({
        title: '',
        message: '',
        type: 'promotion',
        targetUsers: 'all',
        targetUserIds: '',
        imageUrl: '',
        actionUrl: '',
      });
    }
    setShowModal(true);
  };

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) {
      showToast('Vui lòng điền tiêu đề và nội dung!', 'warning');
      return;
    }

    if (formData.targetUsers === 'specific' && !formData.targetUserIds) {
      showToast('Vui lòng nhập ID người dùng!', 'warning');
      return;
    }

    const notification: AdminNotification = {
      id: editingNotification?.id,
      title: formData.title,
      message: formData.message,
      type: formData.type,
      targetUsers: formData.targetUsers,
      targetUserIds: formData.targetUsers === 'specific' ? formData.targetUserIds.split(',').map((id) => id.trim()) : [],
      imageUrl: formData.imageUrl,
      actionUrl: formData.actionUrl,
      sentAt: new Date().toISOString(),
      isActive: true,
    };

    if (editingNotification) {
      const success = await updateNotification(notification);
      if (success) {
        showToast('✅ Cập nhật thông báo thành công!', 'success');
      } else {
        showToast('❌ Cập nhật thất bại!', 'error');
      }
    } else {
      const success = await sendNotification(notification);
      if (success) {
        showToast('✅ Gửi thông báo thành công!', 'success');
      } else {
        showToast('❌ Gửi thất bại!', 'error');
      }
    }

    setShowModal(false);
  };

  const handleDeleteNotification = (notification: AdminNotification) => {
    Alert.alert('Xác nhận xóa', `Xóa thông báo "${notification.title}"?`, [
      { text: 'Hủy', onPress: () => {} },
      {
        text: 'Xóa',
        onPress: async () => {
          if (notification.id) {
            const success = await deleteNotification(notification.id);
            if (success) {
              showToast('✅ Xóa thông báo thành công!', 'success');
            } else {
              showToast('❌ Xóa thất bại!', 'error');
            }
          }
        },
      },
    ]);
  };

  const getNotificationTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      promotion: '🎉 Khuyến mại',
      update: '📢 Cập nhật',
      alert: '⚠️ Cảnh báo',
      news: '📰 Tin tức',
    };
    return labels[type] || type;
  };

  const getNotificationTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      promotion: '#f97316',
      update: '#3b82f6',
      alert: '#ef4444',
      news: '#8b5cf6',
    };
    return colors[type] || '#999';
  };

  const renderNotificationItem = ({ item }: { item: AdminNotification }) => {
    return (
      <View style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationInfo}>
            <View style={[styles.typeBadge, { backgroundColor: getNotificationTypeColor(item.type) }]}>
              <Text style={styles.typeBadgeText}>{getNotificationTypeLabel(item.type)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.notificationTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {item.message}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.notificationMeta}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Gửi đến:</Text>
            <Text style={styles.metaValue}>
              {item.targetUsers === 'all'
                ? '👥 Tất cả người dùng'
                : `👤 ${item.targetUserIds?.length || 0} người dùng cụ thể`}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Ngày gửi:</Text>
            <Text style={styles.metaValue}>{new Date(item.sentAt || '').toLocaleString('vi-VN')}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Trạng thái:</Text>
            <Text style={[styles.metaValue, item.isActive ? styles.active : styles.inactive]}>
              {item.isActive ? '✅ Hoạt động' : '❌ Vô hiệu hóa'}
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenModal(item)}>
            <Text style={styles.actionBtnText}>✏️ Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteNotification(item)}>
            <Text style={styles.actionBtnText}>🗑️ Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Thông báo</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()}>
          <Text style={styles.addBtnText}>+ Gửi</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {notifications.length > 0 ? (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Send Notification Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingNotification ? 'Chỉnh sửa thông báo' : 'Gửi thông báo'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Loại thông báo *</Text>
              <View style={styles.typePicker}>
                {(['promotion', 'update', 'alert', 'news'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeOption, formData.type === type && styles.typeOptionSelected]}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <Text style={[styles.typeOptionText, formData.type === type && { color: '#fff' }]}>
                      {getNotificationTypeLabel(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Tiêu đề *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tiêu đề thông báo"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              <Text style={styles.label}>Nội dung *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập nội dung thông báo"
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Gửi đến</Text>
              <View style={styles.targetPicker}>
                <TouchableOpacity
                  style={[styles.targetOption, formData.targetUsers === 'all' && styles.targetOptionSelected]}
                  onPress={() => setFormData({ ...formData, targetUsers: 'all', targetUserIds: '' })}
                >
                  <Text style={[styles.targetOptionText, formData.targetUsers === 'all' && { color: '#fff' }]}>
                    👥 Tất cả
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.targetOption, formData.targetUsers === 'specific' && styles.targetOptionSelected]}
                  onPress={() => setFormData({ ...formData, targetUsers: 'specific' })}
                >
                  <Text style={[styles.targetOptionText, formData.targetUsers === 'specific' && { color: '#fff' }]}>
                    👤 Cụ thể
                  </Text>
                </TouchableOpacity>
              </View>

              {formData.targetUsers === 'specific' && (
                <>
                  <Text style={styles.label}>ID người dùng (cách nhau bằng dấu phẩy)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="VD: user1,user2,user3"
                    value={formData.targetUserIds}
                    onChangeText={(text) => setFormData({ ...formData, targetUserIds: text })}
                    multiline
                    numberOfLines={2}
                  />
                </>
              )}

              <Text style={styles.label}>URL hình ảnh (tùy chọn)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
              />

              <Text style={styles.label}>URL hành động (tùy chọn)</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: /promotions/summer-sale"
                value={formData.actionUrl}
                onChangeText={(text) => setFormData({ ...formData, actionUrl: text })}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowModal(false)}>
                <Text style={styles.modalBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.submitBtn]} onPress={handleSendNotification}>
                <Text style={styles.submitBtnText}>{editingNotification ? 'Cập nhật' : 'Gửi'}</Text>
              </TouchableOpacity>
            </View>
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
  header: {
    backgroundColor: '#3b82f6',
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
  notificationCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  notificationHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationInfo: {
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  notificationMeta: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  active: {
    color: '#10b981',
  },
  inactive: {
    color: '#ef4444',
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
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  typeOption: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeOptionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  targetPicker: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  targetOption: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  targetOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  targetOptionText: {
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
});
