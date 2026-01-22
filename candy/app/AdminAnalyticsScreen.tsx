import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

const isWeb = Platform.OS === 'web';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  topProducts: { name: string; sold: number; revenue: number }[];
  revenueByDay: { date: string; amount: number }[];
  orderStatus: { pending: number; completed: number; cancelled: number };
}

export default function AdminAnalyticsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  const menuItems = [
    { id: 1, title: 'Trang chu', icon: '', route: '/AdminScreen' },
    { id: 2, title: 'Menu', icon: '', route: '#' },
    { id: 3, title: 'San pham', icon: '', route: '/AdminProductsScreen' },
    { id: 6, title: 'Danh muc', icon: '', route: '/AdminCategoriesScreen' },
    { id: 9, title: 'Don hang', icon: '', route: '/AdminOrders' },
    { id: 4, title: 'Voucher', icon: '', route: '/AdminVouchersScreen' },
    { id: 5, title: 'Nguoi dung', icon: '', route: '/AdminUsersScreen' },
    { id: 7, title: 'Thong ke', icon: '', route: '/AdminAnalyticsScreen' },
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data - thay thế bằng API thực
      const mockStats: Stats = {
        totalRevenue: 125750000,
        totalOrders: 342,
        totalCustomers: 156,
        totalProducts: 89,
        averageOrderValue: 367807,
        topProducts: [
          { name: 'Kẹo Xoàn Vàng', sold: 45, revenue: 2250000 },
          { name: 'Nước Cam Squeeze', sold: 38, revenue: 1900000 },
          { name: 'Bánh Quy Hương Vani', sold: 32, revenue: 1600000 },
          { name: 'Kem Ốc Quế', sold: 28, revenue: 1960000 },
          { name: 'Kẹo Tổ Ong', sold: 25, revenue: 1250000 },
        ],
        revenueByDay: [
          { date: '16 Jan', amount: 3500000 },
          { date: '17 Jan', amount: 4200000 },
          { date: '18 Jan', amount: 3800000 },
          { date: '19 Jan', amount: 5100000 },
          { date: '20 Jan', amount: 4600000 },
          { date: '21 Jan', amount: 5800000 },
          { date: '22 Jan', amount: 6200000 },
        ],
        orderStatus: {
          pending: 12,
          completed: 315,
          cancelled: 15,
        },
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Không thể tải dữ liệu</Text>
      </View>
    );
  }

  // Web view
  if (isWeb) {
    return (
      <View style={styles.containerWeb}>
        <Sidebar menuItems={menuItems} router={router} />
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📊 Thống Kê & Phân Tích</Text>
            <View style={styles.periodButtons}>
              {(['day', 'week', 'month'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.periodBtn,
                    period === p && styles.periodBtnActive,
                  ]}
                  onPress={() => setPeriod(p)}
                >
                  <Text
                    style={[
                      styles.periodBtnText,
                      period === p && styles.periodBtnTextActive,
                    ]}
                  >
                    {p === 'day' ? 'Hôm nay' : p === 'week' ? 'Tuần' : 'Tháng'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* KPI Cards */}
          <View style={styles.kpiGrid}>
            <StatCard
              title="💰 Tổng Doanh Thu"
              value={`₫${(stats.totalRevenue / 1000000).toFixed(1)}M`}
              trend="+12.5%"
              color="#10b981"
            />
            <StatCard
              title="📦 Đơn Hàng"
              value={stats.totalOrders.toString()}
              trend="+8.2%"
              color="#3498db"
            />
            <StatCard
              title="👥 Khách Hàng"
              value={stats.totalCustomers.toString()}
              trend="+5.4%"
              color="#9b59b6"
            />
            <StatCard
              title="🛍️ Sản Phẩm"
              value={stats.totalProducts.toString()}
              trend="0%"
              color="#f39c12"
            />
          </View>

          {/* Average Order */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💳 Giá Trị Đơn Hàng Trung Bình</Text>
            <Text style={styles.largeValue}>
              ₫{(stats.averageOrderValue / 1000).toFixed(0)}K
            </Text>
          </View>

          {/* Order Status */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎯 Trạng Thái Đơn Hàng</Text>
            <View style={styles.statusGrid}>
              <StatusItem
                label="Đang Xử Lý"
                count={stats.orderStatus.pending}
                color="#f39c12"
              />
              <StatusItem
                label="Hoàn Thành"
                count={stats.orderStatus.completed}
                color="#10b981"
              />
              <StatusItem
                label="Đã Hủy"
                count={stats.orderStatus.cancelled}
                color="#e74c3c"
              />
            </View>
          </View>

          {/* Top Products */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔥 Sản Phẩm Bán Chạy Top 5</Text>
            {stats.topProducts.map((product, idx) => (
              <View key={idx} style={styles.topProductRow}>
                <Text style={styles.rank}>#{idx + 1}</Text>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productStats}>
                    {product.sold} bán | ₫{(product.revenue / 1000000).toFixed(1)}M
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Revenue Trend */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📈 Doanh Thu {period === 'day' ? 'Hôm Nay' : period === 'week' ? 'Tuần Này' : 'Tháng Này'}</Text>
            <View style={styles.chartContainer}>
              {stats.revenueByDay.map((day, idx) => (
                <View key={idx} style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height:
                          (day.amount / Math.max(...stats.revenueByDay.map((d) => d.amount))) *
                          150,
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>{day.date}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Mobile view
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Thống Kê</Text>
        <View style={styles.periodButtons}>
          {(['day', 'week', 'month'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodBtn,
                period === p && styles.periodBtnActive,
              ]}
              onPress={() => setPeriod(p)}
            >
              <Text
                style={[
                  styles.periodBtnText,
                  period === p && styles.periodBtnTextActive,
                ]}
              >
                {p === 'day' ? 'Hôm' : p === 'week' ? 'Tuần' : 'Tháng'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <StatCard
          title="💰 Doanh Thu"
          value={`₫${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          trend="+12.5%"
          color="#10b981"
        />
        <StatCard
          title="📦 Đơn"
          value={stats.totalOrders.toString()}
          trend="+8.2%"
          color="#3498db"
        />
      </View>

      <View style={styles.kpiGrid}>
        <StatCard
          title="👥 Khách"
          value={stats.totalCustomers.toString()}
          trend="+5.4%"
          color="#9b59b6"
        />
        <StatCard
          title="🛍️ SP"
          value={stats.totalProducts.toString()}
          trend="0%"
          color="#f39c12"
        />
      </View>

      {/* Average Order */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💳 Giá Trị TB/Đơn</Text>
        <Text style={styles.largeValue}>
          ₫{(stats.averageOrderValue / 1000).toFixed(0)}K
        </Text>
      </View>

      {/* Status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 Trạng Thái</Text>
        <View style={styles.statusGrid}>
          <StatusItem
            label="Xử Lý"
            count={stats.orderStatus.pending}
            color="#f39c12"
          />
          <StatusItem
            label="Xong"
            count={stats.orderStatus.completed}
            color="#10b981"
          />
          <StatusItem
            label="Hủy"
            count={stats.orderStatus.cancelled}
            color="#e74c3c"
          />
        </View>
      </View>

      {/* Top Products */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Top Sản Phẩm</Text>
        {stats.topProducts.map((product, idx) => (
          <View key={idx} style={styles.topProductRow}>
            <Text style={styles.rank}>#{idx + 1}</Text>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {product.name}
              </Text>
              <Text style={styles.productStats}>
                {product.sold} bán
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function StatCard({
  title,
  value,
  trend,
  color,
}: {
  title: string;
  value: string;
  trend: string;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statTrend, { color }]}>{trend}</Text>
    </View>
  );
}

function StatusItem({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <View style={styles.statusItem}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusCount}>{count}</Text>
    </View>
  );
}

function Sidebar({ menuItems, router }: any) {
  return (
    <ScrollView style={styles.sidebar}>
      {menuItems.map((item: any) => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuItem}
          onPress={() => router.push(item.route)}
        >
          <Text style={styles.menuText}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  containerWeb: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  sidebar: {
    width: 200,
    backgroundColor: '#2c3e50',
    paddingVertical: 20,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#34495e',
    borderBottomWidth: 1,
  },
  menuText: {
    color: '#ecf0f1',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  periodBtnActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  periodBtnText: {
    color: '#7f8c8d',
    fontWeight: '600',
    fontSize: 12,
  },
  periodBtnTextActive: {
    color: 'white',
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: isWeb ? 200 : '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },
  statTrend: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  largeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  statusCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  topProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  rank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    minWidth: 30,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  productStats: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 180,
    marginTop: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  bar: {
    width: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});
