import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  FlatList,
} from 'react-native';
import AdminSidebar from '../components/AdminSidebar';
import { useToast } from '../context/ToastContext';
import { getApiUrl } from '../config/network';

const isWeb = Platform.OS === 'web';

interface Review {
  id: number;
  product: { id: number; name: string };
  customer: { id: number; firstName: string; lastName: string };
  rating: number;
  content: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminCommentsScreen() {
  const { showToast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const loadComments = async () => {
      await fetchComments();
    };
    loadComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      // Mock data - thay thế bằng API thực
      const mockComments: Comment[] = [
        {
          id: 1,
          productId: 1,
          productName: 'Kẹo Xoàn Vàng',
          customerName: 'Nguyễn Văn A',
          rating: 5,
          text: 'Sản phẩm tuyệt vời, giao hàng nhanh!',
          createdAt: '2026-01-22 10:30',
          status: 'approved',
        },
        {
          id: 2,
          productId: 2,
          productName: 'Nước Cam Squeeze',
          customerName: 'Trần Thị B',
          rating: 4,
          text: 'Tốt, nhưng hơi đắt',
          createdAt: '2026-01-22 09:15',
          status: 'pending',
        },
        {
          id: 3,
          productId: 1,
          productName: 'Kẹo Xoàn Vàng',
          customerName: 'Lê Văn C',
          rating: 3,
          text: 'XXX spam comment',
          createdAt: '2026-01-21 14:45',
          status: 'pending',
        },
        {
          id: 4,
          productId: 3,
          productName: 'Bánh Quy Hương Vani',
          customerName: 'Phạm Thị D',
          rating: 5,
          text: 'Rất ngon, mua tiếp!',
          createdAt: '2026-01-21 11:20',
          status: 'approved',
        },
        {
          id: 5,
          productId: 2,
          productName: 'Nước Cam Squeeze',
          customerName: 'Đỗ Văn E',
          rating: 2,
          text: 'Hết hạn sớm quá',
          createdAt: '2026-01-20 16:00',
          status: 'rejected',
        },
      ];
      setComments(mockComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      showToast('Lỗi kết nối API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (comment: Comment) => {
    try {
      setComments(comments.map(c => 
        c.id === comment.id ? { ...c, status: 'approved' } : c
      ));
      showToast('✅ Duyệt bình luận thành công!', 'success');
    } catch {
      showToast('❌ Lỗi!', 'error');
    }
  };

  const handleReject = async (comment: Comment) => {
    try {
      setComments(comments.map(c => 
        c.id === comment.id ? { ...c, status: 'rejected' } : c
      ));
      showToast('⛔ Từ chối bình luận!', 'info');
    } catch {
      showToast('❌ Lỗi!', 'error');
    }
  };

  const handleDelete = async (comment: Comment) => {
    Alert.alert('Xóa bình luận', 'Bạn chắc chắn xóa bình luận này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        onPress: () => {
          setComments(comments.filter(c => c.id !== comment.id));
          showToast('✅ Xóa thành công!', 'success');
        },
        style: 'destructive',
      },
    ]);
  };

