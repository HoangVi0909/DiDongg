package com.example.__NguyenHoangVi.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String password;

    @JsonProperty(value = "fullName", access = JsonProperty.Access.WRITE_ONLY)
    private String fullName;

    private String email;
    private String phone;
    private String address;
    private Integer status;

    @JsonProperty("role_id")
    private Long roleId;

    private String role; // Display field

    private String resetToken; // Mã xác nhận reset password
    private Long resetTokenExpiry; // Thời gian hết hạn của token (timestamp)

    @Transient
    private Boolean active;
}
