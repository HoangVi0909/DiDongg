import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

export const adminMenuItems = [
  { id: 1, title: 'Trang chủ', route: '/AdminScreen' },
  { id: 3, title: 'Sản phẩm', route: '/AdminProductsScreen' },
//   { id: 6, title: 'Danh mục', route: '/AdminCategoriesScreen' },
  { id: 9, title: 'Đơn hàng', route: '/AdminOrders' },
  { id: 4, title: 'Voucher', route: '/AdminVouchersScreen' },
  { id: 10, title: 'Khuyến mãi', route: '/AdminPromotionsScreen' },
  { id: 8, title: 'Bình luận', route: '/AdminCommentsScreen' },
  { id: 7, title: 'Thống kê', route: '/AdminAnalyticsScreen' },
  { id: 5, title: 'Người dùng', route: '/AdminUsersScreen' },
  { id: 11, title: 'Hàng tồn kho', route: '/AdminInventoryScreen' },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleMenuPress = (route: string) => {
    if (route !== '#') {
      router.push(route as any);
    }
  };

  const isActive = (route: string) => {
    return pathname === route || pathname.includes(route.replace('/', ''));
  };

  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Admin</Text>
        <Text style={styles.sidebarStatus}>Online</Text>
      </View>
      <Text style={styles.menuLabel}>MENU admin</Text>
      <ScrollView style={styles.sidebarMenu} showsVerticalScrollIndicator={false}>
        {adminMenuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              isActive(item.route) && styles.menuItemActive
            ]}
            onPress={() => handleMenuPress(item.route)}
          >
            <Text style={[
              styles.menuText,
              isActive(item.route) && styles.menuTextActive
            ]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: '#2C3E50',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#1A252F',
  },
  sidebarHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
    marginBottom: 12,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  sidebarStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  menuLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 8,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sidebarMenu: {
    flex: 1,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 4,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: '#34495E',
    borderLeftColor: '#3498DB',
  },
  menuText: {
    fontSize: 14,
    color: '#BDC3C7',
    fontWeight: '500',
  },
  menuTextActive: {
    color: '#3498DB',
    fontWeight: '600',
  },
});
