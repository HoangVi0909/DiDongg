import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../config/network';
import { useCart, Product } from '../context/CartContext';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 24) / 2;

interface Category {
  id: number;
  name: string;
  emoji: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

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
      const url = `${getApiUrl()}/api/products`;
      console.log('📡 Fetching products from:', url);
      const res = await fetch(url);
      console.log('✅ Response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Fetched products count:', data.length || data.value?.length);
        const validProducts = data.filter ? data.filter((p: Product) => p.name && p.price !== null && p.price !== undefined) : data;
        setProducts(validProducts);
        console.log('✅ Valid products set:', validProducts.length);
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === null 
    ? products 
    : products.filter(p => {
        const categoryId = (p as any).category_id || p.categoryId;
        return categoryId === selectedCategory;
      });

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={[styles.categoryItem, selectedCategory === item.id && styles.categoryItemActive]}
      onPress={() => setSelectedCategory(selectedCategory === item.id ? null : item.id)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text style={[styles.categoryName, selectedCategory === item.id && styles.categoryNameActive]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

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
        <TouchableOpacity style={styles.favoriteBadge}>
          <Text style={styles.favoriteBadgeText}>❤️</Text>
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
          }}
        >
          <Text style={styles.addToCartText}>+ Giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header với Search */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/Customer' as any)}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Tìm kiếm kẹo, nước...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartButton}>
          <Text style={styles.cartIcon}>🛒</Text>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        scrollEnabled={false}
      />

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
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 38,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: '#999',
    flex: 1,
  },
  cartButton: {
    position: 'relative',
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 19,
  },
  cartIcon: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f0f',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoriesContainer: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    gap: 4,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#f5f5f5',
  },
  categoryItemActive: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 1,
  },
  categoryName: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryNameActive: {
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
    paddingBottom: 90,
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
    shadowOffset: { width: 0, height: 0 },
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
});
