import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useAdminStatistics } from '../context/AdminStatisticsContext';

export default function AdminStatisticsScreen() {
  const {
    orderStats,
    productStats,
    dailyStats,
    fetchOrderStatistics,
    fetchProductStatistics,
    fetchDailyStatistics,
  } = useAdminStatistics();

  useEffect(() => {
    fetchOrderStatistics();
    fetchProductStatistics();
    fetchDailyStatistics(7);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StatCard = ({ label, value, subtext, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
    </View>
  );

  const renderTopProduct = ({ item, index }: any) => (
    <View style={styles.productRow}>
      <Text style={styles.productRank}>#{index + 1}</Text>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.productName}
        </Text>
        <View style={styles.productMeta}>
          <Text style={styles.metaText}>📊 {item.salesCount} bán</Text>
          <Text style={styles.metaText}>⭐ {item.rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.productRevenue}>₫{(item.revenue / 1000000).toFixed(1)}M</Text>
    </View>
  );

  const renderDailyStats = ({ item, index }: any) => {
    const maxRevenue = Math.max(...dailyStats.map((s: any) => s.revenue));
    const barHeight = (item.revenue / maxRevenue) * 100;

    return (
      <View style={styles.dailyBar}>
        <Text style={styles.dayLabel}>{['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(item.date).getDay()]}</Text>
        <View style={styles.barContainer}>
          <View style={[styles.bar, { height: `${Math.max(barHeight, 15)}%` }]} />
        </View>
        <Text style={styles.barValue}>₫{(item.revenue / 1000000).toFixed(1)}M</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thống kê & Báo cáo</Text>
        <Text style={styles.headerDate}>{new Date().toLocaleDateString('vi-VN')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Statistics Section */}
        {orderStats && (
          <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Thống kê đơn hàng</Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Tổng đơn hàng"
              value={orderStats.totalOrders.toLocaleString()}
              color="#3b82f6"
              subtext={`${orderStats.pendingOrders} đơi chờ xử lý`}
            />
            <StatCard
              label="Tổng doanh thu"
              value={`₫${(orderStats.totalRevenue / 1000000).toFixed(1)}M`}
              color="#10b981"
              subtext={`Trung bình: ₫${(orderStats.totalRevenue / orderStats.totalOrders / 1000).toFixed(0)}K`}
            />
            <StatCard
              label="Đơn xác nhận"
              value={orderStats.confirmedOrders}
              color="#f59e0b"
              subtext={`${((orderStats.confirmedOrders / orderStats.totalOrders) * 100).toFixed(0)}% tổng số`}
            />
            <StatCard
              label="Đơn hủy"
              value={orderStats.cancelledOrders}
              color="#ef4444"
              subtext={`${((orderStats.cancelledOrders / orderStats.totalOrders) * 100).toFixed(0)}% tổng số`}
            />
          </View>
        </View>

        {/* Order Status Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Phân bổ trạng thái đơn hàng</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusLabel}>
                <View style={[styles.statusDot, { backgroundColor: '#3b82f6' }]} />
                <Text>Chờ xử lý</Text>
              </View>
              <View style={styles.statusBar}>
                <View
                  style={[
                    styles.statusBarFill,
                    {
                      width: `${(orderStats.pendingOrders / orderStats.totalOrders) * 100}%`,
                      backgroundColor: '#3b82f6',
                    },
                  ]}
                />
              </View>
              <Text style={styles.statusCount}>{orderStats.pendingOrders}</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusLabel}>
                <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
                <Text>Đã xác nhận</Text>
              </View>
              <View style={styles.statusBar}>
                <View
                  style={[
                    styles.statusBarFill,
                    {
                      width: `${(orderStats.confirmedOrders / orderStats.totalOrders) * 100}%`,
                      backgroundColor: '#f59e0b',
                    },
                  ]}
                />
              </View>
              <Text style={styles.statusCount}>{orderStats.confirmedOrders}</Text>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusLabel}>
                <View style={[styles.statusDot, { backgroundColor: '#ef4444' }]} />
                <Text>Bị hủy</Text>
              </View>
              <View style={styles.statusBar}>
                <View
                  style={[
                    styles.statusBarFill,
                    {
                      width: `${(orderStats.cancelledOrders / orderStats.totalOrders) * 100}%`,
                      backgroundColor: '#ef4444',
                    },
                  ]}
                />
              </View>
              <Text style={styles.statusCount}>{orderStats.cancelledOrders}</Text>
            </View>
          </View>
        </View>
          </>
        )}

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Top 5 sản phẩm bán chạy</Text>
          <View style={styles.productList}>
            <FlatList
              data={productStats}
              renderItem={renderTopProduct}
              keyExtractor={(item) => item.productId.toString()}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* 7-Day Revenue Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Doanh thu 7 ngày gần đây</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartContainer}>
              <FlatList
                data={dailyStats}
                renderItem={renderDailyStats}
                keyExtractor={(item) => item.date}
                scrollEnabled={false}
                numColumns={7}
                columnWrapperStyle={styles.chartRow}
              />
            </View>

            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
                <Text style={styles.legendText}>
                  Tổng: ₫{(dailyStats.reduce((sum: number, item: any) => sum + item.revenue, 0) / 1000000).toFixed(1)}M
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                <Text style={styles.legendText}>
                  Trung bình: ₫{(dailyStats.reduce((sum: number, item: any) => sum + item.revenue, 0) / dailyStats.length / 1000000).toFixed(1)}M/ngày
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Tỷ lệ chuyển đổi</Text>
              <Text style={styles.summaryValue}>
                {orderStats ? ((orderStats.confirmedOrders / orderStats.totalOrders) * 100).toFixed(1) : 0}%
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Đơn hàng hôm nay</Text>
              <Text style={styles.summaryValue}>{dailyStats[dailyStats.length - 1]?.orders || 0}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Doanh thu hôm nay</Text>
              <Text style={styles.summaryValue}>
                ₫{(dailyStats[dailyStats.length - 1]?.revenue / 1000000 || 0).toFixed(1)}M
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    gap: 8,
  },
  statCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    elevation: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: '#bbb',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    elevation: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 90,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statusBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    minWidth: 35,
    textAlign: 'right',
  },
  productList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 8,
  },
  productRank: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3b82f6',
    width: 30,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  productMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#999',
  },
  productRevenue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10b981',
    minWidth: 70,
    textAlign: 'right',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 1,
  },
  chartContainer: {
    marginBottom: 12,
  },
  chartRow: {
    justifyContent: 'space-around',
    flex: 1,
  },
  dailyBar: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  dayLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  barContainer: {
    width: 24,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 2,
  },
  bar: {
    width: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  barValue: {
    fontSize: 9,
    color: '#666',
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    elevation: 1,
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  footer: {
    height: 12,
  },
});
