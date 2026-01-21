import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  rating: number; // 1-5 stars
  comment: string;
  images?: string[];
  createdAt: string;
  updatedAt?: string;
  helpful?: number; // Số người thấy hữu ích
}

interface ReviewContextType {
  reviews: ProductReview[];
  addReview: (review: ProductReview) => Promise<void>;
  updateReview: (review: ProductReview) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  getProductReviews: (productId: string) => ProductReview[];
  getAverageRating: (productId: string) => number;
  hasReviewedProduct: (productId: string) => boolean;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  // Load reviews khi app start
  React.useEffect(() => {
    const loadReviews = async () => {
      try {
        const saved = await AsyncStorage.getItem('userReviews');
        if (saved) {
          setReviews(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };
    loadReviews();
  }, []);

  const addReview = async (review: ProductReview) => {
    try {
      const updated = [...reviews, review];
      setReviews(updated);
      await AsyncStorage.setItem('userReviews', JSON.stringify(updated));
      console.log('✅ Review added for product:', review.productName);
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const updateReview = async (review: ProductReview) => {
    try {
      const updated = reviews.map((r) => (r.id === review.id ? review : r));
      setReviews(updated);
      await AsyncStorage.setItem('userReviews', JSON.stringify(updated));
      console.log('✅ Review updated');
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const updated = reviews.filter((r) => r.id !== reviewId);
      setReviews(updated);
      await AsyncStorage.setItem('userReviews', JSON.stringify(updated));
      console.log('✅ Review deleted');
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const getProductReviews = (productId: string): ProductReview[] => {
    return reviews.filter((r) => r.productId === productId);
  };

  const getAverageRating = (productId: string): number => {
    const productReviews = getProductReviews(productId);
    if (productReviews.length === 0) return 0;
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / productReviews.length) * 10) / 10;
  };

  const hasReviewedProduct = (productId: string): boolean => {
    return reviews.some((r) => r.productId === productId);
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        addReview,
        updateReview,
        deleteReview,
        getProductReviews,
        getAverageRating,
        hasReviewedProduct,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReview() {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within ReviewProvider');
  }
  return context;
}
