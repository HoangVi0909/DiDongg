# 📚 API Documentation - User Management (Quản lý Người dùng)

## 🌍 Base URL

```
http://localhost:8080/api/users
```

---

## 📋 User Model

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "fullName": "John Doe",
  "phone": "0987654321",
  "address": "123 Main St",
  "role": "customer",
  "status": 1,
  "password": "password123"
}
```

### Field Descriptions:

- **id** (Long): User ID (tự động sinh)
- **username** (String): Tên đăng nhập
- **email** (String): Email (duy nhất)
- **fullName** (String): Họ và tên
- **phone** (String): Số điện thoại
- **address** (String): Địa chỉ
- **role** (String): Quyền - `customer`, `staff`, `admin`
- **status** (Integer): Trạng thái - `1` (hoạt động), `0` (không hoạt động)
- **password** (String): Mật khẩu

---

## 🔗 API Endpoints

### 1️⃣ GET /api/users

**Lấy danh sách tất cả người dùng (Admin)**

**Method:** `GET`

**URL:** `http://localhost:8080/api/users`

**Headers:**

```
Content-Type: application/json
```

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@shop.com",
    "fullName": "Admin User",
    "phone": "0901111111",
    "address": "Admin Address",
    "role": "admin",
    "status": 1
  },
  {
    "id": 2,
    "username": "customer1",
    "email": "customer1@gmail.com",
    "fullName": "Nguyễn Văn A",
    "phone": "0912345678",
    "address": "123 Nguyễn Huệ",
    "role": "customer",
    "status": 1
  }
]
```

**Error Response (500):**

```json
{
  "error": "Error fetching users: [error message]"
}
```

---

### 2️⃣ POST /api/users

**Thêm người dùng mới (Admin)**

**Method:** `POST`

**URL:** `http://localhost:8080/api/users`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "username": "newuser",
  "email": "newuser@gmail.com",
  "fullName": "Người Dùng Mới",
  "phone": "0987654321",
  "address": "456 Lê Lợi",
  "role": "customer",
  "status": 1,
  "password": "password123"
}
```

**Response (200 OK):**

```json
{
  "id": 5,
  "username": "newuser",
  "email": "newuser@gmail.com",
  "fullName": "Người Dùng Mới",
  "phone": "0987654321",
  "address": "456 Lê Lợi",
  "role": "customer",
  "status": 1
}
```

**Error Response (400):**

```json
{
  "error": "Email already exists"
}
```

---

### 3️⃣ GET /api/users/{id}

**Lấy thông tin người dùng theo ID**

**Method:** `GET`

**URL:** `http://localhost:8080/api/users/2`

**Headers:**

```
Content-Type: application/json
```

**Response (200 OK):**

```json
{
  "id": 2,
  "username": "customer1",
  "email": "customer1@gmail.com",
  "fullName": "Nguyễn Văn A",
  "phone": "0912345678",
  "address": "123 Nguyễn Huệ",
  "role": "customer",
  "status": 1
}
```

**Error Response (404):**

```json
{
  "error": "User not found"
}
```

---

### 4️⃣ PUT /api/users/{id}

**Cập nhật thông tin người dùng (Admin)**

**Method:** `PUT`

**URL:** `http://localhost:8080/api/users/2`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "fullName": "Nguyễn Văn A Updated",
  "phone": "0923456789",
  "address": "456 Trần Hưng Đạo",
  "role": "staff",
  "status": 1
}
```

**Response (200 OK):**

```json
{
  "id": 2,
  "username": "customer1",
  "email": "customer1@gmail.com",
  "fullName": "Nguyễn Văn A Updated",
  "phone": "0923456789",
  "address": "456 Trần Hưng Đạo",
  "role": "staff",
  "status": 1
}
```

**Error Response (400):**

```json
{
  "error": "Email already in use"
}
```

**Error Response (404):**

```json
{
  "error": "User not found"
}
```

---

### 5️⃣ DELETE /api/users/{id}

**Xóa người dùng (Admin)**

**Method:** `DELETE`

**URL:** `http://localhost:8080/api/users/5`

**Headers:**

```
Content-Type: application/json
```

**Response (200 OK):**

```json
{
  "message": "User deleted successfully"
}
```

**Error Response (404):**

```json
{
  "error": "User not found"
}
```

---

### 6️⃣ POST /api/users/{id}/change-password

**Đổi mật khẩu**

**Method:** `POST`

**URL:** `http://localhost:8080/api/users/2/change-password`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Response (200 OK):**

```json
{
  "message": "Password changed successfully"
}
```

**Error Response (400):**

```json
{
  "error": "Old password is incorrect"
}
```

---

### 7️⃣ PATCH /api/users/{id}/toggle-status

**Bật/tắt trạng thái người dùng (Admin)**

**Method:** `PATCH`

**URL:** `http://localhost:8080/api/users/2/toggle-status`

**Headers:**

```
Content-Type: application/json
```

**Response (200 OK):**

```json
{
  "id": 2,
  "username": "customer1",
  "email": "customer1@gmail.com",
  "fullName": "Nguyễn Văn A",
  "phone": "0912345678",
  "address": "123 Nguyễn Huệ",
  "role": "customer",
  "status": 0
}
```

---

## 🧪 Ví dụ Test với cURL

### Lấy danh sách tất cả users

```bash
curl -X GET http://localhost:8080/api/users \
  -H "Content-Type: application/json"
```

### Thêm user mới

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@gmail.com",
    "fullName": "Người Dùng Mới",
    "phone": "0987654321",
    "address": "456 Lê Lợi",
    "role": "customer",
    "status": 1,
    "password": "password123"
  }'
```

### Cập nhật user

```bash
curl -X PUT http://localhost:8080/api/users/2 \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Văn A Updated",
    "phone": "0923456789",
    "role": "staff"
  }'
```

### Xóa user

```bash
curl -X DELETE http://localhost:8080/api/users/5 \
  -H "Content-Type: application/json"
```

### Đổi mật khẩu

```bash
curl -X POST http://localhost:8080/api/users/2/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

---

## 📝 HTTP Status Codes

| Code | Ý nghĩa                            |
| ---- | ---------------------------------- |
| 200  | OK - Thành công                    |
| 400  | Bad Request - Yêu cầu không hợp lệ |
| 404  | Not Found - Không tìm thấy         |
| 500  | Internal Server Error - Lỗi server |

---

## 🔒 Notes

- Tất cả endpoints đều có `@CrossOrigin` để hỗ trợ CORS
- Email phải là duy nhất trong hệ thống
- Status: `1` = hoạt động, `0` = không hoạt động
- Role: `customer`, `staff`, `admin`
- Mật khẩu mặc định khi tạo user mới là `password123`

---

## ✅ Frontend Integration

Các endpoints này đã được tích hợp vào màn hình **AdminUsersScreen.tsx** trên Expo/React Native:

- `GET /api/users` - Lấy danh sách người dùng
- `POST /api/users` - Thêm người dùng
- `PUT /api/users/{id}` - Cập nhật người dùng
- `DELETE /api/users/{id}` - Xóa người dùng

Frontend sử dụng `getApiUrl()` từ `config/network.ts` để kết nối.
