package com.example.__NguyenHoangVi.controller;

import com.example.__NguyenHoangVi.entity.Order;
import com.example.__NguyenHoangVi.repository.OrderRepository;
import com.example.__NguyenHoangVi.dto.OrderRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository repo;

    // GET http://localhost:8080/api/orders
    // Lấy tất cả đơn hàng
    @GetMapping
    public List<Order> getAll() {
        return repo.findAll();
    }

    // POST http://localhost:8080/api/orders
    // Tạo đơn hàng mới
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody OrderRequest request) {
        // Tạo đơn hàng mới
        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setPhone(request.getPhone());
        order.setAddress(request.getAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(request.getStatus());
        order.setTotalAmount(request.getTotalAmount());
        order.setTransactionCode(request.getTransactionCode()); // Lưu mã giao dịch
        order.setOrderChannel("mobile");

        // Lưu vào database
        Order savedOrder = repo.save(order);

        // Trả về response
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("orderId", savedOrder.getId());
        response.put("message", "Đặt hàng thành công!");

        return ResponseEntity.ok(response);
    }
}
