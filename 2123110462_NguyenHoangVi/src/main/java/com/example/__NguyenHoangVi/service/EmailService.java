package com.example.__NguyenHoangVi.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendResetPasswordEmail(String toEmail, String resetToken) {
        try {
            if (mailSender == null) {
                System.out.println("⚠️ EMAIL SERVICE CHƯA ĐƯỢC CẤU HÌNH");
                System.out.println("📧 EMAIL: " + toEmail);
                System.out.println("🔐 TOKEN: " + resetToken);
                System.out.println("⏰ HẾT HẠN: 15 phút từ bây giờ");
                System.out.println("\n✅ Vui lòng cấu hình Gmail trong application.properties:");
                System.out.println("   1. Vào https://myaccount.google.com/apppasswords");
                System.out.println("   2. Lấy App Password (16 ký tự)");
                System.out.println("   3. Sửa spring.mail.username + spring.mail.password");
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@candyshop.com");
            message.setTo(toEmail);
            message.setSubject("🍬 Candy Shop - Xác nhận đổi mật khẩu");

            String emailContent = String.format(
                    "Xin chào,\n\n" +
                            "Bạn vừa yêu cầu đổi mật khẩu cho tài khoản Candy Shop.\n\n" +
                            "Mã xác nhận của bạn là: %s\n\n" +
                            "Mã này sẽ hết hạn trong 15 phút.\n\n" +
                            "Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.\n\n" +
                            "Trân trọng,\nCandy Shop Team",
                    resetToken);
            message.setText(emailContent);

            mailSender.send(message);
            System.out.println("✅ Email gửi thành công đến: " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Lỗi gửi email: " + e.getMessage());
            System.err.println("💡 Kiểm tra cấu hình Gmail trong application.properties");
            e.printStackTrace();
        }
    }
}
