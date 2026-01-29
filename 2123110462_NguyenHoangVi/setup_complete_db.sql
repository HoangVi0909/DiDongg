-- ============================================
-- Complete Database Creation Script
-- Database Name: candy_shop_db
-- ============================================

DROP DATABASE IF EXISTS candy_shop_db;
FLUSH PRIVILEGES;

CREATE DATABASE candy_shop_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE candy_shop_db;

-- ============================================
-- 1. Roles Table
-- ============================================
CREATE TABLE roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Users Table (with password reset fields)
-- ============================================
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  address VARCHAR(500),
  role VARCHAR(50),
  status INT DEFAULT 1,
  reset_token VARCHAR(500),
  reset_token_expiry BIGINT,
  role_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_reset_token (reset_token),
  FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Addresses Table (for shipping/billing)
-- ============================================
CREATE TABLE addresses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(100),
  is_default BOOLEAN DEFAULT FALSE,
  address_type VARCHAR(50), -- 'shipping' or 'billing'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Categories Table
-- ============================================
CREATE TABLE categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(500),
  status INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. Products Table
-- ============================================
CREATE TABLE products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description LONGTEXT,
  price DOUBLE NOT NULL,
  quantity INT DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  image VARCHAR(255),
  category_id BIGINT,
  status INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category_id),
  INDEX idx_name (name),
  INDEX idx_status (status),
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. Inventory Table (Stock Management)
-- ============================================
CREATE TABLE inventory (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL UNIQUE,
  quantity_in_stock INT NOT NULL DEFAULT 0,
  reorder_level INT DEFAULT 10,
  reorder_quantity INT DEFAULT 50,
  status VARCHAR(50) DEFAULT 'in_stock',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_reason VARCHAR(255),
  INDEX idx_product (product_id),
  INDEX idx_status (status),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. Reviews/Comments Table
-- ============================================
CREATE TABLE reviews (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content LONGTEXT,
  helpful_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_product (product_id),
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. Orders Table
-- ============================================
CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DOUBLE NOT NULL DEFAULT 0,
  payment_method VARCHAR(100),
  shipping_address VARCHAR(500),
  notes VARCHAR(500),
  tracking_number VARCHAR(100),
  estimated_delivery DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_tracking (tracking_number),
  FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. Order Items Table (Line Items)
-- ============================================
CREATE TABLE order_items (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  product_name VARCHAR(255),
  quantity INT NOT NULL,
  unit_price DOUBLE NOT NULL,
  total_price DOUBLE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id),
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. Vouchers Table
-- ============================================
CREATE TABLE vouchers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(500),
  discount_type VARCHAR(50), -- 'percentage' or 'fixed'
  discount_value DOUBLE NOT NULL,
  min_order_amount DOUBLE DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  start_date DATETIME,
  end_date DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. Promotions Table
-- ============================================
CREATE TABLE promotions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  discount_type VARCHAR(50), -- 'percentage' or 'fixed'
  discount_value DOUBLE NOT NULL,
  start_date DATETIME,
  end_date DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. Customers Table
-- ============================================
CREATE TABLE customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. Notifications Table
-- ============================================
CREATE TABLE notifications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message LONGTEXT,
  type VARCHAR(50), -- 'order_update', 'promotion', 'comment_reply', etc
  related_id BIGINT, -- order_id, review_id, etc
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_type (type),
  INDEX idx_read (is_read),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 14. Favorites/Wishlist Table
-- ============================================
CREATE TABLE favorites (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product (user_id, product_id),
  INDEX idx_user (user_id),
  INDEX idx_product (product_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 15. Activity Log Table
-- ============================================
CREATE TABLE activity_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100), -- 'Product', 'Order', 'User', etc
  entity_id BIGINT,
  description LONGTEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_date (created_at),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Initial Data
-- ============================================

-- Insert roles
INSERT INTO roles (name) VALUES 
  ('ADMIN'),
  ('USER'),
  ('CUSTOMER');

-- Insert categories
INSERT INTO categories (name, description, status) VALUES 
  ('Bánh ngọt', 'Các loại bánh ngọt tươi ngon', 1),
  ('Kẹo', 'Kẹo các loại - thơm ngon lạ miệng', 1),
  ('Bánh mặn', 'Bánh mặn - bánh quy', 1),
  ('Chocolate', 'Chocolate cao cấp từ các nước', 1),
  ('Nước uống', 'Nước giải khát, nước trái cây', 1);

-- Insert products
INSERT INTO products (name, description, price, quantity, stock_quantity, category_id, status) VALUES 
  ('Bánh Tiramisu', 'Bánh Tiramisu tươi mềm, vị cà phê đậm', 150000.00, 50, 50, 1, 1),
  ('Bánh Chocolate Cake', 'Bánh chocolate đen thơm ngon', 120000.00, 40, 40, 1, 1),
  ('Kẹo Mút Đủ Vị', 'Kẹo mút 50 cái đủ các vị hương khác nhau', 85000.00, 100, 100, 2, 1),
  ('Bánh Quy Bơ Tươi', 'Bánh quy bơ tươi giòn tan', 75000.00, 150, 150, 3, 1),
  ('Chocolate Belg Cao Cấp', 'Chocolate nhập khẩu từ Bỉ', 250000.00, 30, 30, 4, 1),
  ('Nước Cam Tươi', 'Nước cam tươi ép hàng ngày', 35000.00, 80, 80, 5, 1),
  ('Bánh Cheesecake Đã Đông', 'Bánh cheesecake mặn và ngon lành', 180000.00, 25, 25, 1, 1),
  ('Kẹo Dẻo Hoa Quả', 'Kẹo dẻo vị hoa quả tự nhiên 200g', 45000.00, 120, 120, 2, 1);

-- Insert inventory
INSERT INTO inventory (product_id, quantity_in_stock, reorder_level, reorder_quantity, status) VALUES 
  (1, 50, 10, 20, 'in_stock'),
  (2, 40, 8, 15, 'in_stock'),
  (3, 100, 15, 40, 'in_stock'),
  (4, 150, 20, 50, 'in_stock'),
  (5, 30, 5, 10, 'in_stock'),
  (6, 80, 10, 30, 'in_stock'),
  (7, 25, 5, 10, 'in_stock'),
  (8, 120, 20, 50, 'in_stock');

-- Insert admin user (password: admin123 - bcrypt hashed)
-- To generate: $2a$10$slYQmyNdGzin7olVN3p5OPST9/PgBkqquzi8Aml3UCXbVxtrq2C1m
INSERT INTO users (username, email, password, full_name, phone, status, role) VALUES 
  ('admin', 'admin@candyshop.com', '$2a$10$slYQmyNdGzin7olVN3p5OPST9/PgBkqquzi8Aml3UCXbVxtrq2C1m', 'Admin User', '0123456789', 1, 'ADMIN');

-- Insert sample customer user (password: customer123)
-- To generate: $2a$10$YTj1SFlJdPG8DqH1.PkVKO9OphLU.zOLZPt/l.1o7vkzN8Ml1hKVG
INSERT INTO users (username, email, password, full_name, phone, status, role) VALUES 
  ('customer1', 'customer1@example.com', '$2a$10$YTj1SFlJdPG8DqH1.PkVKO9OphLU.zOLZPt/l.1o7vkzN8Ml1hKVG', 'John Doe', '0987654321', 1, 'CUSTOMER');

-- Insert sample addresses
INSERT INTO addresses (user_id, address_line_1, city, province, postal_code, country, is_default, address_type) VALUES 
  (2, '123 Main Street', 'Ho Chi Minh City', 'HCMC', '700000', 'Vietnam', TRUE, 'shipping'),
  (2, '456 Business Ave', 'Hanoi', 'Hanoi', '100000', 'Vietnam', FALSE, 'billing');

-- Insert sample promotions
INSERT INTO promotions (name, description, discount_type, discount_value, is_active) VALUES 
  ('Khuyến Mại Tết', 'Giảm 20% tất cả sản phẩm bánh kẹo', 'percentage', 20, 1),
  ('Ưu Đãi Mua 2 Tặng 1', 'Mua 2 bánh, tặng 1 kẹo miễn phí', 'percentage', 15, 1),
  ('Flash Sale Hè', 'Giảm 30% kẹo - hạn chế', 'percentage', 30, 1);

-- Insert sample vouchers
INSERT INTO vouchers (code, description, discount_type, discount_value, min_order_amount, max_uses, is_active) VALUES 
  ('SWEETCANDY20', 'Voucher chào mừng - Giảm 20%', 'percentage', 20, 100000, 100, 1),
  ('CANDY50K', 'Giảm 50.000 đ cho đơn từ 200.000 đ', 'fixed', 50000, 200000, 50, 1),
  ('SUMMER30', 'Hè vui vẻ - Giảm 30%', 'percentage', 30, 150000, 200, 1);

-- Insert sample order
INSERT INTO orders (customer_id, status, total_amount, payment_method, shipping_address) VALUES 
  (2, 'pending', 385000.00, 'credit_card', '123 Main Street, Ho Chi Minh City');

-- Insert order items
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES 
  (1, 1, 'Bánh Tiramisu', 1, 150000.00, 150000.00),
  (1, 3, 'Kẹo Mút Đủ Vị', 2, 85000.00, 170000.00),
  (1, 6, 'Nước Cam Tươi', 1, 35000.00, 35000.00);

-- Insert sample reviews
INSERT INTO reviews (product_id, customer_id, rating, title, content, verified_purchase, status) VALUES 
  (1, 2, 5, 'Bánh ngon tuyệt vời!', 'Bánh Tiramisu cực ngon, thơm mùi cà phê, mềm mại. Rất hài lòng.', TRUE, 'approved'),
  (3, 2, 5, 'Kẹo chất lượng, vị hay', 'Kẹo mút rất ngon, đủ vị. Giá cũng hợp lý.', TRUE, 'approved'),
  (2, 2, 4, 'Chocolate cake tốt', 'Bánh chocolate ngon, chỉ có điều giao hơi lâu', TRUE, 'approved');

-- Insert sample favorites
INSERT INTO favorites (user_id, product_id) VALUES 
  (2, 4),
  (2, 5),
  (2, 7);

-- ============================================
-- Verification Queries
-- ============================================

-- Show all tables
SHOW TABLES;

-- Verify data
SELECT 'Roles' as table_name, COUNT(*) as total FROM roles
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Vouchers', COUNT(*) FROM vouchers
UNION ALL
SELECT 'Promotions', COUNT(*) FROM promotions
UNION ALL
SELECT 'Addresses', COUNT(*) FROM addresses
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Favorites', COUNT(*) FROM favorites
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'OrderItems', COUNT(*) FROM order_items;

-- Show database info
SELECT DATABASE() as current_database;
SHOW CREATE DATABASE candy_shop_db;
