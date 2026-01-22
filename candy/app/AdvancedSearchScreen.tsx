import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';

const isWeb = Platform.OS === 'web';

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image?: string;
  category: string;
  inStock: boolean;
  description: string;
}

interface Filters {
  searchQuery: string;
  categoryId: number | null;
  priceMin: number;
  priceMax: number;
  ratingMin: number;
  inStockOnly: boolean;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
}

export default function AdvancedSearchScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    searchQuery: '',
    categoryId: null,
    priceMin: 0,
    priceMax: 500000,
    ratingMin: 0,
    inStockOnly: false,
    sortBy: 'newest',
  });

  useEffect(() => {
    const loadInitialData = async () => {
      await fetchProducts();
      await fetchCategories();
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const performFiltering = () => {
      let result = [...products];

      // Search by query
      if (filters.searchQuery) {
        result = result.filter(p =>
          p.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
        );
      }

      // Filter by category
      if (filters.categoryId) {
        result = result.filter(p => p.category === categories.find(c => c.id === filters.categoryId)?.name);
      }

      // Filter by price range
      result = result.filter(p => p.price >= filters.priceMin && p.price <= filters.priceMax);

      // Filter by rating
      result = result.filter(p => p.rating >= filters.ratingMin);

      // Filter by stock
      if (filters.inStockOnly) {
        result = result.filter(p => p.inStock);
      }

      // Sort
      switch (filters.sortBy) {
        case 'price_asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        case 'popular':
          result.sort((a, b) => b.reviews - a.reviews);
          break;
        case 'newest':
        default:
          result.sort((a, b) => b.id - a.id);
      }

      setFilteredProducts(result);
    };
    performFiltering();
  }, [filters, products, categories]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'Kẹo Xoàn Vàng',
          price: 25000,
          originalPrice: 30000,
          rating: 4.8,
          reviews: 156,
          category: 'Kẹo',
          inStock: true,
          description: 'Kẹo xoàn vàng ngon lành',
        },
        {
          id: 2,
          name: 'Nước Cam Squeeze',
          price: 35000,
          originalPrice: 40000,
          rating: 4.2,
          reviews: 89,
          category: 'Nước ép',
          inStock: true,
          description: 'Nước cam tươi 100%',
        },
        {
          id: 3,
          name: 'Bánh Quy Hương Vani',
          price: 45000,
          rating: 4.5,
          reviews: 203,
          category: 'Bánh',
          inStock: false,
          description: 'Bánh quy giòn hương vani',
        },
        {
          id: 4,
          name: 'Socola Đen Nguyên Chất',
          price: 55000,
          originalPrice: 65000,
          rating: 4.9,
          reviews: 312,
          category: 'Socola',
          inStock: true,
          description: 'Socola đen 70% cacao',
        },
        {
          id: 5,
          name: 'Mứt Dâu Tây',
          price: 28000,
          rating: 3.8,
          reviews: 45,
          category: 'Mứt',
          inStock: true,
          description: 'Mứt dâu tây tự nhiên',
        },
        {
          id: 6,
          name: 'Kẹo Bạc Hà',
          price: 15000,
          rating: 4.3,
          reviews: 92,
          category: 'Kẹo',
          inStock: true,
          description: 'Kẹo bạc hà mát lạnh',
        },
        {
          id: 7,
          name: 'Bánh Gato Chocolate',
          price: 120000,
          originalPrice: 150000,
          rating: 4.7,
          reviews: 267,
          category: 'Bánh',
          inStock: true,
          description: 'Bánh gato socola cao cấp',
        },
        {
          id: 8,
          name: 'Đường Phèn',
          price: 8000,
          rating: 4.0,
          reviews: 28,
          category: 'Kẹo',
          inStock: true,
          description: 'Đường phèn truyền thống',
        },
      ];
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } catch {
      console.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const mockCategories = [
        { id: 1, name: 'Kẹo' },
        { id: 2, name: 'Bánh' },
        { id: 3, name: 'Socola' },
        { id: 4, name: 'Nước ép' },
        { id: 5, name: 'Mứt' },
      ];
      setCategories(mockCategories);
    } catch {
      console.error('Error fetching categories');
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '⭐'.repeat(fullStars);
    if (hasHalfStar) stars += '✨';
    return stars;
  };

  const renderProductCard = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={styles.productCard}
      onPress={() => router.push(`/ProductDetailScreen?id=${product.id}`)}
    >
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.emoji}>🛍️</Text>
        </View>
        {product.originalPrice && product.originalPrice > product.price && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </Text>
          </View>
        )}
        {!product.inStock && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>Hết hàng</Text>
          </View>
        )}
      </View>

      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>

      <View style={styles.ratingContainer}>
        <Text style={styles.ratingStars}>{renderStars(product.rating)}</Text>
        <Text style={styles.ratingValue}>{product.rating}</Text>
        <Text style={styles.reviewCount}>({product.reviews})</Text>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>₫{product.price.toLocaleString('vi-VN')}</Text>
        {product.originalPrice && (
          <Text style={styles.originalPrice}>₫{product.originalPrice.toLocaleString('vi-VN')}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isWeb) {
    return (
      <View style={styles.containerWeb}>
        {/* Sidebar Filters */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>🔍 Tìm Kiếm</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Tên sản phẩm..."
            value={filters.searchQuery}
            onChangeText={(text) => setFilters({ ...filters, searchQuery: text })}
          />

          {/* Category */}
          <Text style={styles.filterLabel}>📂 Danh Mục:</Text>
          <TouchableOpacity
            style={[
              styles.categoryBtn,
              filters.categoryId === null && styles.categoryBtnActive,
            ]}
            onPress={() => setFilters({ ...filters, categoryId: null })}
          >
            <Text style={styles.categoryBtnText}>Tất Cả</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryBtn,
                filters.categoryId === cat.id && styles.categoryBtnActive,
              ]}
              onPress={() => setFilters({ ...filters, categoryId: cat.id })}
            >
              <Text style={styles.categoryBtnText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}

          {/* Price Range */}
          <Text style={styles.filterLabel}>💰 Giá:</Text>
          <Text style={styles.priceRangeText}>
            ₫{filters.priceMin.toLocaleString('vi-VN')} - ₫{filters.priceMax.toLocaleString('vi-VN')}
          </Text>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="Min"
              keyboardType="numeric"
              value={filters.priceMin.toString()}
              onChangeText={(text) =>
                setFilters({ ...filters, priceMin: parseInt(text) || 0 })
              }
            />
            <Text style={styles.priceSeparator}>-</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max"
              keyboardType="numeric"
              value={filters.priceMax.toString()}
              onChangeText={(text) =>
                setFilters({ ...filters, priceMax: parseInt(text) || 500000 })
              }
            />
          </View>

          {/* Rating */}
          <Text style={styles.filterLabel}>⭐ Đánh Giá:</Text>
          {[0, 3, 4, 4.5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingBtn,
                filters.ratingMin === rating && styles.ratingBtnActive,
              ]}
              onPress={() => setFilters({ ...filters, ratingMin: rating })}
            >
              <Text style={styles.ratingBtnText}>
                {rating === 0 ? 'Tất Cả' : `${renderStars(rating)} ${rating}+ Sao`}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Stock */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setFilters({ ...filters, inStockOnly: !filters.inStockOnly })}
          >
            <Text style={styles.checkbox}>{filters.inStockOnly ? '☑️' : '☐'}</Text>
            <Text style={styles.checkboxLabel}>Chỉ hàng có sẵn</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <Text style={styles.resultCount}>Tìm được {filteredProducts.length} sản phẩm</Text>

            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Sắp xếp:</Text>
              <View style={styles.sortButtons}>
                {['newest', 'price_asc', 'price_desc', 'rating', 'popular'].map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    style={[
                      styles.sortBtn,
                      filters.sortBy === sort && styles.sortBtnActive,
                    ]}
                    onPress={() => setFilters({ ...filters, sortBy: sort as any })}
                  >
                    <Text style={styles.sortBtnText}>
                      {sort === 'newest' && 'Mới'}
                      {sort === 'price_asc' && 'Giá ↑'}
                      {sort === 'price_desc' && 'Giá ↓'}
                      {sort === 'rating' && '⭐ Cao'}
                      {sort === 'popular' && '❤️ Phổ Biến'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {filteredProducts.map(renderProductCard)}
            </View>
          )}
        </View>
      </View>
    );
  }

  // Mobile view
  return (
    <View style={styles.container}>
      <View style={styles.mobileHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.mobileTitle}>🔍 Tìm Kiếm</Text>
        <TouchableOpacity onPress={() => setShowFilterModal(true)}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.mobileSearchInput}
        placeholder="Tìm sản phẩm..."
        value={filters.searchQuery}
        onChangeText={(text) => setFilters({ ...filters, searchQuery: text })}
      />

      <ScrollView horizontal style={styles.sortScroll}>
        {['newest', 'price_asc', 'price_desc', 'rating', 'popular'].map((sort) => (
          <TouchableOpacity
            key={sort}
            style={[
              styles.sortBtn,
              filters.sortBy === sort && styles.sortBtnActive,
            ]}
            onPress={() => setFilters({ ...filters, sortBy: sort as any })}
          >
            <Text style={styles.sortBtnText}>
              {sort === 'newest' && 'Mới'}
              {sort === 'price_asc' && 'Giá ↑'}
              {sort === 'price_desc' && 'Giá ↓'}
              {sort === 'rating' && '⭐'}
              {sort === 'popular' && '❤️'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredProducts}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => renderProductCard(item)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ Lọc</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={styles.closeBtn}>✖️</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Category */}
              <Text style={styles.modalSectionTitle}>Danh Mục</Text>
              <TouchableOpacity
                style={[
                  styles.categoryBtn,
                  filters.categoryId === null && styles.categoryBtnActive,
                ]}
                onPress={() => setFilters({ ...filters, categoryId: null })}
              >
                <Text style={styles.categoryBtnText}>Tất Cả</Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryBtn,
                    filters.categoryId === cat.id && styles.categoryBtnActive,
                  ]}
                  onPress={() => setFilters({ ...filters, categoryId: cat.id })}
                >
                  <Text style={styles.categoryBtnText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}

              {/* Price */}
              <Text style={styles.modalSectionTitle}>Giá Tiền</Text>
              <Text style={styles.priceRangeText}>
                ₫{filters.priceMin.toLocaleString('vi-VN')} - ₫{filters.priceMax.toLocaleString('vi-VN')}
              </Text>
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  keyboardType="numeric"
                  value={filters.priceMin.toString()}
                  onChangeText={(text) =>
                    setFilters({ ...filters, priceMin: parseInt(text) || 0 })
                  }
                />
                <Text style={styles.priceSeparator}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  keyboardType="numeric"
                  value={filters.priceMax.toString()}
                  onChangeText={(text) =>
                    setFilters({ ...filters, priceMax: parseInt(text) || 500000 })
                  }
                />
              </View>

              {/* Rating */}
              <Text style={styles.modalSectionTitle}>Đánh Giá</Text>
              {[0, 3, 4, 4.5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingBtn,
                    filters.ratingMin === rating && styles.ratingBtnActive,
                  ]}
                  onPress={() => setFilters({ ...filters, ratingMin: rating })}
                >
                  <Text style={styles.ratingBtnText}>
                    {rating === 0 ? 'Tất Cả' : `${renderStars(rating)} ${rating}+ Sao`}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Stock */}
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setFilters({ ...filters, inStockOnly: !filters.inStockOnly })}
              >
                <Text style={styles.checkbox}>{filters.inStockOnly ? '☑️' : '☐'}</Text>
                <Text style={styles.checkboxLabel}>Chỉ hàng có sẵn</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyBtnText}>✅ Áp Dụng</Text>
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
  containerWeb: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  sidebar: {
    width: 280,
    backgroundColor: 'white',
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    maxHeight: '100%',
    overflow: 'hidden',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2c3e50',
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  resultCount: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  sortContainer: {
    marginBottom: 12,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortBtnActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#2c3e50',
  },
  categoryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryBtnActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2c3e50',
  },
  priceRangeText: {
    fontSize: 12,
    color: '#2c3e50',
    marginBottom: 8,
    fontWeight: '600',
  },
  priceInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 12,
  },
  priceSeparator: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 12,
  },
  ratingBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ratingBtnActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFC700',
  },
  ratingBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2c3e50',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  checkbox: {
    fontSize: 20,
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '500',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  productCard: {
    flex: 1,
    minWidth: isWeb ? 200 : '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: isWeb ? 150 : 120,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: isWeb ? 48 : 40,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#95a5a6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  stockText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
  },
  productName: {
    padding: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
    minHeight: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 4,
  },
  ratingStars: {
    fontSize: 12,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  reviewCount: {
    fontSize: 11,
    color: '#95a5a6',
  },
  priceContainer: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  originalPrice: {
    fontSize: 11,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
  },
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  mobileTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  filterIcon: {
    fontSize: 20,
  },
  mobileSearchInput: {
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortScroll: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  columnWrapper: {
    gap: 8,
    paddingHorizontal: 8,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeBtn: {
    fontSize: 20,
  },
  modalScroll: {
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#2c3e50',
  },
  applyBtn: {
    margin: 16,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
