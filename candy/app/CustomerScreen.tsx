import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { getApiUrl } from '../config/network';
import { useCart } from '../context/CartContext';

export default function CustomerScreen() {
  const router = useRouter();
  const { getCartCount } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/products`);
      if (res.ok) {
        const data = await res.json();
        // Lọc bỏ sản phẩm không hợp lệ (name hoặc price NULL)
        const validProducts = data.filter((p: any) => p.name && p.price !== null && p.price !== undefined);
        setProducts(validProducts.slice(0, 6)); // Lấy 6 sản phẩm hợp lệ đầu tiên
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { title: 'Sản phẩm', icon: '🛍️', color: '#ee4d2d', route: '/ProductList' },
    { title: 'Giỏ hàng', icon: '🛒', color: '#10b981', route: '/Cart' },
    { title: 'Đơn hàng', icon: '📦', color: '#f59e0b', route: '/Orders' },
    { title: 'Yêu thích', icon: '❤️', color: '#ec4899', route: '/Favorites' },
    { title: 'Tài khoản', icon: '👤', color: '#8b5cf6', route: '/Account' },
    { title: 'Hỗ trợ', icon: '💬', color: '#6b7280', route: '/Account' },
  ];

  const cartCount = getCartCount();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Chào mừng!</Text>
          <Text style={styles.headerSubtitle}>Khám phá sản phẩm ngon nhất</Text>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: item.color }]}>
                <Text style={styles.actionEmoji}>{item.icon}</Text>
              </View>
              <Text style={styles.actionTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
            <TouchableOpacity onPress={() => router.push('/ProductList' as any)}>
              <Text style={styles.seeAll}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ee4d2d" />
            </View>
          ) : (
            <View style={styles.productGrid}>
              {products.map((product: any, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.productCard}
                  onPress={() => router.push(`/ProductDetail?id=${product.id}` as any)}
                >
                  <View style={styles.productImage}>
                    <Text style={styles.productPlaceholder}>🍬</Text>
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    ₫{product.price?.toLocaleString()}
                  </Text>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(`/ProductDetail?id=${product.id}` as any);
                    }}
                  >
                    <Text style={styles.addButtonText}>Xem chi tiết</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Promotional Banner */}
        <TouchableOpacity style={styles.promoBanner}>
          <Text style={styles.promoTitle}>🎉 Giảm giá 20%</Text>
          <Text style={styles.promoSubtitle}>Cho đơn hàng từ 200.000đ</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ee4d2d',
    padding: 16,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#fff',
    marginTop: 2,
    opacity: 0.9,
  },
  cartButton: {
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIcon: {
    fontSize: 22,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#fff',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ee4d2d',
  },
  cartBadgeText: {
    color: '#ee4d2d',
    fontSize: 11,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionEmoji: {
    fontSize: 22,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 13,
    color: '#ee4d2d',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48.5%',
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productPlaceholder: {
    fontSize: 56,
  },
  productName: {
    fontSize: 13,
    color: '#333',
    marginTop: 8,
    marginHorizontal: 8,
    marginBottom: 4,
    height: 36,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ee4d2d',
    marginHorizontal: 8,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#ee4d2d',
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  promoBanner: {
    backgroundColor: '#ee4d2d',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.95,
  },
});
