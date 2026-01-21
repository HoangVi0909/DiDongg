# 🧪 Testing API User Management

## Test Cases cho User Management API

### ✅ Test 1: Lấy danh sách tất cả users

**Endpoint:** `GET /api/users`

```bash
curl -X GET http://localhost:8080/api/users \
  -H "Content-Type: application/json"
```

**Expected Status:** 200
**Expected Response:** Array of users

---

### ✅ Test 2: Thêm user mới

**Endpoint:** `POST /api/users`

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "email": "testuser1@gmail.com",
    "fullName": "Test User 1",
    "phone": "0987654321",
    "address": "123 Test Street",
    "role": "customer",
    "status": 1,
    "password": "test123456"
  }'
```

**Expected Status:** 200
**Expected Response:**

```json
{
  "id": 3,
  "username": "testuser1",
  "email": "testuser1@gmail.com",
  "fullName": "Test User 1",
  "phone": "0987654321",
  "address": "123 Test Street",
  "role": "customer",
  "status": 1
}
```

---

### ✅ Test 3: Thêm user với email đã tồn tại (Should fail)

**Endpoint:** `POST /api/users`

```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "testuser1@gmail.com",
    "fullName": "Test User 2",
    "phone": "0987654322",
    "address": "124 Test Street",
    "role": "customer",
    "status": 1
  }'
```

**Expected Status:** 400
**Expected Response:**

```json
{
  "error": "Email already exists"
}
```

---

### ✅ Test 4: Lấy user theo ID

**Endpoint:** `GET /api/users/3`

```bash
curl -X GET http://localhost:8080/api/users/3 \
  -H "Content-Type: application/json"
```

**Expected Status:** 200
**Expected Response:**

```json
{
  "id": 3,
  "username": "testuser1",
  "email": "testuser1@gmail.com",
  "fullName": "Test User 1",
  "phone": "0987654321",
  "address": "123 Test Street",
  "role": "customer",
  "status": 1
}
```

---

### ✅ Test 5: Lấy user với ID không tồn tại (Should fail)

**Endpoint:** `GET /api/users/999`

```bash
curl -X GET http://localhost:8080/api/users/999 \
  -H "Content-Type: application/json"
```

**Expected Status:** 404
**Expected Response:**

```json
{
  "error": "User not found"
}
```

---

### ✅ Test 6: Cập nhật user

**Endpoint:** `PUT /api/users/3`

```bash
curl -X PUT http://localhost:8080/api/users/3 \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User Updated",
    "phone": "0912345678",
    "role": "staff",
    "status": 1
  }'
```

**Expected Status:** 200
**Expected Response:**

```json
{
  "id": 3,
  "username": "testuser1",
  "email": "testuser1@gmail.com",
  "fullName": "Test User Updated",
  "phone": "0912345678",
  "address": "123 Test Street",
  "role": "staff",
  "status": 1
}
```

---

### ✅ Test 7: Cập nhật email sang email đã tồn tại (Should fail)

**Endpoint:** `PUT /api/users/3`

```bash
curl -X PUT http://localhost:8080/api/users/3 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@shop.com"
  }'
```

**Expected Status:** 400
**Expected Response:**

```json
{
  "error": "Email already in use"
}
```

---

### ✅ Test 8: Cập nhật user không tồn tại (Should fail)

**Endpoint:** `PUT /api/users/999`

```bash
curl -X PUT http://localhost:8080/api/users/999 \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Non-existent User"
  }'
```

**Expected Status:** 400 (từ service) hoặc 404
**Expected Response:**

```json
{
  "error": "User not found"
}
```

---

### ✅ Test 9: Đổi mật khẩu

**Endpoint:** `POST /api/users/3/change-password`

```bash
curl -X POST http://localhost:8080/api/users/3/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "test123456",
    "newPassword": "newpassword789"
  }'
```

**Expected Status:** 200
**Expected Response:**

```json
{
  "message": "Password changed successfully"
}
```

---

### ✅ Test 10: Đổi mật khẩu với mật khẩu cũ sai (Should fail)

**Endpoint:** `POST /api/users/3/change-password`

```bash
curl -X POST http://localhost:8080/api/users/3/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "wrongpassword",
    "newPassword": "another"
  }'
```

**Expected Status:** 400
**Expected Response:**

```json
{
  "error": "Old password is incorrect"
}
```

---

### ✅ Test 11: Toggle user status

**Endpoint:** `PATCH /api/users/3/toggle-status`

```bash
curl -X PATCH http://localhost:8080/api/users/3/toggle-status \
  -H "Content-Type: application/json"
```

**Expected Status:** 200
**Expected Response:** User với status thay đổi từ 1 → 0 hoặc ngược lại

```json
{
  "id": 3,
  "username": "testuser1",
  "email": "testuser1@gmail.com",
  "fullName": "Test User Updated",
  "phone": "0912345678",
  "address": "123 Test Street",
  "role": "staff",
  "status": 0
}
```

---

### ✅ Test 12: Xóa user

**Endpoint:** `DELETE /api/users/3`

```bash
curl -X DELETE http://localhost:8080/api/users/3 \
  -H "Content-Type: application/json"
```

**Expected Status:** 200
**Expected Response:**

```json
{
  "message": "User deleted successfully"
}
```

---

### ✅ Test 13: Xóa user đã xóa (Should fail)

**Endpoint:** `DELETE /api/users/3`

```bash
curl -X DELETE http://localhost:8080/api/users/3 \
  -H "Content-Type: application/json"
```

**Expected Status:** 400 (từ service) hoặc 404
**Expected Response:**

```json
{
  "error": "User not found"
}
```

---

## 📊 Summary

| Test | Endpoint                     | Method | Status   |
| ---- | ---------------------------- | ------ | -------- |
| 1    | GET /api/users               | GET    | ✅       |
| 2    | POST /api/users              | POST   | ✅       |
| 3    | POST (duplicate email)       | POST   | ✅ Error |
| 4    | GET /api/users/{id}          | GET    | ✅       |
| 5    | GET /api/users (not found)   | GET    | ✅ Error |
| 6    | PUT /api/users/{id}          | PUT    | ✅       |
| 7    | PUT (duplicate email)        | PUT    | ✅ Error |
| 8    | PUT (not found)              | PUT    | ✅ Error |
| 9    | POST change-password         | POST   | ✅       |
| 10   | POST change-password (wrong) | POST   | ✅ Error |
| 11   | PATCH toggle-status          | PATCH  | ✅       |
| 12   | DELETE /api/users/{id}       | DELETE | ✅       |
| 13   | DELETE (already deleted)     | DELETE | ✅ Error |

---

## 🔗 Integration Check

Frontend AdminUsersScreen.tsx uses:

- ✅ `GET /api/users` - Fetch all users on screen load
- ✅ `POST /api/users` - Add new user
- ✅ `PUT /api/users/{id}` - Update user
- ✅ `DELETE /api/users/{id}` - Delete user
- ✅ Sidebar navigation to access this screen
- ✅ Toast notifications for success/error feedback
