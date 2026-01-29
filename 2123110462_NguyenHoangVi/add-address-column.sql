-- Thêm cột address vào bảng orders nếu chưa có
ALTER TABLE orders ADD COLUMN address TEXT;

-- Thêm các cột khác nếu chưa có
ALTER TABLE orders ADD COLUMN order_channel VARCHAR(50);
ALTER TABLE orders ADD COLUMN transaction_code VARCHAR(255);

-- Kiểm tra
SELECT * FROM orders LIMIT 1;
