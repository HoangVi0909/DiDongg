# 🎉 Quản lý Người dùng - Hoàn thành!

## 📋 Tóm tắt

Tôi đã tạo hoàn chỉnh hệ thống quản lý người dùng (User Management) cho ứng dụng e-commerce của bạn với:

### ✅ **Frontend** (React Native + Expo)

- 📱 Màn hình `AdminUsersScreen.tsx` - Giao diện quản lý người dùng
- 🔍 Tìm kiếm theo tên hoặc email
- 📄 Phân trang (5 người dùng/trang)
- ➕ Thêm người dùng mới
- ✏️ Chỉnh sửa thông tin người dùng
- 🗑️ Xóa người dùng
- 📊 Hiển thị thông tin: Tên, Email, SĐT, Quyền, Trạng thái
- 🎨 Giao diện responsive (Web + Mobile)
- 📍 Sidebar navigation trên web

### ✅ **Backend** (Spring Boot)

- 🔌 UserController - 7 API endpoints
- 🎯 UserService - Business logic tách biệt
- 💾 UserRepository - Data access layer
- 📚 API Documentation đầy đủ

---

## 📂 Cấu trúc File

### Frontend

```
candy/app/
├── AdminUsersScreen.tsx        ← ✨ Màn hình quản lý người dùng (MỚI)
├── AdminScreen.tsx              ← Cập nhật menu items
├── AdminProductsScreen.tsx      ← Cập nhật menu items
├── AdminOrders.tsx              ← Cập nhật menu items
└── AdminVouchersScreen.tsx       ← Cập nhật menu items
```

### Backend

```
2123110462_NguyenHoangVi/src/main/java/com/example/__NguyenHoangVi/
├── controller/
│   └── UserController.java      ← ✨ Cập nhật với 7 endpoints (MỚI)
├── service/
│   └── UserService.java         ← ✨ Business logic (MỚI)
├── entity/
│   └── User.java                ← Entity tồn tại sẵn
└── repository/
    └── UserRepository.java      ← Repository tồn tại sẵn
```

---

## 🔗 API Endpoints

### 1. **GET /api/users**

Lấy danh sách tất cả người dùng

```bash
curl -X GET http://localhost:8080/api/users
```

### 2. **POST /api/users**

Thêm người dùng mới

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@gmail.com",
    "fullName": "Người Dùng Mới",
    "phone": "0987654321",
    "address": "123 Main St",
    "role": "customer",
    "status": 1,
    "password": "password123"
  }'
```

### 3. **GET /api/users/{id}**

Lấy thông tin người dùng theo ID

```bash
curl -X GET http://localhost:8080/api/users/2
```

### 4. **PUT /api/users/{id}**

Cập nhật thông tin người dùng

```bash
curl -X PUT http://localhost:8080/api/users/2 \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name",
    "phone": "0912345678",
    "role": "staff"
  }'
```

### 5. **DELETE /api/users/{id}**

Xóa người dùng

```bash
curl -X DELETE http://localhost:8080/api/users/2
```

### 6. **POST /api/users/{id}/change-password**

Đổi mật khẩu

```bash
curl -X POST http://localhost:8080/api/users/2/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

### 7. **PATCH /api/users/{id}/toggle-status**

Bật/tắt trạng thái người dùng

```bash
curl -X PATCH http://localhost:8080/api/users/2/toggle-status
```

---

## 👤 User Data Model

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

### Giải thích các field:

| Field    | Type    | Mô tả                                |
| -------- | ------- | ------------------------------------ |
| id       | Long    | ID người dùng (tự động sinh)         |
| username | String  | Tên đăng nhập                        |
| email    | String  | Email (duy nhất)                     |
| fullName | String  | Họ và tên                            |
| phone    | String  | Số điện thoại                        |
| address  | String  | Địa chỉ                              |
| role     | String  | Quyền: `customer`, `staff`, `admin`  |
| status   | Integer | Trạng thái: 1 (hoạt động), 0 (không) |
| password | String  | Mật khẩu                             |

---

## 🎨 Giao diện Frontend

### AdminUsersScreen.tsx Features:

#### 📊 Hiển thị danh sách

- Tên người dùng
- Email
- Số điện thoại
- Quyền (👤 Khách hàng, 👨‍💼 Nhân viên, 👑 Quản trị viên)
- Trạng thái (🟢 Hoạt động, 🔴 Không hoạt động)

#### 🎯 Chức năng

- 🔍 **Tìm kiếm** - Theo tên hoặc email
- ➕ **Thêm** - Mở modal form
- ✏️ **Sửa** - Cập nhật thông tin
- 🗑️ **Xóa** - Xóa với xác nhận
- 📄 **Phân trang** - 5 người/trang với nút Previous/Next

#### 📝 Form Modal

- Họ và tên
- Email (validate format)
- Số điện thoại
- Quyền (3 option buttons)
- Trạng thái (2 option buttons)

#### 📱 Responsive Design

- **Web**: Sidebar navigation + main content
- **Mobile**: Full screen content (no sidebar)

