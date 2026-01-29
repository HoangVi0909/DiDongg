import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, Platform } from "react-native";
import { getApiUrl } from "../config/network";
import AdminSidebar from "../components/AdminSidebar";

const isWeb = Platform.OS === "web";

export default function AdminScreen() {
  const [stats, setStats] = useState({ productCount: 0, orderCount: 0, customerCount: 0, totalRevenue: "0" });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductList, setShowProductList] = useState(false);

  useEffect(() => {
    // ⚠️ ADMIN STATS API DISABLED - Using mock data only
    setStats({
      productCount: 8,
      orderCount: 12,
      customerCount: 5,
      totalRevenue: "2,500,000"
    });
    fetchProducts();
    setLoading(false);
  }, []);

  const fetchProducts = async () => {
    try {
      const url = `${getApiUrl()}/api/products`;
      const res = await fetch(url);
      if (res.ok) setProducts(await res.json());
    } catch (e) {
      console.error("Error fetching products:", e);
    }
  };

  const dashboardCards = [
    { id: 1, title: "Sản phẩm", value: stats.productCount, color: "#FFA500", icon: "" },
    { id: 2, title: "Danh mục", value: 12, color: "#10B981", icon: "" },
    { id: 3, title: "Bài viết", value: 5, color: "#00BCD4", icon: "" },
    { id: 4, title: "Bài viết DM", value: 2, color: "#FF5252", icon: "" },
    { id: 5, title: "Liên hệ", value: 0, color: "#9C27B0", icon: "" },
    { id: 6, title: "Thành viên", value: 2, color: "#E91E63", icon: "" },
    { id: 7, title: "Đơn chưa xử lý", value: 5, color: "#FF1744", icon: "" },
    { id: 8, title: "Đơn đã xử lý", value: 0, color: "#00E676", icon: "" },
  ];

  if (isWeb) {
    return (
      <View style={styles.containerWeb}>
        <AdminSidebar />
        {showProductList ? (
          <ProductListView products={products} onBack={() => setShowProductList(false)} />
        ) : (
          <MainContent stats={dashboardCards} loading={loading} onCardPress={(cardId: number) => { if (cardId === 1) setShowProductList(true); }} />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showProductList ? (
        <ProductListView products={products} onBack={() => setShowProductList(false)} />
      ) : (
        <MainContent stats={dashboardCards} loading={loading} onCardPress={(cardId: number) => { if (cardId === 1) setShowProductList(true); }} />
      )}
    </View>
  );
}

function ProductListView({ products, onBack }: any) {
  return (
    <ScrollView style={styles.mainContent} contentContainerStyle={styles.mainContentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Danh sach san pham</Text>
        <Text style={styles.pageSubtitle}>Tong cong: {products.length} san pham</Text>
      </View>
      <View style={styles.productTable}>
        {products && products.length > 0 ? (
          products.map((product: any, idx: number) => (
            <View key={product.id || idx} style={styles.productRow}>
              <Text style={styles.productCell}>{idx + 1}</Text>
              <Text style={styles.productCell}>{product.name || "N/A"}</Text>
              <Text style={styles.productCell}>{product.price ? `${product.price}` : "0"}</Text>
              <Text style={styles.productCell}>{product.quantity || "0"}</Text>
              <Text style={styles.productCell}>{product.status === 1 ? "Active" : "Inactive"}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noProductText}>No products found</Text>
        )}
      </View>
    </ScrollView>
  );
}

function MainContent({ stats, loading, onCardPress }: any) {
  const renderCard = ({ item }: any) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: item.color }]} onPress={() => onCardPress && onCardPress(item.id)}>
      <View style={styles.cardTop}>
        <Text style={styles.cardValue}>{item.value}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <TouchableOpacity style={styles.cardDetail} onPress={() => onCardPress && onCardPress(item.id)}>
        <Text style={styles.cardDetailText}>Chi tiet</Text>
        <Text style={styles.cardDetailIcon}></Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.mainContent} contentContainerStyle={styles.mainContentContainer}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Tong quan</Text>
        <Text style={styles.pageSubtitle}>Tong quan</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList data={stats} renderItem={renderCard} keyExtractor={(item) => item.id.toString()} numColumns={4} scrollEnabled={false} columnWrapperStyle={styles.cardRow} style={styles.cardGrid} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  containerWeb: { flex: 1, flexDirection: "row", backgroundColor: "#E8E8E8" },
  container: { flex: 1, backgroundColor: "#E8E8E8" },
  mainContent: { flex: 1, backgroundColor: "#E8E8E8" },
  mainContentContainer: { padding: 16 },
  header: { marginBottom: 24 },
  pageTitle: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: "#999" },
  cardGrid: { width: "100%" },
  cardRow: { justifyContent: "space-between", marginBottom: 16 },
  card: { flex: 0.23, borderRadius: 8, padding: 16, minHeight: 160, justifyContent: "space-between", elevation: 3 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardValue: { fontSize: 32, fontWeight: "bold", color: "#FFF" },
  cardTitle: { fontSize: 14, color: "#FFF", marginTop: 12 },
  cardDetail: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginTop: 8 },
  cardDetailText: { fontSize: 12, color: "#FFF", marginRight: 4 },
  cardDetailIcon: { fontSize: 12, color: "#FFF" },
  loadingContainer: { paddingVertical: 60, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#666" },
  backButton: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#3498db", borderRadius: 4, marginBottom: 12 },
  backButtonText: { fontSize: 14, color: "#FFF", fontWeight: "bold" },
  productTable: { width: "100%", borderRadius: 8, overflow: "hidden", backgroundColor: "#FFF", elevation: 2 },
  productRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E0E0E0", paddingVertical: 12, paddingHorizontal: 8 },
  productCell: { flex: 1, fontSize: 13, color: "#333", paddingHorizontal: 4 },
  noProductText: { fontSize: 16, color: "#999", textAlign: "center", paddingVertical: 32 },
});