import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, FlatList, Dimensions, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../config/network';
import { useCart, Product } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 24) / 2;

interface Category {
  id: number;
  name: string;
  emoji: string;
}

export default function CustomerScreen() {
  const router = useRouter();
  const { addToCart, getCartCount, addToFavorites, removeFromFavorites, isFavorite } = useCart();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const categories: Category[] = [
    { id: 1, name: 'Kẹo', emoji: '🍬' },
    { id: 2, name: 'Nước Ngọt', emoji: '🥤' },
    { id: 3, name: 'Snack', emoji: '🍿' },
    { id: 4, name: 'Bánh', emoji: '🍪' },
    { id: 5, name: 'Kem', emoji: '🍦' },
    { id: 6, name: 'Cà Phê', emoji: '☕' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/products`);
      if (res.ok) {
        const data = await res.json();
        const validProducts = data.filter((p: Product) => p.name && p.price !== null && p.price !== undefined);
        setProducts(validProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(p => {
      // Filter by category if selected
      if (selectedCategory !== null) {
        const categoryId = (p as any).category_id || p.categoryId;
        if (categoryId !== selectedCategory) return false;
      }
      // Filter by price range
      const min = minPrice ? parseInt(minPrice) : 0;
      const max = maxPrice ? parseInt(maxPrice) : Infinity;
      if (p.price < min || p.price > max) return false;
      // Filter by search text
      if (searchText.trim() !== '') {
        return p.name.toLowerCase().includes(searchText.toLowerCase());
      }
      return true;
    });

  const cartCount = getCartCount();

  const toggleFavorite = (product: Product) => {
    const productName = product.name;
    
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
      showToast(`❌ Đã xóa "${productName}" khỏi yêu thích`, 'info');
    } else {
      addToFavorites(product);
      showToast(`❤️ Đã thêm "${productName}" vào yêu thích!`, 'success');
    }
  };

  const getCategoryName = () => {
    if (selectedCategory === null) return 'Tất cả danh mục';
    const cat = categories.find(c => c.id === selectedCategory);
    return cat ? `${cat.emoji} ${cat.name}` : 'Tất cả danh mục';
  };

  const getPriceRangeText = () => {
    if (!minPrice && !maxPrice) return 'Tất cả giá';
    if (minPrice && !maxPrice) return `₫${parseInt(minPrice).toLocaleString()}+`;
    if (!minPrice && maxPrice) return `Dưới ₫${parseInt(maxPrice).toLocaleString()}`;
    return `₫${parseInt(minPrice).toLocaleString()} - ₫${parseInt(maxPrice).toLocaleString()}`;
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/ProductDetail?id=${item.id}` as any)}
      activeOpacity={0.8}
    >
      <View style={styles.productImageWrapper}>
        <Image
          source={{ uri: (item as any).image || item.imageUrl || 'https://via.placeholder.com/200' }}
          style={styles.productImage}
        />
        <TouchableOpacity 
          style={styles.favoriteBadge}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item);
          }}
        >
          <Text style={styles.favoriteBadgeText}>{isFavorite(item.id) ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>₫{(item.price || 0).toLocaleString()}</Text>
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={(e) => {
            e.stopPropagation();
            addToCart(item, 1);
            showToast(`✨ Đã thêm "${item.name}" vào giỏ hàng!`, 'success');
          }}
        >
          <Text style={styles.addToCartText}>+ Giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Chào bạn! 👋</Text>
          <Text style={styles.headerSubtitle}>Khám phá sản phẩm ngon</Text>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/Cart' as any)}>
          <Text style={styles.cartIcon}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText !== '' && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Section - Dropdowns */}
      <View style={styles.filterContainer}>
        {/* Category Dropdown */}
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.filterButtonText}>📂 {getCategoryName()}</Text>
          <Text style={styles.filterDropdownIcon}>▼</Text>
        </TouchableOpacity>

        {/* Price Dropdown */}
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowPriceModal(true)}
        >
          <Text style={styles.filterButtonText}>💰 {getPriceRangeText()}</Text>
          <Text style={styles.filterDropdownIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn danh mục</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.categoryOption, selectedCategory === null && styles.categoryOptionActive]}
              onPress={() => {
                setSelectedCategory(null);
                setShowCategoryModal(false);
              }}
            >
              <Text style={[styles.categoryOptionText, selectedCategory === null && styles.categoryOptionTextActive]}>
                ✓ Tất cả danh mục
              </Text>
            </TouchableOpacity>

            {categories.map(cat => (
              <TouchableOpacity 
                key={cat.id}
                style={[styles.categoryOption, selectedCategory === cat.id && styles.categoryOptionActive]}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[styles.categoryOptionText, selectedCategory === cat.id && styles.categoryOptionTextActive]}>
                  {selectedCategory === cat.id ? '✓ ' : '  '}{cat.emoji} {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Price Modal */}
      <Modal
        visible={showPriceModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPriceModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPriceModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lọc theo giá</Text>
              <TouchableOpacity onPress={() => setShowPriceModal(false)}>
                <Text style={styles.modalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.priceInputGroup}>
              <Text style={styles.priceLabel}>Giá tối thiểu (₫)</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0"
                placeholderTextColor="#ccc"
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
              />
            </View>

            <View style={styles.priceInputGroup}>
              <Text style={styles.priceLabel}>Giá tối đa (₫)</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="999999999"
                placeholderTextColor="#ccc"
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>

            <View style={styles.modalButtonGroup}>
              <TouchableOpacity 
                style={styles.modalButtonClear}
                onPress={() => {
                  setMinPrice('');
                  setMaxPrice('');
                }}
              >
                <Text style={styles.modalButtonClearText}>Xóa lọc</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonApply}
                onPress={() => setShowPriceModal(false)}
              >
                <Text style={styles.modalButtonApplyText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b35" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productGrid}
          contentContainerStyle={styles.productListContent}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Customer' as any)}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Orders' as any)}>
          <Text style={styles.navIcon}>📦</Text>
          <Text style={styles.navLabel}>Đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Favorites' as any)}>
          <Text style={styles.navIcon}>❤️</Text>
          <Text style={styles.navLabel}>Yêu thích</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/Account' as any)}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Tài khoản</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  cartButton: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff6b35',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#222',
    paddingVertical: 6,
  },
  clearIcon: {
    fontSize: 16,
    color: '#ccc',
    paddingHorizontal: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  filterDropdownIcon: {
    fontSize: 10,
    color: '#666',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseBtn: {
    fontSize: 20,
    color: '#999',
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  categoryOptionActive: {
    backgroundColor: '#fff3e0',
  },
  categoryOptionText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: '#ff6b35',
    fontWeight: '700',
  },
  priceInputGroup: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  modalButtonGroup: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  modalButtonClear: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b35',
    alignItems: 'center',
  },
  modalButtonClearText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff6b35',
  },
  modalButtonApply: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#ff6b35',
    alignItems: 'center',
  },
  modalButtonApplyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productGrid: {
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    marginBottom: 4,
    gap: 10,
  },
  productListContent: {
    paddingVertical: 4,
    paddingBottom: 190,
  },
  productCard: {
    width: ITEM_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 110,
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  favoriteBadgeText: {
    fontSize: 16,
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
    height: 28,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 6,
  },
  addToCartBtn: {
    backgroundColor: '#ff6b35',
    borderRadius: 6,
    paddingVertical: 7,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    paddingBottom: 40,
    paddingTop: 8,
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 6,
    flex: 1,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
});
