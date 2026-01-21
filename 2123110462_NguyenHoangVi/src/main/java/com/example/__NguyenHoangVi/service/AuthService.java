package com.example.__NguyenHoangVi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.__NguyenHoangVi.entity.User;
import com.example.__NguyenHoangVi.repository.UserRepository;

import java.util.Optional;
import java.util.regex.Pattern;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private EmailService emailService;

    // Regex patterns for validation
    private static final String USERNAME_PATTERN = "^[a-zA-Z0-9_]{3,20}$"; // 3-20 ký tự, chữ/số/underscore
    private static final String EMAIL_PATTERN = "^[A-Za-z0-9+_.-]+@(.+)$"; // Email format
    private static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,}$"; // Min 6 chars, có chữ hoa,
                                                                                             // chữ thường, số

    /**
     * Validate username format
     */
    public String validateUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return "Tên đăng nhập không được để trống";
        }
        username = username.trim();

        if (!Pattern.matches(USERNAME_PATTERN, username)) {
            return "Tên đăng nhập phải 3-20 ký tự (chữ, số, dấu gạch dưới)";
        }

        if (userRepo.findByUsername(username).isPresent()) {
            return "Tên đăng nhập đã tồn tại";
        }

        return null; // Valid
    }

    /**
     * Validate email format
     */
    public String validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return "Email không được để trống";
        }
        email = email.trim();

        if (!Pattern.matches(EMAIL_PATTERN, email)) {
            return "Email không hợp lệ";
        }

        if (userRepo.findByEmail(email).isPresent()) {
            return "Email đã tồn tại trong hệ thống";
        }

        return null; // Valid
    }

    /**
     * Validate password strength
     */
    public String validatePassword(String password) {
        if (password == null || password.isEmpty()) {
            return "Mật khẩu không được để trống";
        }

        if (password.length() < 6) {
            return "Mật khẩu phải có ít nhất 6 ký tự";
        }

        if (!Pattern.matches(PASSWORD_PATTERN, password)) {
            return "Mật khẩu phải có chữ hoa, chữ thường và số";
        }

        return null; // Valid
    }

    /**
     * Validate full name
     */
    public String validateFullName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return "Họ và tên không được để trống";
        }

        fullName = fullName.trim();
        if (fullName.length() < 2) {
            return "Họ và tên phải có ít nhất 2 ký tự";
        }

        if (fullName.length() > 100) {
            return "Họ và tên không được vượt quá 100 ký tự";
        }

        return null; // Valid
    }

    public User login(String username, String password) {
        // Validate inputs
        if (username == null || username.trim().isEmpty()) {
            return null;
        }
        if (password == null || password.isEmpty()) {
            return null;
        }

        return userRepo.findByUsername(username.trim())
                .filter(u -> u.getPassword().equals(password))
                .orElse(null);
    }

    public User register(User req) {
        // Validate username
        String usernameError = validateUsername(req.getUsername());
        if (usernameError != null) {
            System.out.println("❌ Username validation error: " + usernameError);
            throw new IllegalArgumentException(usernameError);
        }

        // Validate email
        String emailError = validateEmail(req.getEmail());
        if (emailError != null) {
            System.out.println("❌ Email validation error: " + emailError);
            throw new IllegalArgumentException(emailError);
        }

        // Validate password
        String passwordError = validatePassword(req.getPassword());
        if (passwordError != null) {
            System.out.println("❌ Password validation error: " + passwordError);
            throw new IllegalArgumentException(passwordError);
        }

        // Validate full name
        String fullNameError = validateFullName(req.getFullName());
        if (fullNameError != null) {
            System.out.println("❌ Full name validation error: " + fullNameError);
            throw new IllegalArgumentException(fullNameError);
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
        System.out.println("✅ User registered: " + req.getUsername() + " (" + req.getEmail() + ")");
        return userRepo.save(req);
    }

    // Forget Password: Gửi mã reset qua email
    public String forgotPassword(String email) {
        if (email == null || email.trim().isEmpty()) {
            return null;
        }

        Optional<User> userOpt = userRepo.findByEmail(email.trim());
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

        // Validate new password
        String passwordError = validatePassword(newPassword);
        if (passwordError != null) {
            return passwordError;
        }

        // Đổi mật khẩu
        user.setPassword(newPassword);
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepo.save(user);

        System.out.println("✅ Password reset for user: " + user.getUsername());
        return "Mật khẩu đã được đổi thành công";
    }
}
