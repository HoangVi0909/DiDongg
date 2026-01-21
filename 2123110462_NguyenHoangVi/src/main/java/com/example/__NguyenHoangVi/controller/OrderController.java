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
        try {
            System.out.println("📤 Received order request:");
            System.out.println("   - Customer: " + request.getCustomerName());
            System.out.println("   - Phone: " + request.getPhone());
            System.out.println("   - Payment: " + request.getPaymentMethod());
            System.out.println("   - Status: " + request.getStatus());
            System.out.println("   - Total: " + request.getTotalAmount());
            
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
            System.out.println("✅ Order saved successfully - ID: " + savedOrder.getId());

            // Trả về response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("orderId", savedOrder.getId());
            response.put("message", "Đặt hàng thành công!");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ Error creating order: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // POST http://localhost:8080/api/orders/{id}/confirm-payment
    // Admin xác nhận thanh toán
    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<?> confirmPayment(@PathVariable Long id) {
        try {
            Order order = repo.findById(id).orElse(null);
            if (order == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Đơn hàng không tồn tại");
                return ResponseEntity.status(404).body(error);
            }

            // Cập nhật status thành "confirmed"
            order.setStatus("confirmed");
            Order updatedOrder = repo.save(order);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xác nhận thanh toán thành công");
            response.put("order", updatedOrder);

            System.out.println("✅ Admin confirmed payment for order: " + id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // GET http://localhost:8080/api/orders/pending-payment
    // Lấy các đơn hàng chờ xác nhận thanh toán
    @GetMapping("/pending-payment")
    public ResponseEntity<?> getPendingPaymentOrders() {
        try {
            List<Order> pendingOrders = repo.findByStatus("pending");
            Map<String, Object> response = new HashMap<>();
            response.put("orders", pendingOrders);
            response.put("count", pendingOrders.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // PUT http://localhost:8080/api/orders/{id}/status
    // Cập nhật trạng thái đơn hàng
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            if (newStatus == null || newStatus.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Trạng thái không hợp lệ");
                return ResponseEntity.status(400).body(error);
            }

            Order order = repo.findById(id).orElse(null);
            if (order == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Đơn hàng không tồn tại");
                return ResponseEntity.status(404).body(error);
            }

            order.setStatus(newStatus);
            Order updatedOrder = repo.save(order);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật trạng thái thành công");
            response.put("order", updatedOrder);

            System.out.println("📦 Order status updated - ID: " + id + " - New Status: " + newStatus);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // GET http://localhost:8080/api/orders/{id}
    // Lấy chi tiết một đơn hàng
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            Order order = repo.findById(id).orElse(null);
            if (order == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Đơn hàng không tồn tại");
                return ResponseEntity.status(404).body(error);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("order", order);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
