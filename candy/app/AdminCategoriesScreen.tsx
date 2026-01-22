import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useToast } from '../context/ToastContext';
import { getApiUrl } from '../config/network';

const isWeb = Platform.OS === 'web';

interface Category {
  id: number;
  name: string;
  description?: string;
  emoji?: string;
  productCount?: number;
}

export default function AdminCategoriesScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const menuItems = [
    { id: 1, title: 'Trang chu', icon: '', route: '/AdminScreen' },
    { id: 2, title: 'Menu', icon: '', route: '#' },
    { id: 3, title: 'San pham', icon: '', route: '/AdminProductsScreen' },
    { id: 9, title: 'Don hang', icon: '', route: '/AdminOrders' },
    { id: 4, title: 'Voucher', icon: '', route: '/AdminVouchersScreen' },
    { id: 5, title: 'Nguoi dung', icon: '', route: '/AdminUsersScreen' },
    { id: 6, title: 'Danh muc', icon: '', route: '/AdminCategoriesScreen' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emoji: '📁',
  });

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, [showToast]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/categories`);
      if (response.ok) {
        const data = await response.json();
        console.log('📁 Categories:', data);
        setCategories(data || []);
      } else {
        showToast('Lỗi tải danh mục', 'error');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Lỗi kết nối API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        emoji: category.emoji || '📁',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        emoji: '📁',
      });
    }
    setShowModal(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      showToast('Vui lòng nhập tên danh mục!', 'warning');
      return;
    }

    try {
      let response;
      if (editingCategory) {
        // Update
        response = await fetch(`${getApiUrl()}/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // Create
        response = await fetch(`${getApiUrl()}/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        showToast(`✅ ${editingCategory ? 'Cập nhật' : 'Thêm'} danh mục thành công!`, 'success');
        setShowModal(false);
        fetchCategories();
      } else {
        showToast('❌ Lỗi!', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Lỗi kết nối', 'error');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    Alert.alert('Xóa danh mục', `Bạn chắc chắn xóa "${category.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        onPress: async () => {
          try {
            const response = await fetch(`${getApiUrl()}/categories/${category.id}`, {
              method: 'DELETE',
            });

            if (response.ok) {
              showToast('✅ Xóa thành công!', 'success');
              fetchCategories();
            } else {
              showToast('❌ Xóa thất bại!', 'error');
            }
          } catch (error) {
            console.error('Error deleting:', error);
            showToast('Lỗi kết nối', 'error');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  // Filter
  const filteredCategories = categories.filter(cat =>
    (cat.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  // Web View
  if (isWeb) {
    return (
      <View style={styles.containerWeb}>
        <Sidebar menuItems={menuItems} router={router} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Quản lý Danh Mục</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleOpenModal()}
            >
              <Text style={styles.addButtonText}>+ Thêm</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Tìm kiếm theo tên..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
          ) : paginatedCategories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📁</Text>
              <Text style={styles.emptyText}>Không tìm thấy danh mục</Text>
            </View>
          ) : (
            <>
              {paginatedCategories.map((category) => (
                <View key={category.id} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.emojiIcon}>{category.emoji}</Text>
                      <View>
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryDesc}>
                          {category.description || 'Không có mô tả'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.productCount}>{category.productCount || 0} sản phẩm</Text>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.editBtn]}
                      onPress={() => handleOpenModal(category)}
                    >
                      <Text style={styles.actionBtnText}>✏️ Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => handleDeleteCategory(category)}
                    >
                      <Text style={styles.actionBtnText}>🗑️ Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    disabled={currentPage === 1}
                    onPress={() => setCurrentPage(currentPage - 1)}
                    style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                  >
                    <Text style={styles.pageBtnText}>← Trước</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageInfo}>
                    {currentPage}/{totalPages}
                  </Text>
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

          {/* Modal */}
          <Modal
            visible={showModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
                </Text>

                <Text style={styles.label}>Emoji</Text>
                <TextInput
                  style={styles.emojiInput}
                  value={formData.emoji}
                  onChangeText={(text) => setFormData({ ...formData, emoji: text })}
                  maxLength={2}
                />

                <Text style={styles.label}>Tên Danh Mục</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên..."
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />

                <Text style={styles.label}>Mô Tả</Text>
                <TextInput
                  style={[styles.input, styles.textAreaInput]}
                  placeholder="Nhập mô tả..."
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.cancelBtn]}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.modalBtnText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.saveBtn]}
                    onPress={handleSaveCategory}
                  >
                    <Text style={styles.modalBtnText}>Lưu</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    );
  }

  // Mobile View
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Danh Mục</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleOpenModal()}
        >
          <Text style={styles.addButtonText}>+ Thêm</Text>
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
          data={paginatedCategories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: category }) => (
            <View style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.emojiIcon}>{category.emoji}</Text>
                  <View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryDesc}>
                      {category.description || 'Không có mô tả'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.productCount}>{category.productCount || 0}</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.editBtn]}
                  onPress={() => handleOpenModal(category)}
                >
                  <Text style={styles.actionBtnText}>✏️ Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteCategory(category)}
                >
                  <Text style={styles.actionBtnText}>🗑️ Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📁</Text>
              <Text style={styles.emptyText}>Không tìm thấy danh mục</Text>
            </View>
          }
        />
      )}

      {/* Modal for mobile */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}
            </Text>

            <Text style={styles.label}>Emoji</Text>
            <TextInput
              style={styles.emojiInput}
              value={formData.emoji}
              onChangeText={(text) => setFormData({ ...formData, emoji: text })}
              maxLength={2}
            />

            <Text style={styles.label}>Tên Danh Mục</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên..."
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <Text style={styles.label}>Mô Tả</Text>
            <TextInput
              style={[styles.input, styles.textAreaInput]}
              placeholder="Nhập mô tả..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSaveCategory}
              >
                <Text style={styles.modalBtnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  loader: {
    marginTop: 20,
  },
  categoryCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  categoryDesc: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  productCount: {
    fontSize: 12,
    color: '#95a5a6',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#3498db',
  },
  deleteBtn: {
    backgroundColor: '#e74c3c',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '500',
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
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: isWeb ? '50%' : '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  emojiInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 10,
    fontSize: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  textAreaInput: {
    minHeight: 80,
    paddingVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#e0e0e0',
  },
  saveBtn: {
    backgroundColor: '#FF6B6B',
  },
  modalBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2c3e50',
  },
});
