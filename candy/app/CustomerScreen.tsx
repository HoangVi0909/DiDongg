import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, FlatList, Dimensions, TextInput } from 'react-native';
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

export default function CustomerScreen() {
  const router = useRouter();
  const { addToCart, getCartCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

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
      // Filter by search text
      if (searchText.trim() !== '') {
        return p.name.toLowerCase().includes(searchText.toLowerCase());
      }
      return true;
    });

  const cartCount = getCartCount();

  const toggleFavorite = (productId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

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
        <TouchableOpacity 
          style={styles.favoriteBadge}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
        >
          <Text style={styles.favoriteBadgeText}>{favorites.has(item.id) ? '❤️' : '🤍'}</Text>
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

      {/* Categories Horizontal */}
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        scrollEnabled={true}
        nestedScrollEnabled={true}
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
  categoriesContainer: {
    paddingHorizontal: 6,
    paddingVertical: 8,
    gap: 4,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#f5f5f5',
    minWidth: 65,
    height: 44,
    justifyContent: 'center',
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
