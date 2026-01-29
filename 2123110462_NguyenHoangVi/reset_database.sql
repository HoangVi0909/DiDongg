-- Reset Database Script
-- Drop and recreate candy_shop_java database

DROP DATABASE IF EXISTS candy_shop_java;
CREATE DATABASE candy_shop_java CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE candy_shop_java;

-- Create roles table
CREATE TABLE roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create users table
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
  FOREIGN KEY(role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create categories table
CREATE TABLE categories (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  status INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create products table
CREATE TABLE products (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description LONGTEXT,
  price DOUBLE,
  quantity INT,
  stock_quantity INT,
  image VARCHAR(255),
  category_id BIGINT,
  status INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create inventory table
CREATE TABLE inventory (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNIQUE NOT NULL,
  quantity_in_stock INT NOT NULL,
  reorder_level INT DEFAULT 10,
  reorder_quantity INT DEFAULT 50,
  status VARCHAR(50) DEFAULT 'in_stock',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_reason VARCHAR(255),
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create reviews table
CREATE TABLE reviews (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT NOT NULL,
  customer_id BIGINT NOT NULL,
  rating INT NOT NULL,
  title VARCHAR(255),
  content LONGTEXT,
  helpful_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY(customer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create orders table
CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DOUBLE,
  payment_method VARCHAR(100),
  shipping_address VARCHAR(500),
  notes VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create vouchers table
CREATE TABLE vouchers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  discount_type VARCHAR(50),
  discount_value DOUBLE,
  min_order_amount DOUBLE DEFAULT 0,
  max_uses INT,
  used_count INT DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create promotions table
CREATE TABLE promotions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500),
  discount_type VARCHAR(50),
  discount_value DOUBLE,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create customers table
CREATE TABLE customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default roles
INSERT INTO roles (name) VALUES 
  ('ADMIN'),
  ('USER'),
  ('CUSTOMER');

-- Insert default categories
INSERT INTO categories (name, description, status) VALUES 
  ('Electronics', 'Electronic products and gadgets', 1),
  ('Clothing', 'Apparel and fashion items', 1),
  ('Books', 'Books and educational materials', 1),
  ('Food', 'Food and beverage items', 1),
  ('Home', 'Home and garden products', 1);

-- Insert sample products
INSERT INTO products (name, description, price, quantity, stock_quantity, category_id, status) VALUES 
  ('Laptop Dell XPS 13', 'High-performance laptop with 13-inch display', 1200.00, 50, 50, 1, 1),
  ('iPhone 15 Pro', 'Latest smartphone with advanced features', 1000.00, 30, 30, 1, 1),
  ('Cotton T-Shirt', 'Comfortable and durable cotton t-shirt', 25.00, 200, 200, 2, 1),
  ('Programming in Python', 'Complete guide to Python programming', 45.00, 100, 100, 3, 1),
  ('Organic Coffee Beans', 'Premium organic coffee beans', 15.00, 150, 150, 4, 1);

-- Insert inventory for products
INSERT INTO inventory (product_id, quantity_in_stock, reorder_level, reorder_quantity, status) VALUES 
  (1, 50, 10, 20, 'in_stock'),
  (2, 30, 5, 15, 'in_stock'),
  (3, 200, 20, 50, 'in_stock'),
  (4, 100, 15, 30, 'in_stock'),
  (5, 150, 25, 50, 'in_stock');

-- Insert default admin user (password: admin123 - bcrypt hashed)
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

-- Verify table creation
SHOW TABLES;
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as products_count FROM products;
SELECT COUNT(*) as categories_count FROM categories;

COMMIT;