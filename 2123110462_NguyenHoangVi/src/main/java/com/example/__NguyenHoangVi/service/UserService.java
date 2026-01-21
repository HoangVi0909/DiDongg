package com.example.__NguyenHoangVi.service;

import com.example.__NguyenHoangVi.entity.User;
import com.example.__NguyenHoangVi.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Lấy tất cả users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Lấy user theo ID
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Lấy user theo email
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Lấy user theo username
     */
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Tạo user mới
     */
    public User createUser(User userRequest) throws Exception {
        // Validate email
        if (userRequest.getEmail() == null || userRequest.getEmail().isEmpty()) {
            throw new Exception("Email is required");
        }

        // Check if email already exists
        Optional<User> existingUser = userRepository.findByEmail(userRequest.getEmail());
        if (existingUser.isPresent()) {
            throw new Exception("Email already exists");
        }

        // Create new user
        User newUser = new User();
        newUser.setUsername(userRequest.getUsername() != null ? userRequest.getUsername() : userRequest.getEmail());
        newUser.setEmail(userRequest.getEmail());
        newUser.setPhone(userRequest.getPhone());
        newUser.setFullName(userRequest.getFullName());
        newUser.setAddress(userRequest.getAddress());
        newUser.setRole(userRequest.getRole() != null ? userRequest.getRole() : "customer");
        newUser.setStatus(userRequest.getStatus() != null ? userRequest.getStatus() : 1); // 1 = active
        newUser.setPassword(userRequest.getPassword() != null ? userRequest.getPassword() : "password123"); // Default
                                                                                                            // password

        return userRepository.save(newUser);
    }

    /**
     * Cập nhật user
     */
    public User updateUser(Long id, User userRequest) throws Exception {
        Optional<User> existingUser = userRepository.findById(id);

        if (!existingUser.isPresent()) {
            throw new Exception("User not found");
        }

        User user = existingUser.get();

        // Cập nhật các trường được phép
        if (userRequest.getFullName() != null && !userRequest.getFullName().isEmpty()) {
            user.setFullName(userRequest.getFullName());
        }
        if (userRequest.getEmail() != null && !userRequest.getEmail().isEmpty()) {
            // Check if email is already used by another user
            Optional<User> emailCheck = userRepository.findByEmail(userRequest.getEmail());
            if (emailCheck.isPresent() && !emailCheck.get().getId().equals(id)) {
                throw new Exception("Email already in use");
            }
            user.setEmail(userRequest.getEmail());
        }
        if (userRequest.getPhone() != null && !userRequest.getPhone().isEmpty()) {
            user.setPhone(userRequest.getPhone());
        }
        if (userRequest.getAddress() != null) {
            user.setAddress(userRequest.getAddress());
        }
        if (userRequest.getRole() != null && !userRequest.getRole().isEmpty()) {
            user.setRole(userRequest.getRole());
        }
        if (userRequest.getStatus() != null) {
            user.setStatus(userRequest.getStatus());
        }

        return userRepository.save(user);
    }

    /**
     * Xóa user
     */
    public void deleteUser(Long id) throws Exception {
        Optional<User> user = userRepository.findById(id);
        if (!user.isPresent()) {
            throw new Exception("User not found");
        }
        userRepository.deleteById(id);
    }

    /**
     * Đổi mật khẩu
     */
    public void changePassword(Long id, String oldPassword, String newPassword) throws Exception {
        Optional<User> existingUser = userRepository.findById(id);

        if (!existingUser.isPresent()) {
            throw new Exception("User not found");
        }

        User user = existingUser.get();

        // Kiểm tra mật khẩu cũ
        if (!user.getPassword().equals(oldPassword)) {
            throw new Exception("Old password is incorrect");
        }

        // Cập nhật mật khẩu mới
        user.setPassword(newPassword);
        userRepository.save(user);
    }

    /**
     * Kiểm tra email đã tồn tại hay chưa
     */
    public boolean emailExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    /**
     * Kiểm tra username đã tồn tại hay chưa
     */
    public boolean usernameExists(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    /**
     * Kích hoạt/Vô hiệu hóa user
     */
    public User toggleUserStatus(Long id) throws Exception {
        Optional<User> existingUser = userRepository.findById(id);

        if (!existingUser.isPresent()) {
            throw new Exception("User not found");
        }

        User user = existingUser.get();
        // Toggle status: 1 = active, 0 = inactive
        user.setStatus(user.getStatus() == 1 ? 0 : 1);

        return userRepository.save(user);
    }
}
