import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function StaffScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    productCount: 0,
    orderCount: 0,
    customerCount: 0,
    totalRevenue: '0',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ⚠️ ADMIN STATS API DISABLED - Using mock data only
    setStats({
      productCount: 8,
      orderCount: 12,
      customerCount: 5,
      totalRevenue: '2,500,000'
    });
    setLoading(false);
  }, []);

  // DISABLED: Admin stats endpoint not available
  // const fetchStats = async () => {
  //   try {
  //     const res = await fetch(`${getApiUrl()}/admin/stats`);
  //     if (res.ok) {
  //       const data = await res.json();
  //       setStats(data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching stats:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const menuItems = [
    { title: 'Bán hàng', icon: '🛍️', color: '#3b82f6', route: '/StaffSales' as const },
    { title: 'Đơn hàng', icon: '📋', color: '#10b981', route: '/StaffOrders' as const },
    { title: 'Sản phẩm', icon: '📦', color: '#f59e0b', route: '/StaffProducts' as const },
    { title: 'Khách hàng', icon: '👥', color: '#8b5cf6', route: '/StaffCustomers' as const },
    { title: 'Kho hàng', icon: '🏪', color: '#ec4899', route: '/StaffInventory' as const },
    { title: 'Báo cáo', icon: '📊', color: '#6b7280', route: '/StaffReports' as const },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trang nhân viên</Text>
        <Text style={styles.headerSubtitle}>Chào mừng bạn quay trở lại!</Text>
      </View>

      {/* Stats Cards */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.statNumber}>{stats.productCount}</Text>
                <Text style={styles.statLabel}>Sản phẩm</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
                <Text style={styles.statNumber}>{stats.orderCount}</Text>
                <Text style={styles.statLabel}>Đơn hàng</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#f59e0b' }]}>
                <Text style={styles.statNumber}>{stats.customerCount}</Text>
                <Text style={styles.statLabel}>Khách hàng</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#ec4899' }]}>
                <Text style={styles.statNumber}>{stats.totalRevenue}</Text>
                <Text style={styles.statLabel}>Doanh thu</Text>
              </View>
            </View>

            {/* Menu Grid */}
            <View style={styles.menuGrid}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuCard}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <Text style={styles.icon}>{item.icon}</Text>
                  </View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});
