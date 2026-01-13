package com.example.__NguyenHoangVi.controller;

import com.example.__NguyenHoangVi.entity.User;
import com.example.__NguyenHoangVi.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

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
}
