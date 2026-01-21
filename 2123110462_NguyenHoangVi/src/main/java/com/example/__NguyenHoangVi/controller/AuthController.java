package com.example.__NguyenHoangVi.controller;

import com.example.__NguyenHoangVi.entity.User;
import com.example.__NguyenHoangVi.service.AuthService;
import com.example.__NguyenHoangVi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    // POST http://localhost:8080/api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User req) {
        User user = authService.login(req.getUsername(), req.getPassword());

        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Tên đăng nhập hoặc mật khẩu không đúng");
            return ResponseEntity.status(401).body(error);
        }

        return ResponseEntity.ok(user);
    }

    // POST http://localhost:8080/api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User req) {
        User user = authService.register(req);
        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Tên đăng nhập đã tồn tại");
            return ResponseEntity.status(400).body(error);
        }
        return ResponseEntity.ok(user);
    }

    // POST http://localhost:8080/api/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> req) {
        String email = req.get("email");
        System.out.println("🔍 Forgot password request for email: " + email);
        String result = authService.forgotPassword(email);

        if (result == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Email không tồn tại trong hệ thống");
            return ResponseEntity.status(404).body(error);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", result);
        return ResponseEntity.ok(response);
    }

    // POST http://localhost:8080/api/auth/verify-token
    @PostMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestBody Map<String, String> req) {
        String resetToken = req.get("resetToken");

        if (resetToken == null || resetToken.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Thiếu mã xác nhận");
            return ResponseEntity.status(400).body(error);
        }

        String result = authService.verifyResetToken(resetToken);

        if (result.contains("không hợp lệ") || result.contains("hết hạn")) {
            Map<String, String> error = new HashMap<>();
            error.put("error", result);
            return ResponseEntity.status(400).body(error);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", result);
        return ResponseEntity.ok(response);
    }

    // POST http://localhost:8080/api/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> req) {
        String resetToken = req.get("resetToken");
        String newPassword = req.get("newPassword");

        if (resetToken == null || newPassword == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Thiếu thông tin");
            return ResponseEntity.status(400).body(error);
        }

        String result = authService.resetPassword(resetToken, newPassword);

        if (result.contains("không hợp lệ") || result.contains("hết hạn")) {
            Map<String, String> error = new HashMap<>();
            error.put("error", result);
            return ResponseEntity.status(400).body(error);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", result);
        return ResponseEntity.ok(response);
    }

    // DEBUG: GET http://localhost:8080/api/auth/debug/users
    @GetMapping("/debug/users")
    public ResponseEntity<?> debugUsers() {
        List<User> users = userRepository.findAll();
        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", users.size());
        response.put("users", users);
        System.out.println("📊 Users in database: " + users.size());
        for (User u : users) {
            System.out.println("  - Username: " + u.getUsername() + ", Email: " + u.getEmail());
        }
        return ResponseEntity.ok(response);
    }
}
