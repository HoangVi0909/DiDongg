# 🎟️ Hướng dẫn Quản Lý Voucher - Admin

## ✅ Hoàn Thiện

**Backend (Spring Boot - localhost:8080):**

- ✅ Voucher Entity - Model dữ liệu
- ✅ VoucherRepository - Database access
- ✅ VoucherController - REST API endpoints

**Frontend (React Native - localhost:8081):**

- ✅ AdminVouchersScreen.tsx - Giao diện admin quản lý voucher
- ✅ AdminVoucherContext.tsx - Updated (call backend API)
- ✅ VoucherContext.tsx - Updated (validateVoucher method)

---

## 🧪 Cách Test

### Bước 1: Admin Tạo Voucher

1. Truy cập Admin Dashboard
2. Click menu **"Quản lý voucher"** (🎟️)
3. Click **"+ Thêm Voucher"**
4. Điền form:
   - **Mã voucher**: "SALE2025" (phải unique)
   - **Giảm**: 15
   - **Loại**: percent (%)
   - **Mô tả**: "Giảm 15% cho tất cả sản phẩm"
   - **Ngày hết hạn**: "2025-12-31"
   - **Đơn tối thiểu**: 100000 (optional)
   - **Lượt tối đa**: 100 (optional)
5. Click **"Lưu"**

### Bước 2: Admin Quản Lý Voucher

- **Chỉnh sửa**: Chọn voucher → Edit → Cập nhật → Lưu
- **Vô hiệu hóa**: Toggle switch để bật/tắt
- **Xóa**: Click delete → Xác nhận
- **Xem chi tiết**: Voucher card hiển thị mã, giảm, lượt dùng

### Bước 3: User Sử Dụng Voucher

1. Đi tới Checkout
2. Click **"Nhập mã voucher"**
3. Nhập: "SALE2025"
4. Hệ thống validate:
   - ✅ Voucher có tồn tại?
   - ✅ Voucher còn hoạt động?
   - ✅ Voucher chưa hết hạn?
   - ✅ Chưa vượt lượt tối đa?
   - ✅ Đơn hàng >= đơn tối thiểu?
5. Nếu hợp lệ → Hiển thị discount
6. Click **"Áp dụng"** → Tính toán giá cuối cùng

---

## 📋 API Endpoints

### 1. Lấy Tất Cả Vouchers

```bash
GET http://localhost:8080/api/vouchers

Response:
[
  {
    "id": 1,
    "code": "SALE2025",
    "discount": 15,
    "type": "percent",
    "description": "Giảm 15% cho tất cả sản phẩm",
    "expiryDate": "2025-12-31",
    "minOrder": 100000,
    "maxUse": 100,
    "usedCount": 25,
    "isActive": true
  }
]
```

### 2. Lấy Vouchers Còn Hoạt Động

```bash
GET http://localhost:8080/api/vouchers/active
```

### 3. Lấy Voucher Theo ID

```bash
GET http://localhost:8080/api/vouchers/{id}
```

### 4. Lấy Voucher Theo Mã

```bash
GET http://localhost:8080/api/vouchers/code/{code}
```

### 5. Validate Voucher

```bash
GET http://localhost:8080/api/vouchers/{code}/validate?totalAmount=500000

Response:
{
  "valid": true,
  "message": "Voucher hợp lệ",
  "discount": 75000,
  "type": "percent",
  "discountValue": 15
}
```

### 6. Tạo Voucher (Admin)

```bash
POST http://localhost:8080/api/vouchers

Body:
{
  "code": "SALE2025",
  "discount": 15,
  "type": "percent",
  "description": "Giảm 15%",
  "expiryDate": "2025-12-31",
  "minOrder": 100000,
  "maxUse": 100
}

Response:
{
  "id": 1,
  "code": "SALE2025",
  ... (full voucher object)
}
```

### 7. Cập Nhật Voucher (Admin)

```bash
PUT http://localhost:8080/api/vouchers/{id}

Body:
{
  "discount": 20,
  "isActive": true
  ... (chỉ cần fields cần thay đổi)
}
```

### 8. Xóa Voucher (Admin)

```bash
DELETE http://localhost:8080/api/vouchers/{id}

Response:
{
  "message": "Xóa voucher thành công"
}
```

### 9. Bật/Tắt Voucher (Admin)

```bash
PUT http://localhost:8080/api/vouchers/{id}/toggle

Response:
{
  "id": 1,
  "isActive": false,
  ... (full voucher object)
}
```

---

## 🎯 Loại Voucher

### Percent (%)

- **Giảm**: 15
- **Tính toán**: `totalAmount * 15 / 100`
- **Ví dụ**: Đơn 500k → Giảm 75k

### Fixed (Cố định)

- **Giảm**: 50000
- **Tính toán**: Cầm trừ `50000` VND
- **Ví dụ**: Đơn 500k → Giảm 50k

---

## 📊 Trường Dữ Liệu

| Trường      | Kiểu    | Yêu cầu | Ghi chú                         |
| ----------- | ------- | ------- | ------------------------------- |
| code        | String  | ✅      | Unique, uppercase               |
| discount    | Double  | ✅      | > 0                             |
| type        | String  | ✅      | percent / fixed                 |
| description | Text    | ❌      | Mô tả chi tiết                  |
| expiryDate  | String  | ✅      | Format: YYYY-MM-DD              |
| minOrder    | Integer | ❌      | Đơn tối thiểu (VND)             |
| maxUse      | Integer | ❌      | Lượt sử dụng tối đa             |
| usedCount   | Integer | ❌      | Lượt đã sử dụng (default: 0)    |
| isActive    | Boolean | ❌      | Active/Inactive (default: true) |

---

## 🐛 Validation Rules

✅ **Admin Create/Update:**

- Mã voucher không được trống
- Giảm phải > 0
- Type phải là "percent" hoặc "fixed"
- Mã phải unique (khi create)

✅ **User Validate (Checkout):**

- Voucher phải tồn tại
- Voucher phải active (isActive = true)
- Ngày hết hạn phải > ngày hôm nay
- Lượt dùng < lượt tối đa (nếu có)
- Tổng đơn hàng >= đơn tối thiểu (nếu có)

---

## 📁 Files Được Sửa/Tạo

**Backend:**

- `Voucher.java` - NEW (Entity)
- `VoucherRepository.java` - NEW (Repository)
- `VoucherController.java` - NEW (Controller)

**Frontend:**

- `AdminVouchersScreen.tsx` - Existing (no changes)
- `AdminVoucherContext.tsx` - UPDATED (call API)
- `VoucherContext.tsx` - UPDATED (validateVoucher)

---

## 🚀 Tương Lai

- [ ] **Usage Tracking**: Tự động tăng usedCount khi checkout
- [ ] **Discount History**: Lưu lịch sử sử dụng voucher
- [ ] **Bulk Import**: Import vouchers từ CSV
- [ ] **Analytics**: Thống kê voucher được sử dụng nhiều nhất
- [ ] **Scheduled**: Lên lịch auto-disable hết hạn

---

**Status: ✅ READY FOR TESTING**
