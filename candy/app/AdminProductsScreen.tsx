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
  ActivityIndicator,
  Platform,
} from 'react-native';
import AdminSidebar from '../components/AdminSidebar';
import { useAdminProduct, AdminProduct } from '../context/AdminProductContext';
import { useToast } from '../context/ToastContext';

const isWeb = Platform.OS === 'web';

export default function AdminProductsScreen() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useAdminProduct();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '1',
    stock: '',
  });

  const categories = [
    { id: '1', name: 'Kẹo' },
    { id: '2', name: 'Nước Ngọt' },
    { id: '3', name: 'Snack' },
    { id: '4', name: 'Bánh' },
    { id: '5', name: 'Kem' },
    { id: '6', name: 'Cà Phê' },
  ];

  const handleOpenModal = (product?: AdminProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        categoryId: product.categoryId.toString(),
        stock: product.stock.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', categoryId: '1', stock: '' });
    }
    setShowModal(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      showToast('Vui lòng điền đủ thông tin!', 'warning');
      return;
    }

    const product: AdminProduct = {
      id: editingProduct?.id,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      categoryId: parseInt(formData.categoryId),
      stock: parseInt(formData.stock),
    };

    if (editingProduct) {
      const success = await updateProduct(product);
      if (success) {
        showToast('✅ Cập nhật sản phẩm thành công!', 'success');
      } else {
        showToast('❌ Cập nhật thất bại!', 'error');
      }
    } else {
      const success = await addProduct(product);
      if (success) {
        showToast('✅ Thêm sản phẩm thành công!', 'success');
      } else {
        showToast('❌ Thêm sản phẩm thất bại!', 'error');
      }
    }

    setShowModal(false);
  };

  const handleDeleteProduct = (product: AdminProduct) => {
    Alert.alert('Xác nhận xóa', `Xóa sản phẩm "${product.name}"?`, [
      { text: 'Hủy', onPress: () => {} },
      {
        text: 'Xóa',
        onPress: async () => {
          if (product.id) {
            const success = await deleteProduct(product.id);
            if (success) {
              showToast('✅ Xóa sản phẩm thành công!', 'success');
            } else {
              showToast('❌ Xóa thất bại!', 'error');
            }
          }
        },
      },
    ]);
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => parseInt(c.id) === categoryId)?.name || 'N/A';
  };

  const renderProductItem = ({ item }: { item: AdminProduct }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productCategory}>{getCategoryName(item.categoryId)}</Text>
        <Text style={styles.productDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>₫{item.price.toLocaleString()}</Text>
          <View
            style={[
              styles.stockBadge,
              item.stock > 50 ? styles.stockHigh : item.stock > 10 ? styles.stockMedium : styles.stockLow,
            ]}
          >
            <Text style={styles.stockText}>Kho: {item.stock}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenModal(item)}>
          <Text style={styles.actionBtnText}>✏️ Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteProduct(item)}>
          <Text style={styles.actionBtnText}>🗑️ Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#ff6b35" />
      </View>
    );
  }

  // Filter logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    isWeb ? (
      <View style={styles.containerWeb}>
        <AdminSidebar />
        <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Sản phẩm</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()}>
          <Text style={styles.addBtnText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setCurrentPage(1);
          }}
        />
      </View>

      {/* Results Info */}
      <View style={styles.resultInfo}>
        <Text style={styles.resultText}>
          Tìm thấy {filteredProducts.length} sản phẩm | Trang {currentPage}/{totalPages || 1}
        </Text>
      </View>

      <ScrollView>
        {paginatedProducts.length > 0 ? (
          <>
            <FlatList
              data={paginatedProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.paginationBtn, currentPage === 1 && styles.paginationBtnDisabled]}
                  onPress={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Text style={styles.paginationBtnText}>← Trước</Text>
                </TouchableOpacity>

                <Text style={styles.pageIndicator}>
                  {currentPage} / {totalPages}
                </Text>

                <TouchableOpacity
                  style={[styles.paginationBtn, currentPage === totalPages && styles.paginationBtnDisabled]}
                  onPress={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <Text style={styles.paginationBtnText}>Sau →</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : filteredProducts.length > 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Không có sản phẩm nào trên trang này</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Product Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Tên sản phẩm *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên sản phẩm"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập mô tả sản phẩm"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Danh mục *</Text>
              <View style={styles.categoryPicker}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      formData.categoryId === cat.id && styles.categoryOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, categoryId: cat.id })}
                  >
                    <Text style={styles.categoryOptionText}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Giá (₫) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập giá"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Số lượng kho *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số lượng"
                value={formData.stock}
                onChangeText={(text) => setFormData({ ...formData, stock: text })}
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowModal(false)}>
                <Text style={styles.modalBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.submitBtn]} onPress={handleSaveProduct}>
                <Text style={styles.submitBtnText}>{editingProduct ? 'Cập nhật' : 'Thêm'}</Text>
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
        <Text style={styles.headerTitle}>Quản lý Sản phẩm</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()}>
          <Text style={styles.addBtnText}>+ Thêm</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setCurrentPage(1);
          }}
        />
      </View>

      {/* Results Info */}
      <View style={styles.resultInfo}>
        <Text style={styles.resultText}>
          Tìm thấy {filteredProducts.length} sản phẩm | Trang {currentPage}/{totalPages || 1}
        </Text>
      </View>

      <ScrollView>
        {paginatedProducts.length > 0 ? (
          <>
            <FlatList
              data={paginatedProducts}
              renderItem={renderProductItem}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[styles.paginationBtn, currentPage === 1 && styles.paginationBtnDisabled]}
                  onPress={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Text style={styles.paginationBtnText}>← Trước</Text>
                </TouchableOpacity>

                <Text style={styles.pageIndicator}>
                  {currentPage} / {totalPages}
                </Text>

                <TouchableOpacity
                  style={[styles.paginationBtn, currentPage === totalPages && styles.paginationBtnDisabled]}
                  onPress={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <Text style={styles.paginationBtnText}>Sau →</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : filteredProducts.length > 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Không có sản phẩm nào trên trang này</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Chưa có sản phẩm nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Product Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Tên sản phẩm *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập tên sản phẩm"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Nhập mô tả sản phẩm"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Danh mục *</Text>
              <View style={styles.categoryPicker}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      formData.categoryId === cat.id && styles.categoryOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, categoryId: cat.id })}
                  >
                    <Text style={styles.categoryOptionText}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Giá (₫) *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập giá"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Số lượng kho *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số lượng"
                value={formData.stock}
                onChangeText={(text) => setFormData({ ...formData, stock: text })}
                keyboardType="numeric"
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowModal(false)}>
                <Text style={styles.modalBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.submitBtn]} onPress={handleSaveProduct}>
                <Text style={styles.submitBtnText}>{editingProduct ? 'Cập nhật' : 'Thêm'}</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  searchBar: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  productCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: '600',
    marginBottom: 4,
  },
  productDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#d63031',
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockHigh: {
    backgroundColor: '#d4edda',
  },
  stockMedium: {
    backgroundColor: '#fff3cd',
  },
  stockLow: {
    backgroundColor: '#f8d7da',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
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
    height: 80,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryOption: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryOptionSelected: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
  },
  categoryOptionText: {
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
  // Filter styles (removed - replaced with new dropdown styles above)
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paginationBtn: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  paginationBtnDisabled: {
    backgroundColor: '#e0e0e0',
    opacity: 0.5,
  },
  paginationBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    minWidth: 50,
    textAlign: 'center',
  },
  // New Filter Row Styles
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    alignItems: 'flex-end',
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputCompact: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#333',
    height: 40,
  },
  dropdownWrapper: {
    flex: 1,
    minWidth: 120,
    position: 'relative',
  },
  dropdownLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  dropdownHeader: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    height: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  dropdownHeaderText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#ff6b35',
    fontWeight: '700',
    marginLeft: 4,
  },
  dropdownContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    marginTop: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 180,
    maxWidth: 220,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  dropdownMenuBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  dropdownMenuBtnActive: {
    backgroundColor: '#fff3e0',
  },
  dropdownMenuText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dropdownMenuTextActive: {
    color: '#ff6b35',
    fontWeight: '600',
  },
  dropdownBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  dropdownBtnActive: {
    backgroundColor: '#fff3e0',
    borderBottomColor: '#ff6b35',
  },
  dropdownBtnText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  dropdownBtnTextActive: {
    color: '#ff6b35',
    fontWeight: '600',
  },
  resultInfo: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
