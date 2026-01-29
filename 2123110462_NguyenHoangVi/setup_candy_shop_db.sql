-- ============================================
-- Fresh Database Creation Script
-- Database Name: candy_shop_db (New Database)
-- ============================================

-- Create new database with proper charset
CREATE DATABASE IF NOT EXISTS candy_shop_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE candy_shop_db;

-- ============================================
-- Create Tables
-- ============================================

-- Roles table
CREATE TABLE roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table
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
  reset_token VARCHAR(255),
  reset_token_expiry BIGINT,
  role_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories table
CREATE TABLE categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(500),
  status INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
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
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory table
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
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews table
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
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DOUBLE NOT NULL DEFAULT 0,
  payment_method VARCHAR(100),
  shipping_address VARCHAR(500),
  notes VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vouchers table
CREATE TABLE vouchers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(500),
  discount_type VARCHAR(50),
  discount_value DOUBLE NOT NULL,
  min_order_amount DOUBLE DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Promotions table
CREATE TABLE promotions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  discount_type VARCHAR(50),
  discount_value DOUBLE NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customers table
CREATE TABLE customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
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
  ('Electronics', 'Electronic products and gadgets', 1),
  ('Clothing', 'Apparel and fashion items', 1),
  ('Books', 'Books and educational materials', 1),
  ('Food', 'Food and beverage items', 1),
  ('Home', 'Home and garden products', 1);

-- Insert products
INSERT INTO products (name, description, price, quantity, stock_quantity, category_id, status) VALUES 
  ('Laptop Dell XPS 13', 'High-performance laptop with 13-inch display, Intel i7 processor, 16GB RAM', 1200.00, 50, 50, 1, 1),
  ('iPhone 15 Pro', 'Latest smartphone with advanced camera system and A17 Pro chip', 1000.00, 30, 30, 1, 1),
  ('Cotton T-Shirt', 'Comfortable and durable 100% cotton t-shirt', 25.00, 200, 200, 2, 1),
  ('Programming in Python', 'Complete guide to Python programming for beginners', 45.00, 100, 100, 3, 1),
  ('Organic Coffee Beans', 'Premium organic coffee beans from Colombia', 15.00, 150, 150, 4, 1);

-- Insert inventory
INSERT INTO inventory (product_id, quantity_in_stock, reorder_level, reorder_quantity, status) VALUES 
  (1, 50, 10, 20, 'in_stock'),
  (2, 30, 5, 15, 'in_stock'),
  (3, 200, 20, 50, 'in_stock'),
  (4, 100, 15, 30, 'in_stock'),
  (5, 150, 25, 50, 'in_stock');

-- Insert admin user (password: admin123 - bcrypt hashed)
INSERT INTO users (username, email, password, full_name, phone, status, role) VALUES 
  ('admin', 'admin@candyshop.com', '$2a$10$slYQmyNdGzin7olVN3p5OPST9/PgBkqquzi8Aml3UCXbVxtrq2C1m', 'Admin User', '0123456789', 1, 'ADMIN');

-- Insert sample customer user (password: customer123)
INSERT INTO users (username, email, password, full_name, phone, status, role) VALUES 
  ('customer1', 'customer1@example.com', '$2a$10$YTj1SFlJdPG8DqH1.PkVKO9OphLU.zOLZPt/l.1o7vkzN8Ml1hKVG', 'John Doe', '0987654321', 1, 'CUSTOMER');

-- Insert sample promotions
INSERT INTO promotions (name, description, discount_type, discount_value, is_active) VALUES 
  ('New Year Sale', '20% off on all products', 'percentage', 20, 1),
  ('Spring Special', '15% discount on electronics', 'percentage', 15, 1);

-- Insert sample vouchers
INSERT INTO vouchers (code, description, discount_type, discount_value, min_order_amount, max_uses, is_active) VALUES 
  ('WELCOME20', 'Welcome voucher - 20% off', 'percentage', 20, 50, 100, 1),
  ('SAVE50', 'Save $50 on orders over $200', 'fixed', 50, 200, 50, 1);

-- ============================================
-- Verification Queries
-- ============================================

-- Show all tables
SHOW TABLES;

-- Verify data
SELECT 'Users' as table_name, COUNT(*) as total FROM users
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Roles', COUNT(*) FROM roles
UNION ALL
SELECT 'Vouchers', COUNT(*) FROM vouchers
UNION ALL
SELECT 'Promotions', COUNT(*) FROM promotions;
