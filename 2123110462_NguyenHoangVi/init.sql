-- ============================================================
-- DATABASE INITIALIZATION SCRIPT
-- ============================================================
-- Run this script to initialize the database from scratch

-- Drop database if exists
DROP DATABASE IF EXISTS `candy_shop_java`;

-- Create database
CREATE DATABASE `candy_shop_java` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `candy_shop_java`;

-- ============================================================
-- Create Tables
-- ============================================================

-- Categories table
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` int DEFAULT NULL,
  `updated_at` datetime(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKnlbhvhf7j5h1l2m3n4o5p6q7` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles table
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKg2da2ybazxk7xd82q5k1qks1` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Users table
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `status` int,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci,
  `reset_token` varchar(255) COLLATE utf8mb4_unicode_ci,
  `reset_token_expiry` bigint,
  `role_id` bigint,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKr43af9ap4de4z5gnhsuca60sw` (`email`),
  UNIQUE KEY `UKsb8bbouer5wak8vyiiy4pf2bx` (`username`),
  KEY `FKp56c1712k691lhsyewcssuser` (`role_id`),
  CONSTRAINT `FKp56c1712k691lhsyewcssuser` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products table
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` double,
  `quantity` int,
  `status` int,
  `stock_quantity` int,
  PRIMARY KEY (`id`),
  KEY `FKcd5ngw8wl4cvl42pf02cgm5xn` (`category_id`),
  CONSTRAINT `FKcd5ngw8wl4cvl42pf02cgm5xn` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory table
CREATE TABLE `inventory` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `quantity_in_stock` int NOT NULL,
  `reorder_level` int DEFAULT '10',
  `reorder_quantity` int DEFAULT '50',
  `last_restocked` datetime(6),
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'in_stock',
  `last_updated` datetime(6),
  `updated_reason` varchar(255) COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKj8kj7k8j7k8j7k8j7k8j7k8j7` (`product_id`),
  CONSTRAINT `FKq2yge7ebtfuvwufr6lwfwqy9l` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reviews table
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `customer_id` bigint NOT NULL,
  `rating` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `helpful_count` int DEFAULT '0',
  `unhelpful_count` int DEFAULT '0',
  `verified_purchase` bit(1) DEFAULT b'0',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6),
  PRIMARY KEY (`id`),
  KEY `FKpl51cejpw4gy5swfar8br9ngi` (`product_id`),
  KEY `FK4sm0k8kw740iyuex3vwwv1etu` (`customer_id`),
  CONSTRAINT `FK4sm0k8kw740iyuex3vwwv1etu` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKpl51cejpw4gy5swfar8br9ngi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Orders table
CREATE TABLE `orders` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `total_amount` double,
  `payment_method` varchar(100) COLLATE utf8mb4_unicode_ci,
  `shipping_address` varchar(500) COLLATE utf8mb4_unicode_ci,
  `order_date` datetime(6),
  `estimated_delivery` datetime(6),
  `actual_delivery` datetime(6),
  `notes` varchar(500) COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6),
  PRIMARY KEY (`id`),
  KEY `FKpxtb8awmi0dk6smta2jhx督鄄` (`customer_id`),
  CONSTRAINT `FKpxtb8awmi0dk6smta2jhx督鄄` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vouchers table
CREATE TABLE `vouchers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci,
  `discount_type` varchar(50) COLLATE utf8mb4_unicode_ci,
  `discount_value` double,
  `min_order_amount` double DEFAULT '0',
  `max_uses` int,
  `used_count` int DEFAULT '0',
  `start_date` datetime(6),
  `end_date` datetime(6),
  `is_active` bit(1) DEFAULT b'1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKvoucher_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Promotions table
CREATE TABLE `promotions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci,
  `discount_type` varchar(50) COLLATE utf8mb4_unicode_ci,
  `discount_value` double,
  `start_date` datetime(6),
  `end_date` datetime(6),
  `is_active` bit(1) DEFAULT b'1',
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customers table
CREATE TABLE `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6),
  PRIMARY KEY (`id`),
  KEY `FKcustomer_user` (`user_id`),
  CONSTRAINT `FKcustomer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Insert Sample Data
-- ============================================================

-- Insert default roles
INSERT INTO `roles` (`name`, `created_at`) VALUES
('ADMIN', NOW()),
('USER', NOW()),
('CUSTOMER', NOW());

-- Insert default categories
INSERT INTO `categories` (`name`, `description`, `status`, `created_at`) VALUES
('Electronics', 'Electronic products', 1, NOW()),
('Clothing', 'Clothing items', 1, NOW()),
('Books', 'Books and literature', 1, NOW());

-- Insert sample products
INSERT INTO `products` (`name`, `description`, `price`, `quantity`, `stock_quantity`, `category_id`, `status`, `created_at`) VALUES
('Laptop', 'High-performance laptop', 1000, 50, 50, 1, 1, NOW()),
('Shirt', 'Comfortable cotton shirt', 30, 100, 100, 2, 1, NOW()),
('Programming Book', 'Learn to code', 50, 25, 25, 3, 1, NOW());

-- Insert admin user
INSERT INTO `users` (`username`, `email`, `password`, `full_name`, `phone`, `status`, `role`, `created_at`) VALUES
('admin', 'admin@example.com', '$2a$10$slYQmyNdGzin7olVN3p5OPST9/PgBkqquzi8Aml3UCXbVxtrq2C1m', 'Admin User', '0123456789', 1, 'ADMIN', NOW());

-- ============================================================
-- Verify Tables
-- ============================================================
SHOW TABLES;
SELECT COUNT(*) as 'Total Categories' FROM categories;
SELECT COUNT(*) as 'Total Users' FROM users;
SELECT COUNT(*) as 'Total Products' FROM products;
