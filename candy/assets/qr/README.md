# Hướng dẫn thêm QR Code Ngân hàng

## Bước 1: Lấy QR Code của bạn

### Cách 1: Tạo QR tĩnh từ app ngân hàng

1. Mở app ngân hàng Timo
2. Vào mục **Nhận tiền** hoặc **Tạo mã QR**
3. Chọn **QR tĩnh** (không có số tiền cố định)
4. Lưu hình ảnh QR code

### Cách 2: Sử dụng VietQR

1. Truy cập: https://vietqr.io/
2. Chọn ngân hàng: **Timo**
3. Nhập số tài khoản: **0702812941**
4. Nhập tên: **NGUYENHOANGVI**
5. Click **Tạo mã QR** và tải về

## Bước 2: Thêm hình vào dự án

1. Đổi tên file QR code thành: `bank-qr.png`
2. Copy file vào thư mục: `d:\Java\candy\assets\qr\`
3. Reload app Expo (shake điện thoại → Reload)

## Lưu ý quan trọng

⚠️ **QR code tĩnh** chỉ chứa thông tin:

- Số tài khoản
- Tên người nhận
- Ngân hàng

✅ Khách hàng sẽ phải **tự nhập số tiền** khi chuyển khoản

💡 **Khuyến nghị**:

- Hiển thị rõ số tiền cần chuyển trên màn hình
- Yêu cầu khách chụp màn hình xác nhận chuyển khoản
- Hoặc xem xét nâng cấp lên tài khoản doanh nghiệp có API callback

## File cần thay thế

```
assets/
  qr/
    bank-qr.png  ← Đặt QR code của bạn vào đây
    README.md
```
