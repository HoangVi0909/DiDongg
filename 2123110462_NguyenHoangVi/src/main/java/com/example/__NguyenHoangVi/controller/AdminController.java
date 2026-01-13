package com.example.__NguyenHoangVi.controller;

import com.example.__NguyenHoangVi.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private CustomerRepository customerRepo;

    // GET http://localhost:8080/api/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new HashMap<>();

        // Đếm số lượng sản phẩm
        long productCount = productRepo.count();
        stats.put("productCount", productCount);

        // Đếm số lượng đơn hàng
        long orderCount = orderRepo.count();
        stats.put("orderCount", orderCount);

        // Đếm số lượng khách hàng
        long customerCount = customerRepo.count();
        stats.put("customerCount", customerCount);

        // Tính tổng doanh thu (giả sử bạn muốn tính từ bảng orders)
        // Nếu không có method này, có thể tạm thời để số giả
        stats.put("totalRevenue", "15.2M"); // Có thể tính thực tế sau

        return ResponseEntity.ok(stats);
    }
}
