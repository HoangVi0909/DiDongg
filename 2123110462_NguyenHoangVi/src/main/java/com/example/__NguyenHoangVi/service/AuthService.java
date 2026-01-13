package com.example.__NguyenHoangVi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.__NguyenHoangVi.entity.User;
import com.example.__NguyenHoangVi.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;

    public User login(String username, String password) {
        return userRepo.findByUsername(username)
                .filter(u -> u.getPassword().equals(password))
                .orElse(null);
    }

    public User register(User req) {
        if (userRepo.findByUsername(req.getUsername()).isPresent()) {
            return null; // Username đã tồn tại
        }
        // Gán role mặc định nếu chưa có
        if (req.getRole() == null || req.getRole().isEmpty()) {
            if (req.getUsername().equalsIgnoreCase("admin")) {
                req.setRole("admin");
            } else {
                req.setRole("customer"); // Mặc định là customer
            }
        }
        req.setId(null); // Đảm bảo id tự tăng
        return userRepo.save(req);
    }
}
