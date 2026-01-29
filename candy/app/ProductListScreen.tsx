import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../config/network';
import { useCart, Product } from '../context/CartContext';

interface Category {
  id: number;
  name: string;
}

export default function ProductListScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/products`);
      if (res.ok) {
        const data = await res.json();
        // Lọc bỏ sản phẩm không hợp lệ
        const validProducts = data.filter((p: Product) => p.name && p.price !== null && p.price !== undefined);
        setProducts(validProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    // Lọc theo tìm kiếm
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Lọc theo danh mục - sử dụng category_id từ backend
    const productCategoryId = (product as any).category_id || product.categoryId;
    const matchesCategory = selectedCategory === null || productCategoryId === selectedCategory;
    
    // Lọc theo giá
    let matchesPrice = true;
    if (priceRange === 'under50') {
      matchesPrice = (product.price || 0) < 50000;
    } else if (priceRange === '50to100') {
      matchesPrice = (product.price || 0) >= 50000 && (product.price || 0) <= 100000;
    } else if (priceRange === 'over100') {
      matchesPrice = (product.price || 0) > 100000;
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/ProductDetail?id=${item.id}` as any)}
    >
      <Image
        source={{ uri: (item as any).image || item.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
      />
      <Text style={styles.productName} numberOfLines={2}>
        {item.name || 'Sản phẩm'}
      </Text>
      <Text style={styles.productPrice}>₫{(item.price || 0).toLocaleString()}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={(e) => {
          e.stopPropagation();
          addToCart(item, 1);
        }}
      >
        <Text style={styles.addButtonText}>+ Giỏ hàng</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ee4d2d" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Hero Section with Featured Products */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>🍬 Sản phẩm nổi bật</Text>
        <Text style={styles.heroSubtitle}>Những kẹo ngon từ khắp nơi trên thế giới</Text>
      </View>

      {/* Featured Products Carousel */}
      {filteredProducts.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.featuredScroll}
          contentContainerStyle={styles.featuredContainer}
        >
          {filteredProducts.slice(0, 5).map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.featuredCard}
              onPress={() => router.push(`/ProductDetail?id=${product.id}` as any)}
            >
              <Image
                source={{ uri: (product as any).image || product.imageUrl || 'https://via.placeholder.com/150' }}
                style={styles.featuredImage}
              />
              <View style={styles.featuredInfo}>
                <Text style={styles.featuredName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.featuredPrice}>₫{(product.price || 0).toLocaleString()}</Text>
                <TouchableOpacity
                  style={styles.featuredAddButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    addToCart(product, 1);
                  }}
                >
                  <Text style={styles.featuredAddText}>Thêm vào giỏ</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>🔍 Lọc</Text>
        </TouchableOpacity>
      </View>

      {/* Danh mục ngang */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === null && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryText, selectedCategory === null && styles.categoryTextActive]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal lọc giá */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lọc theo giá</Text>
            
            <TouchableOpacity
              style={[styles.priceOption, priceRange === 'all' && styles.priceOptionActive]}
              onPress={() => {
                setPriceRange('all');
                setShowFilterModal(false);
              }}
            >
              <Text style={[styles.priceOptionText, priceRange === 'all' && styles.priceOptionTextActive]}>
                Tất cả giá
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.priceOption, priceRange === 'under50' && styles.priceOptionActive]}
              onPress={() => {
                setPriceRange('under50');
                setShowFilterModal(false);
              }}
            >
              <Text style={[styles.priceOptionText, priceRange === 'under50' && styles.priceOptionTextActive]}>
                Dưới 50.000đ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.priceOption, priceRange === '50to100' && styles.priceOptionActive]}
              onPress={() => {
                setPriceRange('50to100');
                setShowFilterModal(false);
              }}
            >
              <Text style={[styles.priceOptionText, priceRange === '50to100' && styles.priceOptionTextActive]}>
                50.000đ - 100.000đ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.priceOption, priceRange === 'over100' && styles.priceOptionActive]}
              onPress={() => {
                setPriceRange('over100');
                setShowFilterModal(false);
              }}
            >
              <Text style={[styles.priceOptionText, priceRange === 'over100' && styles.priceOptionTextActive]}>
                Trên 100.000đ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Danh sách sản phẩm */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  heroSection: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 20,
    paddingVertical: 32,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  featuredScroll: {
    backgroundColor: '#fff',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featuredContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 12,
  },
  featuredCard: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  featuredImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f0f0f0',
  },
  featuredInfo: {
    padding: 14,
  },
  featuredName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    height: 36,
  },
  featuredPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 10,
  },
  featuredAddButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredAddText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  filterButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#ff6b35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  categoryScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryContainer: {
    padding: 14,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#222',
  },
  priceOption: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  priceOptionActive: {
    backgroundColor: '#ffe6e0',
    borderColor: '#ff6b35',
  },
  priceOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  priceOptionTextActive: {
    color: '#ff6b35',
    fontWeight: 'bold',
    fontSize: 17,
  },
  closeButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  listContainer: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 6,
    padding: 8,
    maxWidth: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  productName: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    height: 34,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
