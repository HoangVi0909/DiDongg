package com.example.__NguyenHoangVi.controller;

import com.example.__NguyenHoangVi.entity.Promotion;
import com.example.__NguyenHoangVi.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {

    @Autowired
    private PromotionRepository promotionRepository;

    // Get all promotions
    @GetMapping
    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    // Get active promotions
    @GetMapping("/active")
    public List<Promotion> getActivePromotions() {
        return promotionRepository.findActivePromotions(LocalDateTime.now());
    }

    // Get promotions by type (flash_sale, seasonal, discount)
    @GetMapping("/type/{type}")
    public List<Promotion> getPromotionsByType(@PathVariable String type) {
        return promotionRepository.findByPromotionType(type);
    }

    // Get promotion by ID
    @GetMapping("/{id}")
    public ResponseEntity<Promotion> getPromotionById(@PathVariable Long id) {
        Optional<Promotion> promotion = promotionRepository.findById(id);
        if (promotion.isPresent()) {
            return ResponseEntity.ok(promotion.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get promotion by code
    @GetMapping("/code/{code}")
    public ResponseEntity<Promotion> getPromotionByCode(@PathVariable String code) {
        Optional<Promotion> promotion = promotionRepository.findByCode(code);
        if (promotion.isPresent()) {
            return ResponseEntity.ok(promotion.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Create promotion
    @PostMapping
    public ResponseEntity<Promotion> createPromotion(@RequestBody Promotion promotion) {
        if (promotion.getCode() == null || promotion.getName() == null) {
            return ResponseEntity.badRequest().build();
        }
        promotion.setCreatedAt(LocalDateTime.now());
        promotion.setUpdatedAt(LocalDateTime.now());
        promotion.setUsageCount(0);
        Promotion saved = promotionRepository.save(promotion);
        return ResponseEntity.ok(saved);
    }

    // Update promotion
    @PutMapping("/{id}")
    public ResponseEntity<Promotion> updatePromotion(@PathVariable Long id, @RequestBody Promotion promotionDetails) {
        Optional<Promotion> promotion = promotionRepository.findById(id);
        if (promotion.isPresent()) {
            Promotion p = promotion.get();
            if (promotionDetails.getName() != null)
                p.setName(promotionDetails.getName());
            if (promotionDetails.getDescription() != null)
                p.setDescription(promotionDetails.getDescription());
            if (promotionDetails.getDiscountType() != null)
                p.setDiscountType(promotionDetails.getDiscountType());
            if (promotionDetails.getDiscountValue() != null)
                p.setDiscountValue(promotionDetails.getDiscountValue());
            if (promotionDetails.getMaxDiscount() != null)
                p.setMaxDiscount(promotionDetails.getMaxDiscount());
            if (promotionDetails.getMinPurchase() != null)
                p.setMinPurchase(promotionDetails.getMinPurchase());
            if (promotionDetails.getIsActive() != null)
                p.setIsActive(promotionDetails.getIsActive());
            if (promotionDetails.getStartDate() != null)
                p.setStartDate(promotionDetails.getStartDate());
            if (promotionDetails.getEndDate() != null)
                p.setEndDate(promotionDetails.getEndDate());
            if (promotionDetails.getUsageLimit() != null)
                p.setUsageLimit(promotionDetails.getUsageLimit());
            if (promotionDetails.getPromotionType() != null)
                p.setPromotionType(promotionDetails.getPromotionType());
            p.setUpdatedAt(LocalDateTime.now());
            Promotion updated = promotionRepository.save(p);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Toggle active status
    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<Promotion> toggleActive(@PathVariable Long id) {
        Optional<Promotion> promotion = promotionRepository.findById(id);
        if (promotion.isPresent()) {
            Promotion p = promotion.get();
            p.setIsActive(!p.getIsActive());
            p.setUpdatedAt(LocalDateTime.now());
            Promotion updated = promotionRepository.save(p);
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete promotion
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id) {
        Optional<Promotion> promotion = promotionRepository.findById(id);
        if (promotion.isPresent()) {
            promotionRepository.deleteById(id);
            return ResponseEntity.ok().body(Map.of("message", "Promotion deleted successfully"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Increment usage count
    @PutMapping("/{id}/use")
    public ResponseEntity<Promotion> usePromotion(@PathVariable Long id) {
        Optional<Promotion> promotion = promotionRepository.findById(id);
        if (promotion.isPresent()) {
            Promotion p = promotion.get();
            if (p.getUsageLimit() == null || p.getUsageCount() < p.getUsageLimit()) {
                p.setUsageCount(p.getUsageCount() + 1);
                p.setUpdatedAt(LocalDateTime.now());
                Promotion updated = promotionRepository.save(p);
                return ResponseEntity.ok(updated);
            } else {
                return ResponseEntity.badRequest().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
