package com.example.__NguyenHoangVi.controller;

import com.example.__NguyenHoangVi.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    // Static list to store notifications temporarily (replace with database later)
    private static final List<Map<String, Object>> notificationStore = Collections.synchronizedList(new ArrayList<>());

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

    // POST http://localhost:8080/api/admin/notifications/send
    @PostMapping("/notifications/send")
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, Object> request) {
        try {
            String title = (String) request.get("title");
            String message = (String) request.get("message");
            String type = (String) request.get("type"); // promotion, update, alert, news
            String targetUsers = (String) request.get("targetUsers"); // all or specific
            List<?> targetUserIds = (List<?>) request.get("targetUserIds");
            String imageUrl = (String) request.get("imageUrl");
            String actionUrl = (String) request.get("actionUrl");

            // Validation
            if (title == null || title.trim().isEmpty() || message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Tiêu đề và nội dung không được trống"));
            }

            // Lưu notification vào database hoặc cache
            Map<String, Object> notification = new HashMap<>();
            notification.put("id", UUID.randomUUID().toString());
            notification.put("title", title);
            notification.put("message", message);
            notification.put("type", type != null ? type : "news");
            notification.put("targetUsers", targetUsers != null ? targetUsers : "all");
            notification.put("targetUserIds", targetUserIds != null ? targetUserIds : new ArrayList<>());
            notification.put("imageUrl", imageUrl);
            notification.put("actionUrl", actionUrl);
            notification.put("sentAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
            notification.put("isActive", true);

            // Save to temporary storage
            notificationStore.add(notification);

            System.out.println("✅ Admin sent notification: " + title);
            return ResponseEntity.ok(Map.of(
                    "message", "Gửi thông báo thành công",
                    "notification", notification));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi gửi thông báo: " + e.getMessage()));
        }
    }

    // GET
    // http://localhost:8080/api/notifications/new?since=2024-01-01T00:00:00&userPhone=0123456789
    @GetMapping("/notifications/new")
    public ResponseEntity<?> getNewNotifications(
            @RequestParam(value = "since", defaultValue = "2024-01-01T00:00:00") String since,
            @RequestParam(value = "userPhone", required = false) String userPhone) {
        try {
            LocalDateTime sinceTime = LocalDateTime.parse(since.replace("Z", ""));
            List<Map<String, Object>> newNotifications = new ArrayList<>();

            synchronized (notificationStore) {
                for (Map<String, Object> noti : notificationStore) {
                    String sentAtStr = (String) noti.get("sentAt");
                    LocalDateTime sentAt = LocalDateTime.parse(sentAtStr.replace("Z", ""));

                    // Check if notification is after 'since' time
                    if (sentAt.isAfter(sinceTime)) {
                        // Check if notification targets this user
                        String targetUsers = (String) noti.get("targetUsers");
                        if ("all".equals(targetUsers)) {
                            newNotifications.add(noti);
                        } else if ("specific".equals(targetUsers) && userPhone != null) {
                            List<?> targetUserIds = (List<?>) noti.get("targetUserIds");
                            if (targetUserIds != null && targetUserIds.contains(userPhone)) {
                                newNotifications.add(noti);
                            }
                        }
                    }
                }
            }

            System.out.println("📬 Returning " + newNotifications.size() + " new notifications for user: " + userPhone);
            return ResponseEntity.ok(newNotifications);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi lấy thông báo: " + e.getMessage()));
        }
    }
}
