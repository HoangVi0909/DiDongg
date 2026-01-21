package com.example.__NguyenHoangVi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.__NguyenHoangVi.entity.User;
import com.example.__NguyenHoangVi.repository.UserRepository;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private EmailService emailService;

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
                req.setRoleId(2L); // Admin role ID
            } else {
                req.setRole("customer"); // Mặc định là customer
                req.setRoleId(1L); // Customer role ID
            }
        } else {
            // Gán roleId dựa trên role string
            if (req.getRole().equalsIgnoreCase("admin")) {
                req.setRoleId(2L);
            } else {
                req.setRoleId(1L);
            }
        }
        req.setId(null); // Đảm bảo id tự tăng
        return userRepo.save(req);
    }

    // Forget Password: Gửi mã reset qua email
    public String forgotPassword(String email) {
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) {
            return null; // Email không tồn tại
        }

        User user = userOpt.get();
        // ✅ Generate mã 6 số
        String resetToken = String.format("%06d", new java.util.Random().nextInt(1000000));
        long expiryTime = System.currentTimeMillis() + (15 * 60 * 1000); // 15 phút

        user.setResetToken(resetToken);
        user.setResetTokenExpiry(expiryTime);
        userRepo.save(user);

        // Gửi email
        emailService.sendResetPasswordEmail(email, resetToken);

        System.out.println("✅ MÃ XÁC NHẬN (6 số): " + resetToken);
        return "Mã xác nhận đã được gửi đến email của bạn";
    }

    // Verify reset token và đổi mật khẩu
    public String verifyResetToken(String resetToken) {
        Optional<User> userOpt = userRepo.findByResetToken(resetToken);
        if (userOpt.isEmpty()) {
            return "Token không hợp lệ";
        }

        User user = userOpt.get();

        // Kiểm tra hết hạn
        if (user.getResetTokenExpiry() == null || System.currentTimeMillis() > user.getResetTokenExpiry()) {
            return "Token đã hết hạn";
        }

        return "Token hợp lệ"; // Token valid
    }

    public String resetPassword(String resetToken, String newPassword) {
        Optional<User> userOpt = userRepo.findByResetToken(resetToken);
        if (userOpt.isEmpty()) {
            return "Token không hợp lệ";
        }

        User user = userOpt.get();

        // Kiểm tra hết hạn
        if (user.getResetTokenExpiry() == null || System.currentTimeMillis() > user.getResetTokenExpiry()) {
            return "Token đã hết hạn";
        }

        // Đổi mật khẩu
        user.setPassword(newPassword);
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepo.save(user);

        return "Mật khẩu đã được đổi thành công";
    }
}
