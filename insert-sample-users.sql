-- Insert sample users for testing
USE candy_shop_java;

-- Clear existing users (optional)
-- DELETE FROM users WHERE id > 1;

-- Insert sample users
INSERT INTO users (username, email, password, full_name, phone, address, role, status, role_id) VALUES
('admin_user', 'admin@example.com', 'password123', 'Quản trị viên', '0901111111', '123 Admin St', 'admin', 1, 1),
('staff_user', 'staff@example.com', 'password123', 'Nguyễn Văn A', '0912222222', '456 Staff St', 'staff', 1, 2),
('customer_user', 'customer@example.com', 'password123', 'Trần Thị B', '0933333333', '789 Customer St', 'customer', 1, 3),
('test_user', 'test@example.com', 'password123', 'Lê Văn C', '0944444444', '321 Test St', 'customer', 1, 3),
('inactive_user', 'inactive@example.com', 'password123', 'Phạm Thị D', '0955555555', '654 Inactive St', 'customer', 0, 3);

-- Verify
SELECT id, username, email, full_name, phone, role, status FROM users;
