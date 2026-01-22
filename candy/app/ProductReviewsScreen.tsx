import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useToast } from '../context/ToastContext';

const isWeb = Platform.OS === 'web';

interface Review {
  id: number;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  helpful: number;
  unhelpful: number;
  verified: boolean;
  images?: string[];
}

export default function ProductReviewsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'helpful' | 'rating_high' | 'rating_low'>('newest');
  const [modalVisible, setModalVisible] = useState(false);
  const [userReview, setUserReview] = useState({
    rating: 5,
    title: '',
    content: '',
  });

  const productId = params?.id || '1';
  const productName = params?.name || 'Sản Phẩm';
  const currentRating = 4.7;
  const totalReviews = 328;

  useEffect(() => {
    const loadReviews = async () => {
      await fetchReviews();
    };
    loadReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockReviews: Review[] = [
        {
          id: 1,
          authorName: 'Nguyễn Văn A',
          rating: 5,
          title: 'Tuyệt vời! Rất ngon',
          content: 'Sản phẩm này rất tươi, giao hàng nhanh chóng. Chắc chắn sẽ mua tiếp!',
          createdAt: '2026-01-22 10:30',
          helpful: 45,
          unhelpful: 2,
          verified: true,
        },
        {
          id: 2,
          authorName: 'Trần Thị B',
          rating: 4,
          title: 'Hài lòng nhưng hơi đắt',
          content: 'Chất lượng tốt, nhưng giá hơi cao so với ngoài thị trường. Tuy nhiên vẫn đáng mua.',
          createdAt: '2026-01-21 14:20',
          helpful: 28,
          unhelpful: 5,
          verified: true,
        },
        {
          id: 3,
          authorName: 'Lê Văn C',
          rating: 5,
          title: 'Sản phẩm chất lượng cao',
          content: 'Đã mua nhiều lần rồi, luôn hài lòng. Gói hàng cẩn thận, vận chuyển nhanh!',
          createdAt: '2026-01-20 09:15',
          helpful: 92,
          unhelpful: 1,
          verified: true,
        },
        {
          id: 4,
          authorName: 'Phạm Thị D',
          rating: 3,
          title: 'Bình thường',
          content: 'Sản phẩm ổn nhưng không quá ấn tượng. Có thể tìm được loại tốt hơn với giá rẻ hơn.',
          createdAt: '2026-01-19 16:45',
          helpful: 15,
          unhelpful: 8,
          verified: true,
        },
        {
          id: 5,
          authorName: 'Đỗ Văn E',
          rating: 5,
          title: '⭐⭐⭐⭐⭐ Rất tốt',
          content: 'Hết lời khen! Chất lượng tuyệt vời, giá hợp lý. Mình sẽ giới thiệu cho bạn bè.',
          createdAt: '2026-01-18 12:00',
          helpful: 156,
          unhelpful: 3,
          verified: true,
        },
      ];
      setReviews(mockReviews);
    } catch {
      showToast('Lỗi kết nối API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRatingStats = () => {
    const stats = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    reviews.forEach((r) => {
      stats[r.rating as keyof typeof stats]++;
    });
    return stats;
  };

  const getFilteredAndSortedReviews = () => {
    let result = [...reviews];

    if (ratingFilter) {
      result = result.filter((r) => r.rating === ratingFilter);
    }

    switch (sortBy) {
      case 'helpful':
        result.sort((a, b) => b.helpful - a.helpful);
        break;
      case 'rating_high':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating_low':
        result.sort((a, b) => a.rating - b.rating);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  };

  const handleSubmitReview = () => {
    if (!userReview.title || !userReview.content) {
      showToast('Vui lòng nhập tiêu đề và nội dung!', 'error');
      return;
    }

    const newReview: Review = {
      id: Math.max(...reviews.map((r) => r.id), 0) + 1,
      authorName: 'Bạn',
      rating: userReview.rating,
      title: userReview.title,
      content: userReview.content,
      createdAt: new Date().toLocaleString('vi-VN'),
      helpful: 0,
      unhelpful: 0,
      verified: true,
    };

    setReviews([newReview, ...reviews]);
    setUserReview({ rating: 5, title: '', content: '' });
    setModalVisible(false);
    showToast('✅ Gửi đánh giá thành công!', 'success');
  };

  const handleHelpful = (reviewId: number, isHelpful: boolean) => {
    setReviews(
      reviews.map((r) =>
        r.id === reviewId
          ? {
            ...r,
            helpful: isHelpful ? r.helpful + 1 : r.helpful,
            unhelpful: !isHelpful ? r.unhelpful + 1 : r.unhelpful,
          }
          : r
      )
    );
    showToast(isHelpful ? '👍 Cảm ơn vì phản hồi!' : '👎 Cảm ơn vì phản hồi!', 'info');
  };

  const filteredReviews = getFilteredAndSortedReviews();
  const ratingStats = getRatingStats();
  const ratingPercentages = {
    5: Math.round((ratingStats[5] / reviews.length) * 100) || 0,
    4: Math.round((ratingStats[4] / reviews.length) * 100) || 0,
    3: Math.round((ratingStats[3] / reviews.length) * 100) || 0,
    2: Math.round((ratingStats[2] / reviews.length) * 100) || 0,
    1: Math.round((ratingStats[1] / reviews.length) * 100) || 0,
  };

  const renderStars = (rating: number, size: number = 14) => {
    const stars = '⭐'.repeat(Math.floor(rating));
    return <Text style={{ fontSize: size }}>{stars}</Text>;
  };

  const renderReviewCard = (review: Review) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.authorAvatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{review.authorName}</Text>
            <Text style={styles.createdAt}>{review.createdAt}</Text>
            {review.verified && (
              <Text style={styles.verifiedBadge}>✓ Đã mua</Text>
            )}
          </View>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingNumber}>{review.rating}</Text>
          <Text style={styles.ratingStars}>{renderStars(review.rating, 12)}</Text>
        </View>
      </View>

      <Text style={styles.reviewTitle}>{review.title}</Text>
      <Text style={styles.reviewContent}>{review.content}</Text>

      <View style={styles.reviewFooter}>
        <View style={styles.helpfulContainer}>
          <TouchableOpacity
            style={styles.helpfulBtn}
            onPress={() => handleHelpful(review.id, true)}
          >
            <Text style={styles.helpfulBtnText}>👍 Hữu ích ({review.helpful})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.unhelpfulBtn}
            onPress={() => handleHelpful(review.id, false)}
          >
            <Text style={styles.helpfulBtnText}>👎 Không ({review.unhelpful})</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isWeb) {
    return (
      <View style={styles.containerWeb}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backBtnContainer} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Quay lại</Text>
          </TouchableOpacity>

          <Text style={styles.productTitle}>⭐ Đánh Giá - {productName}</Text>

          <View style={styles.ratingOverview}>
            <View style={styles.ratingLeft}>
              <Text style={styles.overallRating}>{currentRating}</Text>
              <Text style={styles.overallStars}>{renderStars(currentRating, 28)}</Text>
              <Text style={styles.totalReviewsText}>({totalReviews} đánh giá)</Text>

              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.writeReviewBtnText}>✍️ Viết Đánh Giá</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ratingRight}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={styles.ratingRow}
                  onPress={() =>
                    setRatingFilter(ratingFilter === rating ? null : rating)
                  }
                >
                  <Text style={styles.ratingLabel}>{rating} ⭐</Text>
                  <View style={styles.ratingBar}>
                    <View
                      style={[
                        styles.ratingFill,
                        {
                          width: `${ratingPercentages[rating as keyof typeof ratingPercentages]}%`,
                          backgroundColor:
                            ratingFilter === rating ? '#FF6B6B' : '#FFD700',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.ratingPercent}>
                    {ratingPercentages[rating as keyof typeof ratingPercentages]}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.reviewControls}>
            <Text style={styles.sortLabel}>Sắp xếp:</Text>
            <View style={styles.sortButtons}>
              {['newest', 'helpful', 'rating_high', 'rating_low'].map((sort) => (
                <TouchableOpacity
                  key={sort}
                  style={[
                    styles.sortBtn,
                    sortBy === sort && styles.sortBtnActive,
                  ]}
                  onPress={() => setSortBy(sort as any)}
                >
                  <Text
                    style={[
                      styles.sortBtnText,
                      sortBy === sort && styles.sortBtnTextActive,
                    ]}
                  >
                    {sort === 'newest' && 'Mới'}
                    {sort === 'helpful' && 'Hữu Ích'}
                    {sort === 'rating_high' && 'Sao Cao'}
                    {sort === 'rating_low' && 'Sao Thấp'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
          ) : filteredReviews.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
            </View>
          ) : (
            <View>
              {filteredReviews.map(renderReviewCard)}
            </View>
          )}
        </View>
      </View>
    );
  }

  // Mobile view
  return (
    <View style={styles.container}>
      <View style={styles.mobileHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.mobileTitle}>Đánh Giá</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.writeIconBtn}>✍️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.ratingOverviewMobile}>
          <Text style={styles.overallRating}>{currentRating}</Text>
          <Text style={styles.overallStars}>{renderStars(currentRating, 24)}</Text>
          <Text style={styles.totalReviewsText}>({totalReviews} đánh giá)</Text>
        </View>

        <View style={styles.ratingStatsmobile}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={styles.ratingRowMobile}
              onPress={() =>
                setRatingFilter(ratingFilter === rating ? null : rating)
              }
            >
              <Text style={styles.ratingLabelMobile}>{rating}⭐</Text>
              <View style={styles.ratingBarMobile}>
                <View
                  style={[
                    styles.ratingFillMobile,
                    {
                      width: `${ratingPercentages[rating as keyof typeof ratingPercentages]}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.ratingPercentMobile}>
                {ratingPercentages[rating as keyof typeof ratingPercentages]}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sortButtonsMobile}>
          {['newest', 'helpful', 'rating_high', 'rating_low'].map((sort) => (
            <TouchableOpacity
              key={sort}
              style={[
                styles.sortBtn,
                sortBy === sort && styles.sortBtnActive,
              ]}
              onPress={() => setSortBy(sort as any)}
            >
              <Text
                style={[
                  styles.sortBtnText,
                  sortBy === sort && styles.sortBtnTextActive,
                ]}
              >
                {sort === 'newest' && 'Mới'}
                {sort === 'helpful' && 'Hữu'}
                {sort === 'rating_high' && '⭐↑'}
                {sort === 'rating_low' && '⭐↓'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#FF6B6B" style={styles.loader} />
        ) : filteredReviews.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>Chưa có đánh giá</Text>
          </View>
        ) : (
          <View>
            {filteredReviews.map(renderReviewCard)}
          </View>
        )}
      </ScrollView>

      {/* Write Review Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✍️ Viết Đánh Giá</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✖️</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalSectionTitle}>Đánh giá của bạn:</Text>
              <View style={styles.ratingSelector}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingSelectorBtn,
                      userReview.rating === rating &&
                      styles.ratingSelectorBtnActive,
                    ]}
                    onPress={() =>
                      setUserReview({ ...userReview, rating })
                    }
                  >
                    <Text style={styles.ratingSelectorIcon}>
                      {'⭐'.repeat(rating)}
                    </Text>
                    <Text style={styles.ratingSelectorLabel}>
                      {rating === 1 && 'Tệ'}
                      {rating === 2 && 'Không tốt'}
                      {rating === 3 && 'Bình thường'}
                      {rating === 4 && 'Tốt'}
                      {rating === 5 && 'Tuyệt vời'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalSectionTitle}>Tiêu đề:</Text>
              <TextInput
                style={styles.input}
                placeholder="Tóm tắt đánh giá của bạn..."
                value={userReview.title}
                onChangeText={(text) =>
                  setUserReview({ ...userReview, title: text })
                }
                maxLength={100}
              />
              <Text style={styles.charCount}>{userReview.title.length}/100</Text>

              <Text style={styles.modalSectionTitle}>Chi tiết:</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm..."
                value={userReview.content}
                onChangeText={(text) =>
                  setUserReview({ ...userReview, content: text })
                }
                multiline
                numberOfLines={6}
                maxLength={1000}
              />
              <Text style={styles.charCount}>{userReview.content.length}/1000</Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmitReview}
                >
                  <Text style={styles.submitBtnText}>✅ Gửi Đánh Giá</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>✖️ Hủy</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  containerWeb: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtnContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtnText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  mobileTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  writeIconBtn: {
    fontSize: 20,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  ratingOverview: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 40,
  },
  ratingLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  overallStars: {
    fontSize: 24,
    marginVertical: 8,
  },
  totalReviewsText: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  writeReviewBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  writeReviewBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  ratingRight: {
    flex: 1,
    gap: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 40,
    color: '#2c3e50',
  },
  ratingBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingFill: {
    height: '100%',
    borderRadius: 4,
  },
  ratingPercent: {
    fontSize: 13,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
    color: '#2c3e50',
  },
  reviewControls: {
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2c3e50',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sortBtnActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  sortBtnTextActive: {
    color: 'white',
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE4E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  createdAt: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 2,
  },
  verifiedBadge: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 4,
  },
  ratingBadge: {
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  ratingStars: {
    fontSize: 12,
    marginTop: 2,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  reviewContent: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
    marginBottom: 12,
  },
  reviewFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  helpfulContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  helpfulBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignItems: 'center',
  },
  unhelpfulBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignItems: 'center',
  },
  helpfulBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  loader: {
    marginTop: 20,
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
  ratingOverviewMobile: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ratingStatsmobile: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ratingRowMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ratingLabelMobile: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
    color: '#2c3e50',
  },
  ratingBarMobile: {
    flex: 1,
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingFillMobile: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FFD700',
  },
  ratingPercentMobile: {
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'right',
    color: '#2c3e50',
  },
  sortButtonsMobile: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '95%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeBtn: {
    fontSize: 20,
  },
  modalContent: {
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#2c3e50',
  },
  ratingSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  ratingSelectorBtn: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ratingSelectorBtnActive: {
    backgroundColor: '#FFE4E1',
    borderColor: '#FF6B6B',
  },
  ratingSelectorIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  ratingSelectorLabel: {
    fontSize: 11,
    color: '#2c3e50',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 13,
    marginBottom: 4,
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  charCount: {
    fontSize: 11,
    color: '#95a5a6',
    marginBottom: 12,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
