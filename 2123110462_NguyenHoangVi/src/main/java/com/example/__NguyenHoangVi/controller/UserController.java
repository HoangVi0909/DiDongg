package com.example.__NguyenHoangVi.controller;

import com.example.__NguyenHoangVi.entity.User;
import com.example.__NguyenHoangVi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // GET /api/users/{id} - Lấy thông tin user
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.status(404).body("User not found");
    }

    // PUT /api/users/{id} - Cập nhật thông tin user
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userRequest) {
        Optional<User> existingUser = userRepository.findById(id);

        if (!existingUser.isPresent()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = existingUser.get();

        // Cập nhật các trường được phép
        if (userRequest.getFullName() != null) {
            user.setFullName(userRequest.getFullName());
        }
        if (userRequest.getEmail() != null) {
            user.setEmail(userRequest.getEmail());
        }
        if (userRequest.getPhone() != null) {
            user.setPhone(userRequest.getPhone());
        }
        if (userRequest.getAddress() != null) {
            user.setAddress(userRequest.getAddress());
        }

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    // POST /api/users/{id}/change-password - Đổi mật khẩu
    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody PasswordChangeRequest request) {
        Optional<User> existingUser = userRepository.findById(id);

        if (!existingUser.isPresent()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = existingUser.get();

        // Kiểm tra mật khẩu cũ
        if (!user.getPassword().equals(request.getOldPassword())) {
            return ResponseEntity.status(400).body("Old password is incorrect");
        }

        // Cập nhật mật khẩu mới
        user.setPassword(request.getNewPassword());
        userRepository.save(user);

        return ResponseEntity.ok("Password changed successfully");
    }

    // Inner class cho request đổi mật khẩu
    public static class PasswordChangeRequest {
        private String oldPassword;
        private String newPassword;

        public String getOldPassword() {
            return oldPassword;
        }

        public void setOldPassword(String oldPassword) {
            this.oldPassword = oldPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}