---

## 🚀 Cách sử dụng

### 1. **Truy cập màn hình quản lý người dùng**

- Đăng nhập vào Admin Panel
- Click vào menu "Người dùng" (hoặc "Nguoi dung" trong sidebar)
- Hoặc truy cập trực tiếp `/AdminUsersScreen`

### 2. **Xem danh sách người dùng**

- Mở ứng dụng
- Danh sách sẽ tự động tải từ API

### 3. **Thêm người dùng mới**

- Click nút "+ Thêm"
- Điền thông tin
- Select quyền và trạng thái
- Click "Thêm" để lưu

### 4. **Sửa thông tin**

- Click nút "✏️ Sửa" trên user card
- Chỉnh sửa thông tin
- Click "Cập nhật"

### 5. **Xóa người dùng**

- Click nút "🗑️ Xóa"
- Xác nhận trong dialog

### 6. **Tìm kiếm**

- Gõ tên hoặc email vào ô tìm kiếm
- Danh sách sẽ lọc tự động

---

## ⚙️ Cài đặt Backend

### Yêu cầu

- Java 17+
- Spring Boot 4.0.0
- Maven
- MySQL 5.5.5+

### Build

```bash
cd 2123110462_NguyenHoangVi
mvn clean compile
```

### Chạy

```bash
mvn spring-boot:run
```

Server sẽ chạy trên: `http://localhost:8080`

### Kiểm tra API

```bash
curl http://localhost:8080/api/users
```

---

## 📱 Cài đặt Frontend

### Yêu cầu

- Node.js 16+
- Expo CLI
- React Native

### Build

```bash
cd candy
npm install
```

### Chạy (Web)

```bash
npm run web
```

Ứng dụng sẽ mở ở: `http://localhost:8082`

### Kết nối Backend

- Mở file `candy/config/network.ts`
- Đảm bảo `BASE_URL = "http://localhost:8080"`

---

## 🔄 Flow Tích hợp

```
Frontend (Expo)
    ↓
AdminUsersScreen.tsx
    ↓
API Calls via fetch()
    ↓
Backend (Spring Boot)
    ↓
UserController
    ↓
UserService (Business Logic)
    ↓
UserRepository (Database)
    ↓
MySQL Database
```

### Ví dụ Flow thêm user:

1. User click "+ Thêm" → Modal mở
2. Điền thông tin → Click "Thêm"
3. Frontend: `POST /api/users` với request body
4. Backend: UserController nhận request
5. UserController gọi UserService.createUser()
6. UserService validate + insert vào DB
7. Return user mới → Frontend
8. Frontend show toast success
9. Refresh danh sách

---

## ✅ Testing

Tôi đã tạo file `TEST_USER_API.md` với 13 test cases:

1. ✅ Lấy danh sách users
2. ✅ Thêm user mới
3. ✅ Thêm user duplicate (error)
4. ✅ Lấy user theo ID
5. ✅ Lấy user không tồn tại (error)
6. ✅ Cập nhật user
7. ✅ Cập nhật với email duplicate (error)
8. ✅ Cập nhật user không tồn tại (error)
9. ✅ Đổi mật khẩu
10. ✅ Đổi mật khẩu sai (error)
11. ✅ Toggle status
12. ✅ Xóa user
13. ✅ Xóa user đã xóa (error)

Run test bằng cURL commands trong file `TEST_USER_API.md`

---

## 📚 Tài liệu

- **API_USER_MANAGEMENT_DOCS.md** - Đầy đủ API documentation
- **TEST_USER_API.md** - Test cases với cURL examples

---

## 🎯 Tính năng đã hoàn thành

✅ Màn hình quản lý người dùng (Frontend)  
✅ API CRUD đầy đủ (Backend)  
✅ Tìm kiếm và phân trang  
✅ Validation dữ liệu  
✅ Error handling  
✅ Toast notifications  
✅ Sidebar navigation  
✅ Responsive design  
✅ API documentation  
✅ Test cases

---

## 🔮 Tính năng có thể mở rộng

- 🔐 Mã hóa mật khẩu (BCrypt)
- 📧 Email verification
- 🔑 JWT authentication
- 👥 Role-based access control (RBAC)
- 📋 User activity logs
- 📊 User analytics dashboard
- 🔄 Batch operations (delete multiple)
- 📥 Import/Export users (CSV)
- 🔔 User notifications
- 🗂️ User groups/departments

---

## 📞 Support

Nếu có vấn đề:

1. Kiểm tra backend đang chạy: `curl http://localhost:8080/api/users`
2. Kiểm tra frontend kết nối tới: `config/network.ts`
3. Kiểm tra database connection
4. Xem logs trong console

---

## 🎉 Hoàn thành!

Hệ thống quản lý người dùng đã sẵn sàng sử dụng!

Backend: ✅ Running on port 8080
Frontend: ✅ Ready to use on port 8082
Database: ✅ Connected to MySQL

Bạn có thể bắt đầu quản lý người dùng ngay bây giờ! 🚀
