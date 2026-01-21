-- Thêm cột phone vào bảng orders nếu chưa có
ALTER TABLE orders ADD COLUMN phone VARCHAR(20) AFTER customer_name;

-- Tạo index để tối ưu tìm kiếm theo phone
ALTER TABLE orders ADD INDEX idx_phone (phone);

-- Xem cấu trúc bảng
DESCRIBE orders;
