import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../config/network';
import { useCart, Product } from '../context/CartContext';

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
        setProducts(validProducts.slice(0, 8)); // Lấy 8 sản phẩm
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity style={styles.categoryItem} onPress={() => router.push('/ProductList' as any)}>
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.miniProductCard}
      onPress={() => router.push(`/ProductDetail?id=${item.id}` as any)}
    >
      <Image
        source={{ uri: (item as any).image || item.imageUrl || 'https://via.placeholder.com/120' }}
        style={styles.miniProductImage}
      />
      <Text style={styles.miniProductName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.miniProductPrice}>
        ₫{(item.price || 0).toLocaleString()}
      </Text>
      <TouchableOpacity
        style={styles.miniAddButton}
        onPress={(e) => {
          e.stopPropagation();
          addToCart(item, 1);
        }}
      >
        <Text style={styles.miniAddButtonText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Search Banner */}
      <View style={styles.searchBanner}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>�</Text>
          <Text style={styles.searchPlaceholder}>Tìm kiếm kẹo, nước...</Text>
        </View>
        <TouchableOpacity style={styles.cartIcon}>
          <Text style={styles.cartText}>🛒</Text>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          scrollEnabled={false}
          columnWrapperStyle={styles.categoryRow}
        />
      </View>

      {/* Promo Banner */}
      <TouchableOpacity style={styles.promoBanner}>
        <Text style={styles.promoEmoji}>🎉</Text>
        <View style={styles.promoContent}>
          <Text style={styles.promoTitle}>Khuyến mãi hôm nay</Text>
          <Text style={styles.promoDesc}>Giảm đến 40% cho đơn đầu tiên</Text>
        </View>
        <Text style={styles.promoArrow}>→</Text>
      </TouchableOpacity>

      {/* Featured Products */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔥 Nổi bật</Text>
        <TouchableOpacity onPress={() => router.push('/ProductList' as any)}>
          <Text style={styles.seeAllLink}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#ff6b35" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={4}
          scrollEnabled={false}
          columnWrapperStyle={styles.productRow}
        />
      )}

      {/* More Sections */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>⭐ Được yêu thích</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllLink}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products.slice(0, 4)}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={4}
        scrollEnabled={false}
        columnWrapperStyle={styles.productRow}
      />

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBanner: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 40,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: '#999',
    flex: 1,
  },
  cartIcon: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartText: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#f0f',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoriesSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 8,
    borderBottomColor: '#f5f5f5',
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: '31%',
    paddingVertical: 8,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  promoBanner: {
    backgroundColor: '#ff6b35',
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  promoEmoji: {
    fontSize: 28,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  promoDesc: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  promoArrow: {
    fontSize: 20,
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  seeAllLink: {
    fontSize: 13,
    color: '#ff6b35',
    fontWeight: '600',
  },
  productRow: {
    justifyContent: 'space-between',
    marginHorizontal: 6,
    marginBottom: 8,
  },
  miniProductCard: {
    width: '23%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
    position: 'relative',
  },
  miniProductImage: {
    width: '100%',
    height: 80,
    backgroundColor: '#f5f5f5',
  },
  miniProductName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#222',
    paddingHorizontal: 6,
    paddingTop: 6,
    height: 24,
  },
  miniProductPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff6b35',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  miniAddButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAddButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: -2,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    height: 20,
  },
});
