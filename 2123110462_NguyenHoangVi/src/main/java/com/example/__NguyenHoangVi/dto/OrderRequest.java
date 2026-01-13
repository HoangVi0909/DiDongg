package com.example.__NguyenHoangVi.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private String customerName;
    private String phone;
    private String address;
    private String paymentMethod;
    private String status;
    private Double totalAmount;
    private String transactionCode; // Mã giao dịch ngân hàng
    private List<OrderItem> items;

    @Data
    public static class OrderItem {
        private Long productId;
        private String productName;
        private Integer quantity;
        private Double price;
    }
}
