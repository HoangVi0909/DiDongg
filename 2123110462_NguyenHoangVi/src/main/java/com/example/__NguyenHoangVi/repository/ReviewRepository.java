package com.example.__NguyenHoangVi.repository;

import com.example.__NguyenHoangVi.entity.Review;
import com.example.__NguyenHoangVi.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);

    List<Review> findByStatus(String status);

    @Query("SELECT r FROM Review r WHERE r.product.id = :productId AND r.status = 'approved' ORDER BY r.createdAt DESC")
    List<Review> findApprovedReviewsByProduct(@Param("productId") Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.status = 'approved'")
    Double getAverageRatingByProduct(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.rating = :rating AND r.status = 'approved'")
    Long countReviewsByRating(@Param("productId") Long productId, @Param("rating") Integer rating);
}
