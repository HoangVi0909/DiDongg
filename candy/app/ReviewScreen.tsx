import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useReview, ProductReview } from '../context/ReviewContext';
import { useToast } from '../context/ToastContext';

export default function ReviewScreen() {
  const { reviews, addReview, updateReview, deleteReview, getProductReviews, getAverageRating } = useReview();
  const { showToast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReview, setEditingReview] = useState<ProductReview | null>(null);

  // Mock products (trong thực tế sẽ từ API hoặc cart)
  const mockProducts = [
    { id: '1', name: 'Bánh quy bơ' },
    { id: '2', name: 'Kẹo socola' },
    { id: '3', name: 'Bánh su kem' },
  ];

  const handleAddReview = (productId: string) => {
    setSelectedProductId(productId);
    setShowReviewModal(true);
    setRating(5);
    setComment('');
    setEditingReview(null);
  };

  const handleSaveReview = async () => {
    if (!selectedProductId) return;

    if (!comment.trim()) {
      showToast('Vui lòng nhập đánh giá!', 'warning');
      return;
    }

    const product = mockProducts.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (editingReview) {
      const updated: ProductReview = {
        ...editingReview,
        rating,
        comment,
        updatedAt: new Date().toISOString(),
      };
      await updateReview(updated);
      showToast('✅ Cập nhật đánh giá thành công!', 'success');
    } else {
      const newReview: ProductReview = {
        id: Date.now().toString(),
        productId: selectedProductId,
        productName: product.name,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };
      await addReview(newReview);
      showToast('✅ Thêm đánh giá thành công!', 'success');
    }

    setShowReviewModal(false);
    setComment('');
  };

  const renderStars = (stars: number, onPress?: (num: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity key={num} onPress={() => onPress?.(num)}>
            <Text style={[styles.star, num <= stars ? styles.starFilled : styles.starEmpty]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderProductReviews = (productId: string) => {
    const productReviews = getProductReviews(productId);
    const avgRating = getAverageRating(productId);

    return (
      <View key={productId} style={styles.productCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{mockProducts.find((p) => p.id === productId)?.name}</Text>
          {productReviews.length > 0 && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{avgRating} ⭐ ({productReviews.length})</Text>
            </View>
          )}
        </View>

        {productReviews.length > 0 ? (
          productReviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <View>{renderStars(review.rating)}</View>
                <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</Text>
              </View>

              <Text style={styles.reviewComment}>{review.comment}</Text>

              <View style={styles.reviewActions}>
                <TouchableOpacity
                  style={styles.reviewBtn}
                  onPress={() => {
                    setEditingReview(review);
                    setRating(review.rating);
                    setComment(review.comment);
                    setSelectedProductId(productId);
                    setShowReviewModal(true);
                  }}
                >
                  <Text style={styles.reviewBtnText}>Sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.reviewBtn, styles.deleteReviewBtn]}
                  onPress={() => {
                    Alert.alert('Xác nhận', 'Xóa đánh giá này?', [
                      { text: 'Hủy', onPress: () => {} },
                      {
                        text: 'Xóa',
                        onPress: () => {
                          deleteReview(review.id);
                          showToast('✅ Xóa đánh giá thành công!', 'success');
                        },
                      },
                    ]);
                  }}
                >
                  <Text style={styles.reviewBtnText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noReviewText}>Chưa có đánh giá nào</Text>
        )}

        <TouchableOpacity style={styles.addReviewBtn} onPress={() => handleAddReview(productId)}>
          <Text style={styles.addReviewBtnText}>+ Thêm đánh giá</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
          <Text style={styles.headerSubtitle}>Chia sẻ trải nghiệm của bạn với cộng đồng</Text>
        </View>

        {mockProducts.map((product) => renderProductReviews(product.id))}

        {reviews.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Bạn chưa có đánh giá nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={showReviewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingReview ? 'Sửa đánh giá' : 'Thêm đánh giá'}
              </Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Đánh giá:</Text>
              {renderStars(rating, setRating)}

              <Text style={[styles.label, { marginTop: 16 }]}>Bình luận:</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={5}
                placeholderTextColor="#999"
              />

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>💡 Bình luận chi tiết giúp người khác hiểu rõ hơn về sản phẩm</Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.modalBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.submitBtn]} onPress={handleSaveReview}>
                <Text style={styles.submitBtnText}>{editingReview ? 'Cập nhật' : 'Gửi'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  productCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ratingBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
  },
  reviewItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    fontSize: 16,
  },
  starFilled: {
    color: '#ffc107',
  },
  starEmpty: {
    color: '#ddd',
  },
  reviewComment: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 10,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewBtn: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  deleteReviewBtn: {
    backgroundColor: '#ffcdd2',
  },
  reviewBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  noReviewText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 12,
  },
  addReviewBtn: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 10,
    backgroundColor: '#10b981',
    borderRadius: 6,
    alignItems: 'center',
  },
  addReviewBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    flexDirection: 'column',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeBtn: {
    fontSize: 24,
    color: '#999',
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  commentInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#333',
    textAlignVertical: 'top',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#0284c7',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#e0e0e0',
  },
  submitBtn: {
    backgroundColor: '#10b981',
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
