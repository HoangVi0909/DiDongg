package com.example.__NguyenHoangVi.controller;

import com.example.__NguyenHoangVi.entity.Review;
import com.example.__NguyenHoangVi.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    // Get all reviews
    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // Get reviews by product
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getReviewsByProduct(@PathVariable Long productId) {
        List<Review> reviews = reviewRepository.findApprovedReviewsByProduct(productId);
        Double avgRating = reviewRepository.getAverageRatingByProduct(productId);

        Map<String, Object> response = new HashMap<>();
        response.put("averageRating", avgRating != null ? avgRating : 0.0);
        response.put("totalReviews", reviews.size());
        response.put("reviews", reviews);

        // Rating breakdown
        Map<Integer, Long> ratingBreakdown = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            Long count = reviewRepository.countReviewsByRating(productId, i);
            ratingBreakdown.put(i, count);
        }
        response.put("ratingBreakdown", ratingBreakdown);

        return ResponseEntity.ok(response);
    }

    // Get pending reviews (Admin)
    @GetMapping("/pending")
    public List<Review> getPendingReviews() {
        return reviewRepository.findByStatus("pending");
    }

    // Get review by ID
    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable Long id) {
        Optional<Review> review = reviewRepository.findById(id);
        if (review.isPresent()) {
            return ResponseEntity.ok(review.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Create review
    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        if (review.getProductId() == null || review.getCustomerId() == null) {
            return ResponseEntity.badRequest().build();
        }
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());
        review.setStatus("pending");
        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }

    // Update review
    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable Long id, @RequestBody Review reviewDetails) {
        Optional<Review> review = reviewRepository.findById(id);
        if (review.isPresent()) {
            Review r = review.get();
            if (reviewDetails.getTitle() != null)
                r.setTitle(reviewDetails.getTitle());
            if (reviewDetails.getContent() != null)
                r.setContent(reviewDetails.getContent());
            if (reviewDetails.getRating() != null)
                r.setRating(reviewDetails.getRating());
            if (reviewDetails.getStatus() != null)
                r.setStatus(reviewDetails.getStatus());
            r.setUpdatedAt(LocalDateTime.now());
            Review updated = reviewRepository.save(r);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Approve review
    @PutMapping("/{id}/approve")
    public ResponseEntity<Review> approveReview(@PathVariable Long id) {
        Optional<Review> review = reviewRepository.findById(id);
        if (review.isPresent()) {
            Review r = review.get();
            r.setStatus("approved");
            r.setUpdatedAt(LocalDateTime.now());
            Review updated = reviewRepository.save(r);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Reject review
    @PutMapping("/{id}/reject")
    public ResponseEntity<Review> rejectReview(@PathVariable Long id) {
        Optional<Review> review = reviewRepository.findById(id);
        if (review.isPresent()) {
            Review r = review.get();
            r.setStatus("rejected");
            r.setUpdatedAt(LocalDateTime.now());
            Review updated = reviewRepository.save(r);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete review
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        Optional<Review> review = reviewRepository.findById(id);
        if (review.isPresent()) {
            reviewRepository.deleteById(id);
            return ResponseEntity.ok().body(Map.of("message", "Review deleted successfully"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Update helpful count
    @PutMapping("/{id}/helpful")
    public ResponseEntity<Review> markHelpful(@PathVariable Long id) {
        Optional<Review> review = reviewRepository.findById(id);
        if (review.isPresent()) {
            Review r = review.get();
            r.setHelpfulCount(r.getHelpfulCount() + 1);
            r.setUpdatedAt(LocalDateTime.now());
            Review updated = reviewRepository.save(r);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Update unhelpful count
    @PutMapping("/{id}/unhelpful")
    public ResponseEntity<Review> markUnhelpful(@PathVariable Long id) {
        Optional<Review> review = reviewRepository.findById(id);
        if (review.isPresent()) {
            Review r = review.get();
            r.setUnhelpfulCount(r.getUnhelpfulCount() + 1);
            r.setUpdatedAt(LocalDateTime.now());
            Review updated = reviewRepository.save(r);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
