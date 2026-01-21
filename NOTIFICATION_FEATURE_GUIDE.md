# 📬 Hướng dẫn Chức Năng Gửi Thông Báo - Admin → Users

## ✅ Hoàn Thiện

**Backend (Spring Boot - localhost:8080):**

- ✅ `POST /api/admin/notifications/send` - Endpoint gửi thông báo
- ✅ `GET /api/admin/notifications/new` - Endpoint lấy thông báo mới

**Frontend (React Native - localhost:8081):**

- ✅ `AdminNotificationsScreen.tsx` - Giao diện admin gửi thông báo
- ✅ `AdminNotificationContext.tsx` - Logic quản lý thông báo (call API backend)
- ✅ `NotificationPoller.tsx` - Component polling thông báo mỗi 5 giây
- ✅ `NotificationContext.tsx` - Context lưu notifications cho users
- ✅ `_layout.tsx` - Tích hợp NotificationPoller

---

## 🧪 Cách Test

### Bước 1: Admin Gửi Thông Báo

1. Truy cập Admin Dashboard
2. Click menu **"Gửi thông báo"** (📢)
3. Điền form:
   - **Tiêu đề**: "Ưu đãi mới"
   - **Nội dung**: "Giảm 30% cho bánh mới"
   - **Loại**: Chọn "promotion" hoặc "news"
   - **Target**: Chọn "Tất cả users" (hoặc nhập SĐT cụ thể)
   - Click **"Gửi thông báo"**

### Bước 2: User Nhận Thông Báo

1. Đăng nhập vào app với tài khoản user
2. **Thông báo sẽ tự xuất hiện trong 5 giây** (NotificationPoller polling)
3. Vào trang **Thông báo** để xem chi tiết
4. Có thể đánh dấu đã đọc, xóa, v.v.

---

## 🔄 Quy Trình Hoạt Động

```
┌─────────────┐
│   Admin     │
└──────┬──────┘
       │ Gửi thông báo
       ↓
┌──────────────────────────────────────┐
│ AdminNotificationsScreen             │
│  - Điền form                         │
│  - Call POST /api/admin/notifications/send
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│ Backend (AdminController)            │
│  - Validate dữ liệu                  │
│  - Lưu vào notificationStore         │
│  - Return thành công                 │
└──────┬───────────────────────────────┘
       │
       ↓
   [Backend storage]
    (5 giây sau)
       ↑
┌──────────────────────────────────────┐
│ NotificationPoller (Client)          │
│  - Polling GET /api/admin/notifications/new
│  - Lọc notifications cho user        │
│  - Add vào NotificationContext       │
└──────┬───────────────────────────────┘
       │
       ↓
   [User nhận thông báo]
       │
       ↓
   Hiển thị ở Notification Screen
```

---

## 📋 API Endpoints

### 1. Gửi Thông Báo (Admin)

```bash
POST http://localhost:8080/api/admin/notifications/send

Body:
{
  "title": "Ưu đãi mới",
  "message": "Giảm 30%",
  "type": "promotion|update|alert|news",
  "targetUsers": "all|specific",
  "targetUserIds": ["0123456789"],  // nếu targetUsers = "specific"
  "imageUrl": "https://...",
  "actionUrl": "/ProductList"
}

Response:
{
  "message": "Gửi thông báo thành công",
  "notification": { ... }
}
```

### 2. Lấy Thông Báo Mới (User)

```bash
GET http://localhost:8080/api/admin/notifications/new?since=2024-01-21T12:00:00&userPhone=0123456789

Response:
[
  {
    "id": "uuid",
    "title": "Ưu đãi mới",
    "message": "Giảm 30%",
    "type": "promotion",
    "targetUsers": "all",
    "sentAt": "2024-01-21T12:05:30",
    "imageUrl": "...",
    "actionUrl": "..."
  }
]
```

---

## 🎯 Features Hiện Tại

✅ **Admin có thể:**

- Gửi thông báo cho tất cả users
- Gửi thông báo cho users cụ thể (theo SĐT)
- Chọn loại thông báo (promotion, update, alert, news)
- Thêm ảnh và action URL

✅ **Users sẽ:**

- Nhận thông báo mới tự động (polling mỗi 5s)
- Xem trong Notification Screen
- Đánh dấu đã đọc
- Xóa thông báo

---

## 🚀 Tương Lai

- [ ] **Database**: Lưu thông báo vào MySQL (thay vì memory store)
- [ ] **WebSocket**: Real-time notifications thay vì polling
- [ ] **Push Notifications**: Gửi push notification trên mobile
- [ ] **Scheduling**: Lập lịch gửi thông báo tương lai
- [ ] **Templates**: Tạo template thông báo có sẵn

---

## 🐛 Troubleshooting

| Vấn đề                    | Nguyên nhân             | Giải pháp                                 |
| ------------------------- | ----------------------- | ----------------------------------------- |
| Thông báo không xuất hiện | User chưa đăng nhập     | Đăng nhập trước khi gửi                   |
| Polling timeout           | Backend không hoạt động | Kiểm tra `localhost:8080/api/admin/stats` |
| Type error ở userPhone    | userPhone chưa được set | Đảm bảo user đã đăng nhập lưu SĐT         |

---

## 📱 Files Được Sửa/Tạo

1. **Backend:**
   - `AdminController.java` - Thêm 2 endpoints

2. **Frontend:**
   - `NotificationPoller.tsx` - NEW (polling component)
   - `AdminNotificationContext.tsx` - Updated (call API)
   - `_layout.tsx` - Updated (thêm NotificationPoller)

---

**Status: ✅ READY FOR TESTING**
