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
      const res = await fetch(`${getApiUrl()}/products`);
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
    
    // Lọc theo danh mục
    const matchesCategory = selectedCategory === null || product.categoryId === selectedCategory;
    
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
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  filterButton: {
    backgroundColor: '#ee4d2d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  categoryScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryContainer: {
    padding: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryChipActive: {
    backgroundColor: '#ee4d2d',
    borderColor: '#ee4d2d',
  },
  categoryText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  priceOption: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  priceOptionActive: {
    backgroundColor: '#fee',
    borderColor: '#ee4d2d',
  },
  priceOptionText: {
    fontSize: 15,
    color: '#333',
    textAlign: 'center',
  },
  priceOptionTextActive: {
    color: '#ee4d2d',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    padding: 14,
    backgroundColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  listContainer: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 6,
    padding: 8,
    maxWidth: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 4,
    marginBottom: 8,
  },
  productName: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
    height: 34,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ee4d2d',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#ee4d2d',
    borderRadius: 4,
    padding: 6,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
