package com.example.__NguyenHoangVi.controller;

import com.example.__NguyenHoangVi.model.Voucher;
import com.example.__NguyenHoangVi.repository.VoucherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/vouchers")
@CrossOrigin(origins = "*")
public class VoucherController {

    @Autowired
    private VoucherRepository voucherRepository;

    // GET all vouchers
    @GetMapping
    public ResponseEntity<?> getAllVouchers() {
        try {
            List<Voucher> vouchers = voucherRepository.findAll();
            return ResponseEntity.ok(vouchers);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // GET active vouchers only
    @GetMapping("/active")
    public ResponseEntity<?> getActiveVouchers() {
        try {
            List<Voucher> vouchers = voucherRepository.findByIsActive(true);
            return ResponseEntity.ok(vouchers);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // GET by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getVoucherById(@PathVariable Long id) {
        try {
            Optional<Voucher> voucher = voucherRepository.findById(id);
            if (voucher.isPresent()) {
                return ResponseEntity.ok(voucher.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // GET by code
    @GetMapping("/code/{code}")
    public ResponseEntity<?> getVoucherByCode(@PathVariable String code) {
        try {
            Optional<Voucher> voucher = voucherRepository.findByCode(code.toUpperCase());
            if (voucher.isPresent()) {
                return ResponseEntity.ok(voucher.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // CREATE voucher
    @PostMapping
    public ResponseEntity<?> createVoucher(@RequestBody Map<String, Object> request) {
        try {
            String code = ((String) request.get("code")).toUpperCase();
            Double discount = ((Number) request.get("discount")).doubleValue();
            String type = (String) request.get("type");
            String description = (String) request.get("description");
            String expiryDate = (String) request.get("expiryDate");
            Integer minOrder = request.get("minOrder") != null ? ((Number) request.get("minOrder")).intValue() : null;
            Integer maxUse = request.get("maxUse") != null ? ((Number) request.get("maxUse")).intValue() : null;

            // Validate
            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mã voucher không được trống"));
            }
            if (discount == null || discount <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Giá trị giảm phải lớn hơn 0"));
            }
            if (!type.equals("percent") && !type.equals("fixed")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Loại phải là 'percent' hoặc 'fixed'"));
            }

            // Check duplicate code
            if (voucherRepository.findByCode(code).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Mã voucher đã tồn tại"));
            }

            Voucher voucher = new Voucher(code, discount, type, description, expiryDate, minOrder, maxUse);
            Voucher saved = voucherRepository.save(voucher);

            System.out.println("✅ Voucher created: " + code);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi tạo voucher: " + e.getMessage()));
        }
    }

    // UPDATE voucher
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVoucher(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            Optional<Voucher> existing = voucherRepository.findById(id);
            if (!existing.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Voucher voucher = existing.get();

            if (request.get("code") != null) {
                String newCode = ((String) request.get("code")).toUpperCase();
                // Check if new code is different and already exists
                if (!newCode.equals(voucher.getCode()) && voucherRepository.findByCode(newCode).isPresent()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Mã voucher đã tồn tại"));
                }
                voucher.setCode(newCode);
            }
            if (request.get("discount") != null) {
                voucher.setDiscount(((Number) request.get("discount")).doubleValue());
            }
            if (request.get("type") != null) {
                voucher.setType((String) request.get("type"));
            }
            if (request.get("description") != null) {
                voucher.setDescription((String) request.get("description"));
            }
            if (request.get("expiryDate") != null) {
                voucher.setExpiryDate((String) request.get("expiryDate"));
            }
            if (request.get("minOrder") != null) {
                voucher.setMinOrder(((Number) request.get("minOrder")).intValue());
            }
            if (request.get("maxUse") != null) {
                voucher.setMaxUse(((Number) request.get("maxUse")).intValue());
            }
            if (request.get("isActive") != null) {
                voucher.setIsActive((Boolean) request.get("isActive"));
            }

            Voucher updated = voucherRepository.save(voucher);
            System.out.println("✅ Voucher updated: " + id);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Lỗi cập nhật voucher: " + e.getMessage()));
        }
    }

    // DELETE voucher
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable Long id) {
        try {
            if (!voucherRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            voucherRepository.deleteById(id);
            System.out.println("✅ Voucher deleted: " + id);
            return ResponseEntity.ok(Map.of("message", "Xóa voucher thành công"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi xóa voucher: " + e.getMessage()));
        }
    }

    // TOGGLE active status
    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleVoucher(@PathVariable Long id) {
        try {
            Optional<Voucher> existing = voucherRepository.findById(id);
            if (!existing.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Voucher voucher = existing.get();
            voucher.setIsActive(!voucher.getIsActive());
            Voucher updated = voucherRepository.save(voucher);

            System.out.println("✅ Voucher toggled: " + id + " -> " + updated.getIsActive());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi toggle voucher: " + e.getMessage()));
        }
    }

    // Validate voucher (check if can be used)
    @GetMapping("/{code}/validate")
    public ResponseEntity<?> validateVoucher(@PathVariable String code,
            @RequestParam(value = "totalAmount", defaultValue = "0") Integer totalAmount) {
        try {
            Optional<Voucher> voucher = voucherRepository.findByCode(code.toUpperCase());
            if (!voucher.isPresent()) {
                return ResponseEntity.ok(Map.of(
                        "valid", false,
                        "message", "Mã voucher không tồn tại"));
            }

            Voucher v = voucher.get();

            // Check if active
            if (!v.getIsActive()) {
                return ResponseEntity.ok(Map.of(
                        "valid", false,
                        "message", "Voucher không còn hoạt động"));
            }

            // Check expiry date
            if (v.getExpiryDate().compareTo(java.time.LocalDate.now().toString()) < 0) {
                return ResponseEntity.ok(Map.of(
                        "valid", false,
                        "message", "Voucher đã hết hạn"));
            }

            // Check max use
            if (v.getMaxUse() != null && v.getUsedCount() >= v.getMaxUse()) {
                return ResponseEntity.ok(Map.of(
                        "valid", false,
                        "message", "Voucher đã hết lượt sử dụng"));
            }

            // Check min order
            if (v.getMinOrder() != null && totalAmount < v.getMinOrder()) {
                return ResponseEntity.ok(Map.of(
                        "valid", false,
                        "message", "Đơn hàng phải từ " + v.getMinOrder() + " VND"));
            }

            // Calculate discount amount
            Double discountAmount = 0.0;
            if (v.getType().equals("percent")) {
                discountAmount = (totalAmount * v.getDiscount()) / 100;
            } else {
                discountAmount = v.getDiscount();
            }

            return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "message", "Voucher hợp lệ",
                    "discount", discountAmount,
                    "type", v.getType(),
                    "discountValue", v.getDiscount()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Lỗi validate voucher: " + e.getMessage()));
        }
    }
}
