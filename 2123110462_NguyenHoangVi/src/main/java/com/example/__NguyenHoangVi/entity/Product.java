package com.example.__NguyenHoangVi.entity;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "products")
@Data
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    private Integer stockQuantity;

    @JsonProperty("image")
    private String image;

    @JsonProperty("imageUrl")
    @Transient
    public String getImageUrl() {
        return this.image;
    }

    @Column(name = "category_id")
    @JsonProperty("categoryId")
    private Long categoryId;

    @Column(name = "brand_id")
    @JsonProperty("brandId")
    private Long brandId;

    private Integer status;
}