  // Filter
  const filteredComments = comments.filter(comment => {
    const matchStatus = selectedStatus === 'all' || comment.status === selectedStatus;
    const matchSearch = 
      (comment.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comment.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comment.text || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComments = filteredComments.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#e74c3c';
      default:
        return '#f39c12';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅ Đã Duyệt';
      case 'rejected':
        return '⛔ Từ Chối';
      default:
        return '⏳ Chờ Duyệt';
    }
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // Web view
  if (isWeb) {
    return (
      <View style={styles.containerWeb}>
        <AdminSidebar />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>💬 Quản lý Bình Luận</Text>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Tìm kiếm sản phẩm, khách hàng, nội dung..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={styles.filterButtons}>
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterBtn,
                  selectedStatus === status && styles.filterBtnActive,
                ]}
                onPress={() => {
                  setSelectedStatus(status);
                  setCurrentPage(1);
                }}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    selectedStatus === status && styles.filterBtnTextActive,
                  ]}
                >
                  {status === 'all' ? 'Tất Cả' : status === 'pending' ? '⏳ Chờ' : status === 'approved' ? '✅ Duyệt' : '⛔ Từ Chối'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
          ) : paginatedComments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>Không tìm thấy bình luận</Text>
            </View>
          ) : (
            <>
              {paginatedComments.map((comment) => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{comment.productName}</Text>
                      <Text style={styles.customerName}>👤 {comment.customerName}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(comment.status) },
                      ]}
                    >
                      <Text style={styles.statusText}>{getStatusLabel(comment.status)}</Text>
                    </View>
                  </View>

                  <Text style={styles.rating}>{getRatingStars(comment.rating)}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <Text style={styles.date}>📅 {comment.createdAt}</Text>

                  <View style={styles.actions}>
                    {comment.status !== 'approved' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.approveBtn]}
                        onPress={() => handleApprove(comment)}
                      >
                        <Text style={styles.actionBtnText}>✅ Duyệt</Text>
                      </TouchableOpacity>
                    )}
                    {comment.status !== 'rejected' && (
                      <TouchableOpacity
                        style={[styles.actionBtn, styles.rejectBtn]}
                        onPress={() => handleReject(comment)}
                      >
                        <Text style={styles.actionBtnText}>⛔ Từ Chối</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.deleteBtn]}
                      onPress={() => handleDelete(comment)}
                    >
                      <Text style={styles.actionBtnText}>🗑️ Xóa</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    disabled={currentPage === 1}
                    onPress={() => setCurrentPage(currentPage - 1)}
                    style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                  >
                    <Text style={styles.pageBtnText}>← Trước</Text>
                  </TouchableOpacity>
                  <Text style={styles.pageInfo}>{currentPage}/{totalPages}</Text>
                  <TouchableOpacity
                    disabled={currentPage === totalPages}
                    onPress={() => setCurrentPage(currentPage + 1)}
                    style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                  >
                    <Text style={styles.pageBtnText}>Sau →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    );
  }

  // Mobile view
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Bình Luận</Text>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Tìm kiếm..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <ScrollView horizontal style={styles.filterButtonsScroll}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterBtn,
              selectedStatus === status && styles.filterBtnActive,
            ]}
            onPress={() => {
              setSelectedStatus(status);
              setCurrentPage(1);
            }}
          >
            <Text
              style={[
                styles.filterBtnText,
                selectedStatus === status && styles.filterBtnTextActive,
              ]}
            >
              {status === 'all' ? 'Tất Cả' : status === 'pending' ? '⏳ Chờ' : status === 'approved' ? '✅ Duyệt' : '⛔ Từ Chối'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
      ) : (
        <FlatList
          data={paginatedComments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: comment }) => (
            <View style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {comment.productName}
                  </Text>
                  <Text style={styles.customerName}>👤 {comment.customerName}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(comment.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{getStatusLabel(comment.status)}</Text>
                </View>
              </View>

              <Text style={styles.rating}>{getRatingStars(comment.rating)}</Text>
              <Text style={styles.commentText} numberOfLines={2}>
                {comment.text}
              </Text>

              <View style={styles.actions}>
                {comment.status !== 'approved' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => handleApprove(comment)}
                  >
                    <Text style={styles.actionBtnText}>✅</Text>
                  </TouchableOpacity>
                )}
                {comment.status !== 'rejected' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => handleReject(comment)}
                  >
                    <Text style={styles.actionBtnText}>⛔</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(comment)}
                >
                  <Text style={styles.actionBtnText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>Không tìm thấy bình luận</Text>
            </View>
          }
        />
      )}
    </View>
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
  header: {
    marginBottom: 16,
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterButtonsScroll: {
    marginBottom: 12,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterBtnActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  filterBtnText: {
    color: '#7f8c8d',
    fontWeight: '600',
    fontSize: 12,
  },
  filterBtnTextActive: {
    color: 'white',
  },
  loader: {
    marginTop: 20,
  },
  commentCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  customerName: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  rating: {
    fontSize: 14,
    marginBottom: 8,
    color: '#f39c12',
  },
  commentText: {
    fontSize: 13,
    color: '#2c3e50',
    lineHeight: 18,
    marginBottom: 8,
  },
  date: {
    fontSize: 11,
    color: '#95a5a6',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: '#10b981',
  },
  rejectBtn: {
    backgroundColor: '#e74c3c',
  },
  deleteBtn: {
    backgroundColor: '#95a5a6',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3498db',
    borderRadius: 6,
  },
  pageBtnDisabled: {
    backgroundColor: '#bdc3c7',
  },
  pageBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 40,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});
