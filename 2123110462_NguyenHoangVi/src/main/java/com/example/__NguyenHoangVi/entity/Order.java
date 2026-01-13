package com.example.__NguyenHoangVi.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;
    private String customerName;
    private String phone;
    private String address;
    private String orderChannel;
    private String paymentMethod;
    private Double totalAmount;
    private String status;
    private String transactionCode; // Mã giao dịch ngân hàng

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
